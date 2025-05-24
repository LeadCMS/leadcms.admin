import Dropzone, { Accept, FileRejection } from "react-dropzone";
import { BoxStyled } from "./index.styled";
import { Button, Grid, Box } from "@mui/material";
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

const FileDropdown = ({
  acceptMIME,
  maxFileSize,
  onChange,
  data,
  error,
  helperText,
}: FileDropdownProps) => {
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
            accept={{ key: [acceptMIME] } as Accept}
          >
            {({ getRootProps, getInputProps }) => (
              <Grid container spacing={0} direction="row" justifyContent="center">
                <div {...getRootProps()}>
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
          <Grid container direction="column" justifyContent="center">
            <Grid size={{ xs: 12 }} style={{ textAlign: "center" }}>
              <Box
                component="img"
                sx={{
                  objectFit: "contain",
                }}
                alt="Cover image preview"
                src={data.url}
              />
            </Grid>
            <Grid size={{ xs: 12 }} style={{ textAlign: "center" }}>
              <Button variant="outlined" onClick={onReset}>
                Reset
              </Button>
            </Grid>
          </Grid>
        )}
      </BoxStyled>
    </>
  );
};

export default FileDropdown;
