import Dropzone, { Accept, FileRejection } from "react-dropzone";
import { BoxStyled } from "./index.styled";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { X } from "lucide-react";
import { useNotificationsService } from "@hooks";

export interface ImageData {
  fileName: string;
  url: string;
}

type onChangeFunc = (file: ImageData) => void;

interface FileDropdownProps {
  acceptMIME: string;
  maxFileSize: number;
  onChange: onChangeFunc;
  data: ImageData;
  error?: boolean | null;
  helperText?: string | boolean | undefined;
}

const FileDropdown = ({ acceptMIME, maxFileSize, onChange, data }: FileDropdownProps) => {
  const { notificationsService } = useNotificationsService();
  const onDrop = (acceptedFiles: File[], rejections: FileRejection[]) => {
    if (rejections.length > 0) {
      rejections.map((rejection) => {
        const fileName = rejection.file.name;
        const error = rejection.errors[0].message;
        notificationsService.error(`Failed to select image ${fileName} (${error}).`);
      });
    }
    if (acceptedFiles.length !== 0) {
      const file = acceptedFiles[0];
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target === null || e.target.result === null) {
          notificationsService.error(`Failed to select image ${file.name} (File System error).`);
          return;
        }
        onChange({ fileName: file.name, url: e.target.result as string });
      };
      fileReader.readAsDataURL(file);
    }
  };

  const onReset = () => {
    onChange({ fileName: "", url: "" });
  };

  return (
    <>
      <BoxStyled>
        {data === undefined || data.url === undefined || data.url.length === 0 ? (
          <Dropzone
            onDrop={onDrop}
            maxSize={maxFileSize}
            maxFiles={1}
            accept={{ [acceptMIME]: [] } as Accept}
          >
            {({ getRootProps, getInputProps }) => (
              <Grid
                container
                spacing={0}
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{ height: "100%", textAlign: "center" }}
              >
                <div {...getRootProps()} style={{ width: "100%" }}>
                  <input {...getInputProps()} />
                  <p>Drag drop some files here, or click to select files</p>
                  <Grid size={{ xs: 12 }} style={{ textAlign: "center" }}>
                    <Button variant="outlined">Select file</Button>
                  </Grid>
                </div>
              </Grid>
            )}
          </Dropzone>
        ) : (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 1,
              }}
              alt="Cover image preview"
              src={data.url}
            />
            <IconButton
              onClick={onReset}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                },
                width: 32,
                height: 32,
              }}
              size="small"
            >
              <X />
            </IconButton>
          </Box>
        )}
      </BoxStyled>
    </>
  );
};

export default FileDropdown;
