import { useCallback, useEffect, useState, createContext } from "react";
import { Box, Grid, IconButton } from "@mui/material";
import { RefreshCw } from "lucide-react";
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
import { MDXEditorNewProps, ImageUploadingContext } from "./types";
import { validateFrontmatter, ValidateFrontmatterError } from "utils/frontmatter-validator";
import Dropzone, { Accept, FileRejection } from "react-dropzone";
import { useNotificationsService } from "@hooks";
import { ContentEditMaximumImageSize } from "@features/content/content-edit/validation";
import { useRequestContext } from "@providers/request-provider";
import "@mdxeditor/editor/style.css";
import "./styles.css";

const ImageUploadingCtx = createContext<ImageUploadingContext | null>(null);

const MDXEditorNew = ({
  value,
  onChange,
  isReadOnly,
  contentDetails,
  onFrontmatterErrorChange,
  livePreview,
  livePreviewTemplate,
  isMetadataCollapsed,
}: MDXEditorNewProps) => {
  const { notificationsService } = useNotificationsService();
  const { client } = useRequestContext();
  const [currentError, setCurrentError] = useState<string>("");
  const [currentImageCtxValue, setCurrentImageCtxValue] = useState<ImageUploadingContext | null>(
    null
  );
  const [initialContent, setInitialContent] = useState<string>("");
  const [previewKey, setPreviewKey] = useState<number>(Date.now());
  const [hasContentChanged, setHasContentChanged] = useState<boolean>(false);

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

  // Handle image uploads via drag and drop
  const onDrop = useCallback(
    async (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        rejections.map((rejection) => {
          const fileName = rejection.file.name;
          const error = rejection.errors[0].message;
          notificationsService.error(`Failed to select image ${fileName} (${error}).`);
        });
      }
      if (acceptedFiles.length !== 0) {
        setCurrentImageCtxValue({
          currentFile: acceptedFiles[0],
          contentDetails,
        });
      }
    },
    [contentDetails, notificationsService]
  );

  // Handle image upload context
  useEffect(() => {
    if (currentImageCtxValue === null) {
      return;
    }

    const uploadImage = async (file: File) => {
      if (contentDetails.slug.length === 0) {
        notificationsService.error("Specify slug first!");
        return;
      }

      try {
        const resp = await client.api.mediaCreate({
          File: file,
          ScopeUid: contentDetails.slug,
        });

        const imageMarkdown = `![alt](${resp.data.location})`;
        // Insert at the end of current content
        onChange(value + (value.endsWith("\n") ? "" : "\n") + imageMarkdown + "\n");

        notificationsService.success(`Image ${file.name} uploaded successfully!`);
      } catch (error) {
        notificationsService.error(`Failed to upload image ${file.name}.`);
      }
    };

    uploadImage(currentImageCtxValue.currentFile);
  }, [currentImageCtxValue, contentDetails.slug, client, notificationsService, onChange, value]);

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
    <ImageUploadingCtx.Provider value={currentImageCtxValue}>
      <Dropzone
        onDrop={onDrop}
        maxSize={ContentEditMaximumImageSize}
        maxFiles={1}
        accept={{ "image/*": [] } as Accept}
        noClick
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="mdx-editor-container">
            <input {...getInputProps()} />
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
                    key={`editor-${isReadOnly}`}
                    markdown={value}
                    onChange={onChange}
                    readOnly={isReadOnly}
                    className="mdx-editor-new"
                    plugins={[
                      // Enable diff/source mode plugin first
                      diffSourcePlugin({
                        viewMode: "source",
                        diffMarkdown: initialContent,
                        readOnlyDiff: false,
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
          </div>
        )}
      </Dropzone>
    </ImageUploadingCtx.Provider>
  );
};

export default MDXEditorNew;
