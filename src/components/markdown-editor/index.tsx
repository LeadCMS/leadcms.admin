import MDEditor, { EditorContext, ICommand, commands } from "@uiw/react-md-editor";
import { ImageUpload } from "./commands";
import { AppWindow } from "lucide-react";
import { ImageUploadingContext, MarkdownEditorProps, onFrontmatterErrorChangeFunc } from "./types";
import { useEffect, useState, useContext, createContext } from "react";
import { MarkdownViewerFunc } from "@components/markdown-viewer";
import { MarkdownLiveViewerFunc } from "@components/markdown-live-viewer";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { validateFrontmatter, ValidateFrontmatterError } from "utils/frontmatter-validator";
import Dropzone, { Accept, FileRejection } from "react-dropzone";
import "./styles.css";
import { useNotificationsService } from "@hooks";
import { ContentEditMaximumImageSize } from "@features/content/content-edit/validation";
import { useRequestContext } from "@providers/request-provider";

const ImageUploadingCtx = createContext<ImageUploadingContext | null>(null);

const EditorViewFunc = (
  value: string,
  onChange: (value: string) => void,
  onErrorChange: onFrontmatterErrorChangeFunc
) => {
  const { notificationsService } = useNotificationsService();
  const editorCtx = useContext(EditorContext);
  const imageCtx = useContext(ImageUploadingCtx);
  const { client } = useRequestContext();

  useEffect(() => {
    if (imageCtx === null) {
      return;
    }
    const func = async (file: File) => {
      if (imageCtx.contentDetails.slug.length === 0) {
        notificationsService.error("Specify slug first!");
        return;
      }
      const resp = await client.api.mediaCreate({
        Image: file,
        ScopeUid: imageCtx.contentDetails.slug,
      });
      const imageBlock = `![alt](${resp.data.location})`;
      editorCtx.commandOrchestrator?.textApi.replaceSelection(imageBlock);
    };
    func(imageCtx.currentFile);
  }, [imageCtx]);

  useEffect(() => {
    const validationResult = validateFrontmatter(value);
    // Only show error if frontmatter exists and is invalid
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
      if (validationResult.errorLine === -1) {
        return;
      }
      // Only get lines if we need to highlight an error line
      const lines = document.querySelectorAll(".code-line");
      if (lines.length === 0) {
        return;
      }
      const element = lines[validationResult.errorLine - 1] as HTMLTextAreaElement;
      if (element === undefined) {
        return;
      }
      element.classList.add("error-line");
      return;
    }
    onErrorChange(null);
  }, [value]);
  return (
    <CodeEditor
      value={value}
      onChange={(evn) => onChange(evn.target.value)}
      padding={16}
      minHeight={512}
      style={{
        fontSize: 16,
        font: "Helvetica Neue",
        backgroundColor: "#FFFFFF",
        lineHeight: 1.5,
        fontFamily: "Helvetica Neue, Helvetica",
      }}
    />
  );
};

const MarkdownEditor = ({
  value,
  onChange,
  isReadOnly,
  contentDetails,
  onFrontmatterErrorChange,
  livePreview,
  livePreviewTemplate,
}: MarkdownEditorProps) => {
  const { notificationsService } = useNotificationsService();
  const [currentError, setCurrentError] = useState<string>("");
  const [currentImageCtxValue, setCurrentImageCtxValue] = useState<ImageUploadingContext | null>(
    null
  );

  const customCommands = commands.getCommands().concat([
    commands.group([ImageUpload(contentDetails, false)], {
      name: "LeadCMS components",
      groupName: "leadcms-components",
      buttonProps: { "aria-label": "Insert leadcms custom components" },
      icon: <AppWindow size={14}/>,
    }),
  ]);
  const onErrorChange = (error: ValidateFrontmatterError | null) => {
    error !== null
      ? setCurrentError(`Frontmatter Error \n (${error.errorMessage})\n`)
      : setCurrentError("");
    onFrontmatterErrorChange(error);
  };

  const commandFilter = (command: ICommand) => {
    if (command.name === "image") {
      return ImageUpload(contentDetails, true);
    }
    return command;
  };

  const onDrop = async (acceptedFiles: File[], rejections: FileRejection[]) => {
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
  };

  const strippedValue = value.replace(/(---.*?---)/s, "");
  // Inject inline CSS to reset padding for editor and preview
  useEffect(() => {
    const styleId = "leadcms-md-editor-reset-padding";
    if (livePreview && livePreviewTemplate) {
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          .w-md-editor-preview {
            padding: 0 !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [livePreview]);

  return (
    <Dropzone
      onDrop={onDrop}
      maxSize={ContentEditMaximumImageSize}
      maxFiles={1}
      accept={{ "image/*": [] } as Accept}
      noClick
    >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <ImageUploadingCtx.Provider value={currentImageCtxValue}>
            <MDEditor
              aria-disabled={isReadOnly}
              hideToolbar={isReadOnly}
              height="100%"
              preview={"live"}
              value={value}
              onChange={onChange}
              commands={customCommands}
              commandsFilter={commandFilter}
              style={{ padding: 0 }}
              highlightEnable
              components={{
                preview: () => {
                  if (livePreview && livePreviewTemplate) {
                    console.log("[MarkdownEditor] livePreview params:", contentDetails);
                    return MarkdownLiveViewerFunc({ ...contentDetails }, livePreviewTemplate);
                  }
                  return MarkdownViewerFunc(`${currentError}${strippedValue}`);
                },
                textarea: () => EditorViewFunc(value, onChange, onErrorChange),
              }}
              data-color-mode="light"
            />
          </ImageUploadingCtx.Provider>
        </div>
      )}
    </Dropzone>
  );
};

export default MarkdownEditor;
