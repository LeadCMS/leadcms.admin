import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import React from "react";
import { Box, Grid, IconButton, Drawer, Typography, Chip } from "@mui/material";
import { Component, ImagePlus } from "lucide-react";
import {
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  quotePlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  diffSourcePlugin,
  jsxPlugin,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import SyntaxValidationPreview from "@components/syntax-validation-preview";
import { MDXEditorNewProps } from "./types";
import { useRequestContext } from "@providers/request-provider";
import { useMdxComponents } from "./hooks";
import { MdxComponentsPanel } from "./components";
import { buildSourceModeExtensions, buildCodeBlockExtensions } from "./codemirror-extensions";
import type { ImageUploadCallbacks, ImageUploadError } from "./codemirror-extensions";
import { useConfig } from "@providers/config-provider";
import { isCodeEditorLineNumbersEnabled } from "@utils/config-helpers";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { parseApiError } from "@utils/api-error-parser";
import { buildAbsoluteUrl } from "@lib/network/utils";
import {
  ImageSelectionDialog,
  type MediaItem,
} from "@components/image-selection-dialog/image-selection-dialog";
import { toast } from "react-toastify";
import "@mdxeditor/editor/style.css";
import "./styles.css";

const MDXEditorNew = ({
  value,
  onChange,
  isReadOnly,
  contentDetails,
  onContentChangeStatus,
  livePreview,
  livePreviewTemplate,
  isMetadataCollapsed,
  preloadedMdxComponents,
  originalContentForDiff,
  contentFormat,
}: MDXEditorNewProps) => {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const [initialContent, setInitialContent] = useState<string>("");
  const [previewKey, setPreviewKey] = useState<number>(Date.now());
  const [hasContentChanged, setHasContentChanged] = useState<boolean>(false);
  const [componentsPanelOpen, setComponentsPanelOpen] = useState<boolean>(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  // Track currently uploading image files by name
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<boolean>(false);

  const resolveImagePreviewUrl = (imageSource: string) => {
    if (imageSource && imageSource.startsWith("/api")) {
      return buildAbsoluteUrl(imageSource);
    }

    return imageSource;
  };

  const insertImageFromLibrary = useCallback((item: MediaItem) => {
    const altText = item.description?.trim() || item.name || "";
    const markdown = `![${altText}](${item.location})`;
    mdxEditorRef.current?.focus(() => {
      mdxEditorRef.current?.insertMarkdown(`${markdown}\n`);
    });
  }, []);

  // Fetch custom MDX components for the current content type
  const { components: mdxComponents } = useMdxComponents({
    contentType: contentDetails.type,
    useCache: true,
    maxCacheAgeHours: 1,
    preloadedData: preloadedMdxComponents,
  });

  // Log available components for development
  useEffect(() => {
    if (mdxComponents.length > 0) {
      console.log("Available MDX components for content type:", contentDetails.type, mdxComponents);
    }
  }, [mdxComponents, contentDetails.type]);

  // Store initial content for diff comparison when component mounts
  useEffect(() => {
    if (initialContent === "" && value) {
      // Use original content for diff if provided (for AI editing), otherwise use current value
      const diffBase = originalContentForDiff || value;
      setInitialContent(diffBase);
    }
  }, [value, initialContent, originalContentForDiff]);

  // Track content changes to determine when to switch to live preview
  useEffect(() => {
    if (initialContent && value !== initialContent && !hasContentChanged) {
      setHasContentChanged(true);
      setPreviewKey(Date.now()); // Refresh only on first change
      onContentChangeStatus?.(true); // Notify parent of content change
    }
  }, [value, initialContent, hasContentChanged, onContentChangeStatus]);

  // Enhanced onChange handler that prevents updates during image uploads
  const handleContentChange = useCallback(
    (newValue: string) => {
      // Don't trigger onChange if we have pending image uploads
      if (!pendingChanges) {
        onChange(newValue);
      }
    },
    [onChange, pendingChanges]
  );

  // Custom image upload handler for MDXEditor
  const imageUploadHandler = useCallback(
    async (image: File): Promise<string> => {
      if (contentDetails.slug.length === 0) {
        throw new Error("Specify slug first!");
      }

      const resp = await client.api.mediaCreate({
        File: image,
        ScopeUid: contentDetails.slug,
      });

      return resp.data.location || "";
    },
    [contentDetails.slug, client]
  );

  // Drag & drop image upload handler with error handling
  const dragDropImageUploadHandler = useCallback(
    async (image: File): Promise<string> => {
      if (contentDetails.slug.length === 0) {
        throw new Error("Please save the content first to enable image uploads");
      }

      try {
        const resp = await client.api.mediaCreate({
          File: image,
          ScopeUid: contentDetails.slug,
        });

        if (!resp.data.location) {
          throw new Error("Upload completed but no location returned");
        }

        return resp.data.location;
      } catch (error) {
        // Parse API error using utility
        const parsedError = parseApiError(error, "Failed to upload image. Please try again.");

        // Create detailed error object
        const detailedError = new Error(parsedError.message) as Error & { details?: string[] };
        detailedError.details = parsedError.details;
        throw detailedError;
      }
    },
    [contentDetails.slug, client]
  );

  // Upload callbacks for drag & drop
  const uploadCallbacks: ImageUploadCallbacks = useMemo(
    () => ({
      onBeforePlaceholder: () => {
        // Set pending changes BEFORE any content modification
        setPendingChanges(true);
      },
      onUploadStart: (file: File) => {
        setUploadingImages((prev) => new Set(prev).add(file.name));
      },
      onUploadSuccess: (file: File) => {
        setUploadingImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });

        notificationsService.success(`Image "${file.name}" uploaded successfully`);
      },
      onUploadError: (error: ImageUploadError) => {
        setUploadingImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(error.file.name);
          return newSet;
        });

        // Show error notification with option to view details
        const baseErrorMessage = `Failed to upload "${error.file.name}"`;
        const errorDetails = [error.message];

        // Add additional details if available
        if (error.details && error.details.length > 0) {
          errorDetails.push(...error.details);
        }

        // Always show clickable error if we have validation details
        if (error.details && error.details.length > 0) {
          // Show clickable error with details
          notificationsService.errorWithContent(
            <div
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss();
                showErrorModal(errorDetails);
              }}
            >
              {baseErrorMessage} - Click for details
            </div>,
            { closeOnClick: false }
          );
        } else {
          // If only basic error, show it directly
          notificationsService.error(`${baseErrorMessage}: ${error.message}`);
        }
      },
      onAllUploadsComplete: (hadSuccess: boolean, finalContent: string) => {
        // Re-enable draft updates
        setPendingChanges(false);

        // If at least one upload succeeded, trigger draft update with the final content
        if (hadSuccess) {
          onChange(finalContent);
        }
      },
    }),
    [notificationsService, showErrorModal, onChange]
  );

  // Create a comprehensive list of component descriptors including fallbacks for common patterns
  const createJsxComponentDescriptors = useCallback(() => {
    const knownComponents = mdxComponents.map((component) => ({
      name: component.name,
      kind: "flow" as const,
      props:
        component.properties?.map((prop) => ({
          name: prop.name,
          type: "string" as const,
        })) || [],
      hasChildren: component.acceptsChildren || false,
      Editor: () => {
        return React.createElement(
          "div",
          {
            style: {
              padding: "8px",
              border: "1px dashed #ccc",
              borderRadius: "4px",
              backgroundColor: "#f9f9f9",
              margin: "4px 0",
              fontSize: "0.875rem",
              color: "#666",
            },
          },
          `<${component.name} /> component`
        );
      },
    }));

    // Extract component names from current content to add them as recognized components
    const componentNamesFromContent = new Set<string>();
    const jsxComponentRegex = /<([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)*)/g;
    let match;
    while ((match = jsxComponentRegex.exec(value)) !== null) {
      componentNamesFromContent.add(match[1]);
    }

    // Create descriptors for components found in content
    const contentComponents = Array.from(componentNamesFromContent).map((name) => ({
      name,
      kind: "flow" as const,
      hasChildren: true,
      props: [
        { name: "children", type: "string" as const },
        { name: "className", type: "string" as const },
        { name: "src", type: "string" as const },
        { name: "alt", type: "string" as const },
        { name: "caption", type: "string" as const },
        { name: "captionType", type: "string" as const },
        { name: "to", type: "string" as const },
        { name: "withTopPadding", type: "string" as const },
      ],
      Editor: () => {
        return React.createElement(
          "div",
          {
            style: {
              padding: "8px",
              border: "1px dashed #e0e0e0",
              borderRadius: "4px",
              backgroundColor: "#f8f9fa",
              margin: "4px 0",
              fontSize: "0.875rem",
              color: "#666",
              fontStyle: "italic",
            },
          },
          `<${name} /> custom component`
        );
      },
    }));

    // Catch-all descriptor for any unrecognized component names
    const catchAllDescriptor = {
      name: "*" as const,
      kind: "flow" as const,
      hasChildren: true,
      props: [],
      Editor: ({ mdastNode }: { mdastNode: { name: string } }) => {
        return React.createElement(
          "div",
          {
            style: {
              padding: "8px",
              border: "1px dashed #f44336",
              borderRadius: "4px",
              backgroundColor: "#fff3f0",
              margin: "4px 0",
              fontSize: "0.875rem",
              color: "#d32f2f",
            },
          },
          `<${mdastNode.name} /> unknown component`
        );
      },
    };

    // Combine known components with content components, avoiding duplicates
    const uniqueComponents = [
      ...knownComponents,
      ...contentComponents.filter((c) => !mdxComponents.some((mc) => mc.name === c.name)),
      catchAllDescriptor,
    ];

    return uniqueComponents;
  }, [mdxComponents, value]);

  // Insert action removed per UX update (copy-only)

  const editorHeight = isMetadataCollapsed ? "calc(100vh - 284px)" : "calc(100vh - 444px)";

  // Reusable MDX components toolbar control (button + counter + separator)
  const MdxComponentsControl = () => {
    if (mdxComponents.length === 0) {
      return null;
    }
    return (
      <>
        <IconButton
          size="small"
          onClick={() => setComponentsPanelOpen(true)}
          title={`Show MDX Components (${mdxComponents.length})`}
          sx={{
            minWidth: "auto",
            padding: "4px",
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Component size={16} />
          <Chip
            label={mdxComponents.length}
            size="small"
            sx={{ ml: 0.5, height: 16, fontSize: "0.75rem" }}
          />
        </IconButton>
        <Separator />
      </>
    );
  };

  const InsertLibraryImageControl = () => (
    <>
      <IconButton
        size="small"
        onClick={() => setIsMediaPickerOpen(true)}
        title="Insert image from media library"
        sx={{
          minWidth: "auto",
          padding: "4px",
          color: "text.secondary",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <ImagePlus size={16} />
      </IconButton>
      <Separator />
    </>
  );

  // Render preview for live preview mode only
  const renderPreview = () => {
    if (livePreview && livePreviewTemplate) {
      // Use syntax validation preview that can show errors or regular preview
      return (
        <SyntaxValidationPreview
          params={{ ...contentDetails }}
          template={livePreviewTemplate}
          viewerKey={previewKey}
          contentFormat={contentFormat}
        />
      );
    }
    return null;
  };

  // Check if preview should be shown (live preview enabled AND template available)
  const shouldShowPreview = livePreview && livePreviewTemplate;

  return (
    <div className="mdx-editor-container">
      <Grid container sx={{ height: editorHeight }}>
        {/* Editor Section - Full width when no preview available, half width when enabled */}
        <Grid
          size={{
            xs: 12, // Full width on mobile
            md: shouldShowPreview ? 6 : 12, // Half/full width on medium+ screens
            lg: shouldShowPreview ? 6 : 12, // Same behavior on large screens
            xl: shouldShowPreview ? 6 : 12, // Same behavior on extra large
          }}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRight: shouldShowPreview ? "1px solid #e0e0e0" : "none",
            borderLeft: !isCodeEditorLineNumbersEnabled(config) ? "1px solid #e0e0e0" : "none",
            overflow: "hidden", // Prevent container overflow
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto", // Enable scrolling for the editor
              width: "100%", // Ensure full width utilization
              "& .mdx-editor-new": {
                height: "100%",
                width: "100%",
              },
              "& .mdx-editor-content": {
                minHeight: "100%",
                overflow: "auto",
                width: "100%",
              },
              "& .mdx-editor": {
                width: "100%",
              },
            }}
          >
            <MDXEditor
              key={`editor-${isReadOnly}-${mdxComponents.length}`} // Re-render on load
              ref={mdxEditorRef}
              markdown={value}
              onChange={handleContentChange}
              readOnly={isReadOnly}
              toMarkdownOptions={{
                emphasis: "_",
                rule: "-",
                bullet: "-",
                incrementListMarker: true,
                listItemIndent: "one",
              }}
              className="mdx-editor-new"
              plugins={[
                // Enable diff/source mode plugin - start in source mode for custom components
                diffSourcePlugin({
                  viewMode: "source",
                  diffMarkdown: originalContentForDiff || initialContent,
                  readOnlyDiff: false,
                  // Use custom extensions with line numbers and drag & drop support
                  codeMirrorExtensions: buildSourceModeExtensions(
                    config,
                    isReadOnly ? undefined : dragDropImageUploadHandler,
                    isReadOnly ? undefined : uploadCallbacks
                  ),
                }),
                // Frontmatter must come early to parse the content correctly
                frontmatterPlugin(),
                // Code block plugins must come BEFORE JSX plugin to handle code blocks properly
                codeBlockPlugin({ defaultCodeBlockLanguage: "text" }),
                codeMirrorPlugin({
                  codeBlockLanguages: {
                    js: "JavaScript",
                    ts: "TypeScript",
                    tsx: "TypeScript React",
                    jsx: "JavaScript React",
                    css: "CSS",
                    html: "HTML",
                    json: "JSON",
                    yaml: "YAML",
                    yml: "YAML",
                    markdown: "Markdown",
                    mdx: "MDX",
                    md: "Markdown",
                    bash: "Bash",
                    sh: "Shell",
                    shell: "Shell",
                    python: "Python",
                    typescript: "TypeScript",
                    javascript: "JavaScript",
                    text: "Plain Text",
                    txt: "Plain Text",
                    plaintext: "Plain Text",
                    "": "Plain Text",
                  },
                  // Use custom extensions that conditionally include line numbers
                  codeMirrorExtensions: buildCodeBlockExtensions(config),
                }),
                // JSX plugin for custom components - must come AFTER code block plugins
                jsxPlugin({
                  jsxComponentDescriptors: createJsxComponentDescriptors(),
                }),
                // Core plugins
                headingsPlugin(),
                quotePlugin(),
                listsPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin({
                  imageUploadHandler,
                  imagePreviewHandler: async (imageSource: string) => {
                    return resolveImagePreviewUrl(imageSource);
                  },
                }),
                tablePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                // Toolbar
                ...(isReadOnly
                  ? []
                  : [
                      toolbarPlugin({
                        toolbarContents: () => (
                          <DiffSourceToggleWrapper
                            options={["rich-text", "diff", "source"]}
                            SourceToolbar={
                              <>
                                <InsertLibraryImageControl />
                                <MdxComponentsControl />
                              </>
                            }
                          >
                            <BoldItalicUnderlineToggles />
                            <CodeToggle />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <CreateLink />
                            <InsertImage />
                            <Separator />
                            <InsertLibraryImageControl />
                            <InsertTable />
                            <InsertThematicBreak />
                            <Separator />
                            <MdxComponentsControl />
                          </DiffSourceToggleWrapper>
                        ),
                      }),
                    ]),
              ]}
              contentEditableClassName="mdx-editor-content"
            />
          </Box>
        </Grid>

        {/* Preview Section - Only show when both live preview is enabled AND template exists */}
        {shouldShowPreview && (
          <Grid
            size={{ xs: 12, md: 6, lg: 6, xl: 6 }}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fafafa",
            }}
          >
            {/* Preview Content */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                backgroundColor: "#fff",
                "& iframe": {
                  width: "100%",
                  height: "100%",
                  border: "none",
                },
              }}
            >
              {renderPreview()}
            </Box>
          </Grid>
        )}
      </Grid>

      {/* MDX Components Panel */}
      <Drawer
        anchor="right"
        open={componentsPanelOpen}
        onClose={() => setComponentsPanelOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 400,
            maxWidth: "40vw",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "background.default",
          }}
        >
          <Typography variant="h6">Known MDX Components</Typography>
          <Typography variant="body2" color="text.secondary">
            These components were detected from existing ‘{contentDetails.type}’ content.
          </Typography>
        </Box>
        <MdxComponentsPanel
          components={mdxComponents}
          onClosePanel={() => setComponentsPanelOpen(false)}
        />
      </Drawer>

      <ImageSelectionDialog
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={() => setIsMediaPickerOpen(false)}
        onSelectItem={(item) => {
          insertImageFromLibrary(item);
          setIsMediaPickerOpen(false);
        }}
        initialFolder={contentDetails.slug.replace(/^\/+|\/+$/g, "")}
      />
    </div>
  );
};

export { MDXEditorNew };
export default MDXEditorNew;
