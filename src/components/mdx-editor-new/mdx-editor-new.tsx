import { useCallback, useEffect, useState } from "react";
import React from "react";
import { Box, Grid, IconButton, Drawer, Typography, Chip } from "@mui/material";
import { RefreshCw, Component } from "lucide-react";
import {
  MDXEditor,
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
  UndoRedo,
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
import { MarkdownLiveViewerFunc } from "@components/markdown-live-viewer";
import { MarkdownViewerFunc } from "@components/markdown-viewer";
import { MDXEditorNewProps } from "./types";
import { validateFrontmatter, ValidateFrontmatterError } from "utils/frontmatter-validator";
import { useRequestContext } from "@providers/request-provider";
import { useMdxComponents } from "./hooks";
import { MdxComponentsPanel } from "./components";
import "@mdxeditor/editor/style.css";
import "./styles.css";

const MDXEditorNew = ({
  value,
  onChange,
  isReadOnly,
  contentDetails,
  onFrontmatterErrorChange,
  livePreview,
  livePreviewTemplate,
  isMetadataCollapsed,
  preloadedMdxComponents,
}: MDXEditorNewProps) => {
  const { client } = useRequestContext();
  const [currentError, setCurrentError] = useState<string>("");
  const [initialContent, setInitialContent] = useState<string>("");
  const [previewKey, setPreviewKey] = useState<number>(Date.now());
  const [hasContentChanged, setHasContentChanged] = useState<boolean>(false);
  const [componentsPanelOpen, setComponentsPanelOpen] = useState<boolean>(false);

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
      setInitialContent(value);
    }
  }, [value, initialContent]);

  // Track content changes to determine when to switch to live preview
  useEffect(() => {
    if (initialContent && value !== initialContent && !hasContentChanged) {
      setHasContentChanged(true);
      setPreviewKey(Date.now()); // Refresh only on first change
    }
  }, [value, initialContent, hasContentChanged]);

  // Manual function to reset diff base (can be called when content is saved)
  const resetDiffBase = useCallback(() => {
    setInitialContent(value);
  }, [value]);

  // Handle frontmatter validation
  const onErrorChange = useCallback(
    (error: ValidateFrontmatterError | null) => {
      error !== null
        ? setCurrentError(`Frontmatter Error \n (${error.errorMessage})\n`)
        : setCurrentError("");
      onFrontmatterErrorChange(error);
    },
    [onFrontmatterErrorChange]
  );

  useEffect(() => {
    const validationResult = validateFrontmatter(value);

    if (validationResult !== true) {
      // If the error is only about missing frontmatter, do not show error
      if (
        validationResult &&
        typeof validationResult === "object" &&
        validationResult.errorMessage === "Frontmatter doesn't exists"
      ) {
        onErrorChange(null);
        return;
      }
      onErrorChange(validationResult);
      return;
    }
    onErrorChange(null);
  }, [value, onErrorChange]);

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

  // Handle component insertion from the components panel
  const handleComponentInsert = useCallback(
    (componentMarkup: string) => {
      // Insert the component at the current cursor position
      const currentValue = value;
      const newValue =
        currentValue + (currentValue.endsWith("\n") ? "" : "\n") + componentMarkup + "\n";
      onChange(newValue);
      // Close the panel after insertion
      setComponentsPanelOpen(false);
    },
    [value, onChange]
  );

  const editorHeight = isMetadataCollapsed ? "calc(100vh - 325px)" : "calc(100vh - 500px)";
  const strippedValue = value.replace(/(---.*?---)/s, "");

  // Render preview based on livePreview settings
  const renderPreview = () => {
    if (livePreview && livePreviewTemplate) {
      // Use stable preview key - only changes on first edit or manual refresh
      return MarkdownLiveViewerFunc({ ...contentDetails }, livePreviewTemplate, previewKey);
    }
    return MarkdownViewerFunc(`${currentError}${strippedValue}`);
  };

  return (
    <div className="mdx-editor-container">
      <Grid container sx={{ height: editorHeight }}>
        {/* Editor Section */}
        <Grid
          size={{ xs: 12, sm: livePreview ? 6 : 12 }}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRight: livePreview ? "1px solid #e0e0e0" : "none",
            overflow: "hidden", // Prevent container overflow
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: "auto", // Enable scrolling for the editor
              "& .mdx-editor-new": {
                height: "100%",
              },
              "& .mdx-editor-content": {
                minHeight: "100%",
                overflow: "auto",
              },
            }}
          >
            <MDXEditor
              key={`editor-${isReadOnly}-${mdxComponents.length}`} // Re-render on load
              markdown={value}
              onChange={onChange}
              readOnly={isReadOnly}
              className="mdx-editor-new"
              plugins={[
                // Enable diff/source mode plugin - start in source mode for custom components
                diffSourcePlugin({
                  viewMode: "source",
                  diffMarkdown: initialContent,
                  readOnlyDiff: false,
                }),
                // JSX plugin for custom components with implementations
                ...(mdxComponents.length > 0
                  ? [
                      jsxPlugin({
                        jsxComponentDescriptors: mdxComponents.map((component) => ({
                          name: component.name,
                          kind: "flow" as const,
                          // Removed source property to prevent automatic imports
                          props:
                            component.properties?.map((prop) => ({
                              name: prop.name,
                              type: "string" as const,
                            })) || [],
                          hasChildren: component.acceptsChildren || false,
                          Editor: () => {
                            // Render a placeholder for the custom component
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
                        })),
                      }),
                    ]
                  : [jsxPlugin()]),
                // Core plugins
                headingsPlugin(),
                quotePlugin(),
                listsPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin({ imageUploadHandler }),
                tablePlugin(),
                thematicBreakPlugin(),
                frontmatterPlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
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
                    markdown: "Markdown",
                    bash: "Bash",
                    python: "Python",
                  },
                }),
                markdownShortcutPlugin(),
                // Toolbar
                ...(isReadOnly
                  ? []
                  : [
                      toolbarPlugin({
                        toolbarContents: () => (
                          <DiffSourceToggleWrapper>
                            <UndoRedo />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <CodeToggle />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <CreateLink />
                            <InsertImage />
                            <Separator />
                            <InsertTable />
                            <InsertThematicBreak />
                            <Separator />
                            {mdxComponents.length > 0 && (
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
                            )}
                            <IconButton
                              size="small"
                              onClick={resetDiffBase}
                              title="Reset diff base to current content"
                              sx={{
                                minWidth: "auto",
                                padding: "4px",
                                color: "text.secondary",
                                "&:hover": {
                                  backgroundColor: "action.hover",
                                },
                              }}
                            >
                              <RefreshCw size={16} />
                            </IconButton>
                          </DiffSourceToggleWrapper>
                        ),
                      }),
                    ]),
              ]}
              contentEditableClassName="mdx-editor-content"
            />
          </Box>
        </Grid>

        {/* Preview Section */}
        {livePreview && (
          <Grid
            size={{ xs: 12, sm: 6 }}
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
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h6">MDX Components</Typography>
          <Typography variant="body2" color="text.secondary">
            Content Type: {contentDetails.type}
          </Typography>
        </Box>
        <MdxComponentsPanel components={mdxComponents} onComponentInsert={handleComponentInsert} />
      </Drawer>
    </div>
  );
};

export { MDXEditorNew };
export default MDXEditorNew;
