import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { ConfigDto } from "@lib/network/swagger-client";
import { isCodeEditorLineNumbersEnabled } from "@utils/config-helpers";
import { analyzeInsertionContext } from "./image-insertion";

// Types for image upload
export interface ImageUploadHandler {
  (file: File): Promise<string>;
}

export interface ImageUploadError {
  message: string;
  file: File;
  details?: string[];
}

export interface ImageUploadCallbacks {
  onUploadStart?: (file: File) => void;
  onUploadSuccess?: (file: File, url: string) => void;
  onUploadError?: (error: ImageUploadError) => void;
  onBeforePlaceholder?: (file: File) => void;
  onAllUploadsComplete?: (hadSuccess: boolean, finalContent: string) => void;
}

/**
 * Creates an extension that hides line numbers using CSS
 */
const hideLineNumbers = (): Extension => {
  return EditorView.theme({
    ".cm-lineNumbers": {
      display: "none !important",
      width: "0 !important",
    },
    ".cm-gutters": {
      display: "none !important",
      width: "0 !important",
    },
    // Also target the specific gutter for line numbers
    ".cm-gutter.cm-lineNumbers": {
      display: "none !important",
      width: "0 !important",
    },
  });
};

/**
 * Shared pipeline used by drag-drop and paste handlers: insert "Uploading …"
 * placeholders at `pos`, upload each file, then swap each placeholder with
 * the final markdown image. Mirrors the behaviour of the original drag-drop
 * extension so both entry points stay consistent.
 */
const uploadImagesAtPos = (
  view: EditorView,
  imageFiles: File[],
  pos: number,
  uploadHandler: ImageUploadHandler,
  callbacks?: ImageUploadCallbacks
): void => {
  let completedUploads = 0;
  let successfulUploads = 0;
  const totalUploads = imageFiles.length;

  // Notify once before any content modification - this sets pendingChanges to true
  if (imageFiles.length > 0) {
    callbacks?.onBeforePlaceholder?.(imageFiles[0]);
  }

  // Defer placeholder insertion so React state updates (pendingChanges) flush
  // before the document mutation triggers onChange.
  setTimeout(() => {
    const placeholders = imageFiles.map((file) => `![Uploading ${file.name}...]()`).join("\n");
    view.dispatch({
      changes: { from: pos, insert: placeholders },
      selection: { anchor: pos + placeholders.length },
    });
  }, 0);

  imageFiles.forEach(async (file) => {
    const placeholder = `![Uploading ${file.name}...]()`;
    try {
      callbacks?.onUploadStart?.(file);

      const imageUrl = await uploadHandler(file);
      const altText = file.name.replace(/\.[^/.]+$/, "");
      const finalMarkdown = `![${altText}](${imageUrl})`;

      const currentDoc = view.state.doc.toString();
      const placeholderIndex = currentDoc.indexOf(placeholder);
      if (placeholderIndex !== -1) {
        const replaceStart = placeholderIndex;
        const replaceEnd = placeholderIndex + placeholder.length;
        view.dispatch({
          changes: { from: replaceStart, to: replaceEnd, insert: finalMarkdown },
          selection: { anchor: replaceStart + finalMarkdown.length },
        });
      }

      successfulUploads++;
      callbacks?.onUploadSuccess?.(file, imageUrl);
    } catch (error) {
      // Remove placeholder on error - restores original content.
      const currentDoc = view.state.doc.toString();
      const placeholderIndex = currentDoc.indexOf(placeholder);
      if (placeholderIndex !== -1) {
        const replaceStart = placeholderIndex;
        let replaceEnd = placeholderIndex + placeholder.length;

        const hasPlaceholderBefore =
          placeholderIndex > 0 && currentDoc.substring(0, placeholderIndex).includes("![Uploading");
        const hasPlaceholderAfter = currentDoc.substring(replaceEnd).includes("![Uploading");

        if (currentDoc[replaceEnd] === "\n" && hasPlaceholderAfter) {
          replaceEnd++;
        } else if (
          placeholderIndex > 0 &&
          currentDoc[placeholderIndex - 1] === "\n" &&
          hasPlaceholderBefore
        ) {
          view.dispatch({
            changes: { from: placeholderIndex - 1, to: replaceEnd, insert: "" },
          });
          completedUploads++;
          if (completedUploads === totalUploads) {
            const finalContent = view.state.doc.toString();
            callbacks?.onAllUploadsComplete?.(successfulUploads > 0, finalContent);
          }
          return;
        }

        view.dispatch({
          changes: { from: replaceStart, to: replaceEnd, insert: "" },
        });
      }

      const errorDetails: string[] = [];
      if (error && typeof error === "object" && "details" in error) {
        const detailedError = error as { details?: string[] };
        if (detailedError.details && Array.isArray(detailedError.details)) {
          errorDetails.push(...detailedError.details);
        }
      }

      callbacks?.onUploadError?.({
        message: error instanceof Error ? error.message : "Upload failed",
        file,
        ...(errorDetails.length > 0 && { details: errorDetails }),
      } as ImageUploadError);
    } finally {
      completedUploads++;
      if (completedUploads === totalUploads) {
        const finalContent = view.state.doc.toString();
        callbacks?.onAllUploadsComplete?.(successfulUploads > 0, finalContent);
      }
    }
  });
};

/** Extract image `File`s from a DataTransfer (both `files` and `items`). */
const extractImageFiles = (data: DataTransfer | null): File[] => {
  if (!data) return [];
  const out: File[] = [];
  const seen = new Set<string>();

  if (data.files && data.files.length > 0) {
    for (const file of Array.from(data.files)) {
      if (file.type.startsWith("image/")) {
        const key = `${file.name}:${file.size}:${file.lastModified}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push(file);
        }
      }
    }
  }

  if (out.length === 0 && data.items) {
    // Raw bitmaps (e.g. screenshots) only appear in `items`.
    for (const item of Array.from(data.items)) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const ext = file.type.split("/")[1] || "png";
          const named =
            file.name && file.name !== "image.png"
              ? file
              : new File([file], `pasted-${Date.now()}.${ext}`, { type: file.type });
          out.push(named);
        }
      }
    }
  }

  return out;
};

/**
 * Upload a single file and swap a sentinel token in the doc with the final
 * URL. Used for context-aware paste (caret inside quotes / parens) where we
 * must not emit `![alt](url)` markdown but just the URL itself.
 */
const uploadImageAsUrlReplacement = (
  view: EditorView,
  file: File,
  range: { from: number; to: number },
  uploadHandler: ImageUploadHandler,
  callbacks?: ImageUploadCallbacks
): void => {
  const token = `__uploading_${Date.now()}_${Math.random().toString(36).slice(2, 8)}__`;

  callbacks?.onBeforePlaceholder?.(file);

  setTimeout(() => {
    view.dispatch({
      changes: { from: range.from, to: range.to, insert: token },
      selection: { anchor: range.from + token.length },
    });
  }, 0);

  (async () => {
    let success = false;
    try {
      callbacks?.onUploadStart?.(file);
      const imageUrl = await uploadHandler(file);

      const currentDoc = view.state.doc.toString();
      const tokenIndex = currentDoc.indexOf(token);
      if (tokenIndex !== -1) {
        view.dispatch({
          changes: { from: tokenIndex, to: tokenIndex + token.length, insert: imageUrl },
          selection: { anchor: tokenIndex + imageUrl.length },
        });
      }
      success = true;
      callbacks?.onUploadSuccess?.(file, imageUrl);
    } catch (error) {
      // Remove the sentinel on failure.
      const currentDoc = view.state.doc.toString();
      const tokenIndex = currentDoc.indexOf(token);
      if (tokenIndex !== -1) {
        view.dispatch({
          changes: { from: tokenIndex, to: tokenIndex + token.length, insert: "" },
        });
      }

      const errorDetails: string[] = [];
      if (error && typeof error === "object" && "details" in error) {
        const detailedError = error as { details?: string[] };
        if (detailedError.details && Array.isArray(detailedError.details)) {
          errorDetails.push(...detailedError.details);
        }
      }

      callbacks?.onUploadError?.({
        message: error instanceof Error ? error.message : "Upload failed",
        file,
        ...(errorDetails.length > 0 && { details: errorDetails }),
      } as ImageUploadError);
    } finally {
      const finalContent = view.state.doc.toString();
      callbacks?.onAllUploadsComplete?.(success, finalContent);
    }
  })();
};

/**
 * Creates an extension that handles image paste (both files and raw bitmaps).
 */
const createImagePasteExtension = (
  uploadHandler: ImageUploadHandler,
  callbacks?: ImageUploadCallbacks
): Extension => {
  return EditorView.domEventHandlers({
    paste: (event, view) => {
      const imageFiles = extractImageFiles(event.clipboardData);
      if (imageFiles.length === 0) return false;

      event.preventDefault();
      const pos = view.state.selection.main.head;

      // Context-aware: if caret is inside `"…"` / `(…)` / an existing URL
      // token, paste the URL only (replacing the target range). Multi-file
      // paste falls back to regular markdown insertion.
      if (imageFiles.length === 1) {
        const ctx = analyzeInsertionContext(view.state.doc.toString(), pos);
        if (ctx.kind !== "none") {
          uploadImageAsUrlReplacement(
            view,
            imageFiles[0],
            { from: ctx.from, to: ctx.to },
            uploadHandler,
            callbacks
          );
          return true;
        }
      }

      uploadImagesAtPos(view, imageFiles, pos, uploadHandler, callbacks);
      return true;
    },
  });
};

/**
 * Creates an extension that handles image drag and drop functionality
 */
const createImageDragDropExtension = (
  uploadHandler: ImageUploadHandler,
  callbacks?: ImageUploadCallbacks
): Extension => {
  return EditorView.domEventHandlers({
    dragover: (event) => {
      // Check if the dragged items contain files
      const hasFiles = event.dataTransfer?.types?.includes("Files");
      if (hasFiles) {
        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "copy";
        }
      }
    },

    dragenter: (event) => {
      const hasFiles = event.dataTransfer?.types?.includes("Files");
      if (hasFiles) {
        event.preventDefault();
      }
    },

    drop: (event, view) => {
      const imageFiles = extractImageFiles(event.dataTransfer);
      if (imageFiles.length === 0) {
        return false; // Let default handling proceed for non-image files
      }

      event.preventDefault();

      // Get the drop position
      const coords = { x: event.clientX, y: event.clientY };
      const pos = view.posAtCoords(coords);

      if (pos === null) {
        return true; // Handled but couldn't determine position
      }

      uploadImagesAtPos(view, imageFiles, pos, uploadHandler, callbacks);
      return true;
    },
  });
};

/**
 * Build CodeMirror extensions for source mode with conditional features
 * Uses CSS to hide line numbers when disabled in configuration
 * Adds drag & drop support for images when upload handler is provided
 */
export const buildSourceModeExtensions = (
  config: ConfigDto | null,
  imageUploadHandler?: ImageUploadHandler,
  uploadCallbacks?: ImageUploadCallbacks
): Extension[] => {
  const extensions: Extension[] = [];

  // Add line number hiding if disabled
  if (!isCodeEditorLineNumbersEnabled(config)) {
    extensions.push(hideLineNumbers());
  }

  // Add drag & drop + clipboard paste support if upload handler is provided
  if (imageUploadHandler) {
    extensions.push(createImageDragDropExtension(imageUploadHandler, uploadCallbacks));
    extensions.push(createImagePasteExtension(imageUploadHandler, uploadCallbacks));
  }

  return extensions;
};

export { extractImageFiles, uploadImagesAtPos };

/**
 * Build CodeMirror extensions for code block editors with conditional line numbers
 * Uses CSS to hide line numbers when disabled in configuration
 */
export const buildCodeBlockExtensions = (
  config: ConfigDto | null,
  additionalExtensions: Extension[] = []
): Extension[] => {
  const extensions = [...additionalExtensions];

  if (!isCodeEditorLineNumbersEnabled(config)) {
    extensions.push(hideLineNumbers());
  }

  return extensions;
};
