import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Grid,
  Paper,
  Tooltip
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ApiErrorDisplay } from "@components/api-error-display";

export interface FileUploadStatus {
  file: File;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
}

interface MediaUploadDialogProps {
  open: boolean;
  onClose: () => void;
  currentScopeUid: string;
  uploadFolderName: string;
  setUploadFolderName: (v: string) => void;
  uploadFiles: File[];
  uploading: boolean;
  uploadError: string | null;
  uploadFolderError: string | null;
  handleDropFiles: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadFiles: (files: File[], 
    setFileStatuses: (statuses: FileUploadStatus[]) => void) => void;
  setUploadError?: (err: string | null) => void;
  setUploadFolderError?: (err: string | null) => void;
  fileStatuses: FileUploadStatus[];
  onRemoveFile: (fileName: string) => void;
}

export const MediaUploadDialog = ({
  open,
  onClose,
  currentScopeUid,
  uploadFolderName,
  setUploadFolderName,
  uploadFiles,
  uploading,
  uploadError,
  uploadFolderError,
  handleDropFiles,
  handleFileInputChange,
  handleUploadFiles,
  setUploadError,
  setUploadFolderError,
  fileStatuses,
  onRemoveFile
}: MediaUploadDialogProps) => {
  // Reset errors and statuses on open/close or file list change
  useEffect(() => {
    if (setUploadError) setUploadError(null);
    if (setUploadFolderError) setUploadFolderError(null);
  }, [open, uploadFiles, setUploadError, setUploadFolderError]);

  const onUpload = () => {
    // Prevent upload if uploading to root and folder name is missing
    if (!currentScopeUid && !uploadFolderName.trim()) {
      if (setUploadFolderError) {
        setUploadFolderError("Folder name is required when uploading to root");
      }
      return;
    }
    // Only retry files that are not already uploaded
    const filesToUpload = uploadFiles.filter((file) => {
      const statusObj = fileStatuses.find((s) => s.file.name === file.name);
      return !statusObj || statusObj.status === "idle" || statusObj.status === "error";
    });
    if (filesToUpload.length === 0) {
      return;
    }
    handleUploadFiles(
      filesToUpload,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        Upload Files to /
        {currentScopeUid ? (
          <>
            {currentScopeUid} {" "}
            <input
              type="text"
              placeholder="(optional subfolder)"
              value={uploadFolderName}
              onChange={(e) => setUploadFolderName(e.target.value)}
              style={{
                marginLeft: 8,
                padding: 2,
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4,
                width: 160
              }}
            />
          </>
        ) : (
          <input
            type="text"
            placeholder="folder name (required)"
            value={uploadFolderName}
            onChange={(e) => setUploadFolderName(e.target.value)}
            style={{
              marginLeft: 4,
              padding: 2,
              fontSize: 16,
              border: "1px solid #ccc",
              borderRadius: 4,
              width: 180
            }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            border: "2px dashed #bdbdbd",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: "#fafafa",
            cursor: "pointer",
            mb: 2
          }}
          onDrop={handleDropFiles}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById("file-upload-input")?.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: "#bdbdbd", mb: 1 }} />
          <Typography variant="body1" sx={{ mb: 1 }}>
            Drag and drop files here or click to browse
          </Typography>
          <input
            id="file-upload-input"
            type="file"
            multiple
            hidden
            onChange={handleFileInputChange}
          />
        </Box>
        {(uploadFiles.length > 0) && (
          <Paper sx={{ mb: 2, p: 2, width: "100%", overflowX: "auto" }}>
            <Grid container spacing={1} alignItems="center" sx={{ width: "100%" }}>
              <Grid size={{ xs: 12, sm: 8 }}><b>File</b></Grid>
              <Grid size={{ xs: 12, sm: 2 }}><b>Status</b></Grid>
              <Grid size={{ xs: 12, sm: 2 }}><b>Action</b></Grid>
            </Grid>
            {uploadFiles.map((file) => {
              const statusObj = fileStatuses.find((s) => s.file.name === file.name);
              const status = statusObj?.status || "idle";
              const error = statusObj?.error;
              return (
                <Grid
                  container
                  spacing={1}
                  alignItems="center"
                  key={file.name}
                  sx={{ width: "100%" }}
                >
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Typography>{file.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    {status === "uploading" && <CircularProgress size={18} />}
                    {status === "success" && (
                      <Typography color="success.main">Uploaded</Typography>
                    )}
                    {status === "error" && (
                      <Tooltip title={error || "Error"} arrow>
                        <Box display="flex" alignItems="center" sx={{ cursor: "pointer" }}>
                          <Typography color="error" sx={{ mr: 0.5 }}>
                            Failed
                          </Typography>
                          <InfoOutlinedIcon fontSize="small" color="error" />
                        </Box>
                      </Tooltip>
                    )}
                    {status === "idle" && (
                      <Typography color="text.secondary">Ready</Typography>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    {(status === "idle" || status === "error") && (
                      <IconButton
                        aria-label="Remove"
                        onClick={() => onRemoveFile(file.name)}
                        disabled={uploading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              );
            })}
          </Paper>
        )}
        {uploadError && (
          <ApiErrorDisplay error={uploadError} fileName={uploadFiles[0]?.name} />
        )}
        {currentScopeUid === "" && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Note: Uploading to root folder. Subfolder name is required.
          </Typography>
        )}
        {uploadFolderError && (
          <Typography color="error" sx={{ mt: 1 }}>
            {uploadFolderError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
          onClick={onUpload}
          disabled={uploadFiles.length === 0 || uploading}
        >
          {uploading
            ? "Uploading..."
            : fileStatuses.some((f) => f.status === "error")
              ? `Retry Failed (${fileStatuses.filter((f) => f.status === "error").length})`
              : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
