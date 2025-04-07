import ImageIcon from "@mui/icons-material/Image";
import { Button } from "@mui/material";
import { ExtendedCommandBase } from "../types";
import { RequestContextType, useRequestContext } from "@providers/request-provider";
import { ContentDetails } from "@features/blog/content-edit/types";
import { useNotificationsService } from "@hooks";

export const ImageUpload = (contentDetails: ContentDetails, isInToolbar: boolean) => {
  const { notificationsService } = useNotificationsService();
  const networkContext = useRequestContext();
  const command = {
    networkContext,
    contentDetails,
    name: "Upload Image",
    keyCommand: "image-upload",
    buttonProps: { "aria-label": "Upload image" },
    icon: <ImageIcon sx={{ fontSize: 14, padding: 0 }} />,
    render: isInToolbar
      ? undefined
      : (command, disabled, executeCommand) => {
          const onClick = () => {
            executeCommand(command, command.groupName);
          };
          return (
            <>
              <Button
                variant="outlined"
                disabled={disabled}
                startIcon={<ImageIcon sx={{ fontSize: 20 }} />}
                onClick={onClick}
              >
                Upload Image
              </Button>
            </>
          );
        },
    execute(state, api) {
      if (this.contentDetails.slug.length === 0) {
        notificationsService.error("Specify slug first!");
        return;
      }
      const inputElement = document.createElement("input");
      inputElement.style.display = "none";
      inputElement.type = "file";
      inputElement.addEventListener("change", async () => {
        if (inputElement.files === null || inputElement.files.length === 0) {
          document.body.removeChild(inputElement);
          return;
        }
        const selectedFile = inputElement.files[0];
        const replaceText = `![${selectedFile.name}](Uploading...)`;
        const textPosStart = api.replaceSelection("").selection.start;
        api.replaceSelection(replaceText);
        const imageUploadingResponse = await this.networkContext.client.api.mediaCreate({
          Image: selectedFile,
          ScopeUid: this.contentDetails.slug,
        });
        if (imageUploadingResponse.error) {
          notificationsService.error(
            `Failed to upload image ${imageUploadingResponse.error.detail}`,
          );
        }
        api.setSelectionRange({
          start: textPosStart,
          end: replaceText.length + textPosStart,
        });
        api.replaceSelection(`![alt](${imageUploadingResponse.data.location})`);
        document.body.removeChild(inputElement);
      });
      document.body.appendChild(inputElement);
      inputElement.click();
    },
  } as ExtendedCommandBase<string>;
  return command;
};
