import { useCallback, useEffect, useState } from "react";
import React from "react";
import { Box, Grid, IconButton, Drawer, Typography, Chip } from "@mui/material";
import { Component } from "lucide-react";
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
import { useConfig } from "@providers/config-provider";
import { isCodeEditorLineNumbersEnabled } from "@utils/config-helpers";
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

    // Combine known components with content components, avoiding duplicates
    const uniqueComponents = [
      ...knownComponents,
      ...contentComponents.filter((c) => !mdxComponents.some((mc) => mc.name === c.name)),
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
              markdown={value}
              onChange={onChange}
              readOnly={isReadOnly}
              className="mdx-editor-new"
              plugins={[
                // Enable diff/source mode plugin - start in source mode for custom components
                diffSourcePlugin({
                  viewMode: "source",
                  diffMarkdown: originalContentForDiff || initialContent,
                  readOnlyDiff: false,
                  // Use custom extensions that conditionally include line numbers
                  codeMirrorExtensions: buildSourceModeExtensions(config),
                }),
                // JSX plugin for custom components with implementations
                jsxPlugin({
                  jsxComponentDescriptors: createJsxComponentDescriptors(),
                }),
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
                  // Use custom extensions that conditionally include line numbers
                  codeMirrorExtensions: buildCodeBlockExtensions(config),
                }),
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
    </div>
  );
};

export { MDXEditorNew };
export default MDXEditorNew;
