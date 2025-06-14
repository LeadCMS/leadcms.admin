import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
  handleUploadFiles: () => void;
  setUploadFiles: (files: File[]) => void;
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
  handleUploadFiles
}: MediaUploadDialogProps) => (
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
        {uploadFiles.length > 0 && (
          <Box mt={2}>
            {uploadFiles.map((file) => (
              <Box key={file.name} display="flex" alignItems="center" mb={1}>
                <Typography sx={{ flex: 1 }}>{file.name}</Typography>
                {uploading ? (
                  <Box width={80} ml={2}>
                    <CircularProgress size={20} />
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>
        )}
        {uploadError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {uploadError}
          </Typography>
        )}
      </Box>
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
        Cancel
      </Button>
      <Button
        variant="contained"
        startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
        onClick={handleUploadFiles}
        disabled={uploadFiles.length === 0 || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </DialogActions>
  </Dialog>
);
