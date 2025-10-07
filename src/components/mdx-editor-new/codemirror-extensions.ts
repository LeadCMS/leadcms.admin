import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { ConfigDto } from "@lib/network/swagger-client";
import { isCodeEditorLineNumbersEnabled } from "@utils/config-helpers";

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
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) {
        return false;
      }

      // Filter for image files only
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));

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

      // Track upload progress
      let completedUploads = 0;
      let successfulUploads = 0;
      const totalUploads = imageFiles.length;

      // Notify once before any content modification - this sets pendingChanges to true
      if (imageFiles.length > 0) {
        callbacks?.onBeforePlaceholder?.(imageFiles[0]);
      }

      // Use setTimeout to ensure state updates before inserting placeholders
      setTimeout(() => {
        // Insert all placeholders at once with newlines
        const placeholders = imageFiles.map((file) => `![Uploading ${file.name}...]()`).join("\n");

        view.dispatch({
          changes: {
            from: pos,
            insert: placeholders,
          },
          selection: { anchor: pos + placeholders.length },
        });
      }, 0);

      // Handle each image file
      imageFiles.forEach(async (file) => {
        try {
          callbacks?.onUploadStart?.(file);

          // The placeholder is already inserted above
          const placeholder = `![Uploading ${file.name}...]()`;

          // Upload the file
          const imageUrl = await uploadHandler(file);

          // Replace placeholder with actual markdown
          const altText = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
          const finalMarkdown = `![${altText}](${imageUrl})`;

          // Find the placeholder in current document and replace it
          const currentDoc = view.state.doc.toString();
          const placeholderIndex = currentDoc.indexOf(placeholder);

          if (placeholderIndex !== -1) {
            const replaceStart = placeholderIndex;
            const replaceEnd = placeholderIndex + placeholder.length;

            view.dispatch({
              changes: {
                from: replaceStart,
                to: replaceEnd,
                insert: finalMarkdown,
              },
              selection: { anchor: replaceStart + finalMarkdown.length },
            });
          }

          successfulUploads++;
          callbacks?.onUploadSuccess?.(file, imageUrl);
        } catch (error) {
          // Remove placeholder on error - this restores original content
          const currentDoc = view.state.doc.toString();
          const placeholder = `![Uploading ${file.name}...]()`;
          const placeholderIndex = currentDoc.indexOf(placeholder);

          if (placeholderIndex !== -1) {
            const replaceStart = placeholderIndex;
            let replaceEnd = placeholderIndex + placeholder.length;

            // Only remove newlines that were added by us (part of multi-image upload)
            // Check if there's another placeholder before or after this one
            const hasPlaceholderBefore =
              placeholderIndex > 0 &&
              currentDoc.substring(0, placeholderIndex).includes("![Uploading");
            const hasPlaceholderAfter = currentDoc.substring(replaceEnd).includes("![Uploading");

            // If there's a newline after and another placeholder after, remove the newline
            if (currentDoc[replaceEnd] === "\n" && hasPlaceholderAfter) {
              replaceEnd++;
            }
            // If there's a newline before and another placeholder before, remove newline before
            else if (
              placeholderIndex > 0 &&
              currentDoc[placeholderIndex - 1] === "\n" &&
              hasPlaceholderBefore
            ) {
              view.dispatch({
                changes: {
                  from: placeholderIndex - 1,
                  to: replaceEnd,
                  insert: "",
                },
              });
              return; // Early return since we already dispatched
            }

            view.dispatch({
              changes: {
                from: replaceStart,
                to: replaceEnd,
                insert: "",
              },
            });
          }

          // Extract detailed error information if available
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

          // Check if all uploads are complete
          if (completedUploads === totalUploads) {
            const finalContent = view.state.doc.toString();
            callbacks?.onAllUploadsComplete?.(successfulUploads > 0, finalContent);
          }
        }
      });

      return true; // Event handled
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

  // Add drag & drop support if upload handler is provided
  if (imageUploadHandler) {
    extensions.push(createImageDragDropExtension(imageUploadHandler, uploadCallbacks));
  }

  return extensions;
};

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
