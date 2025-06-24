import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { buildAbsoluteUrl } from "@lib/network/utils";

interface MediaPreviewProps {
  file: any | null;
  open: boolean;
  onClose: () => void;
  onDownload: (file: any) => void;
  onCopyLink: (file: any) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const formatFileSize = (size: number | undefined) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

export const MediaPreview = ({
  file,
  open,
  onClose,
  onDownload,
  onCopyLink,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: MediaPreviewProps) => {
  const [tab, setTab] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  if (!file) return null;

  const handleCopyLink = () => {
    onCopyLink(file);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Navigation button style (match preview tab style)
  const navButtonProps = {
    variant: "contained" as const,
    size: "small" as const,
    sx: { minWidth: 32, minHeight: 40, borderRadius: 2 },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "stretch", width: "100%" }}>
        {/* Left nav button space */}
        <Box sx={{ width: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hasPrev && (
            <Button onClick={onPrev} {...navButtonProps}>
              {"<"}
            </Button>
          )}
        </Box>
        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <DialogTitle>{file.name}</DialogTitle>
          <DialogContent>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
              <Tab label="Preview" />
              <Tab label="Details" />
            </Tabs>
            {tab === 0 && (
              <Box
                sx={{
                  width: "100%",
                  height: "60vh",
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <img
                  src={buildAbsoluteUrl(file.location || file.url) || "/images/placeholder.svg"}
                  alt={file.name}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </Box>
            )}
            {tab === 1 && (
              <Box sx={{ mt: 2 }}>
                {/* Details in rows */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography>{file.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Size
                    </Typography>
                    <Typography>{formatFileSize(file.size)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Typography>{file.mimeType}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Modified
                    </Typography>
                    <Typography>{file.updatedAt || file.createdAt}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      URL
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <input
                        type="text"
                        value={buildAbsoluteUrl(file.location || file.url)}
                        readOnly
                        style={{
                          flex: 1,
                          padding: 6,
                          fontSize: 14,
                          border: "1px solid #eee",
                          borderRadius: 4,
                          background: "#fafafa",
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleCopyLink}
                        sx={{ ml: 1 }}
                      >
                        {linkCopied ? "Copied!" : "Copy"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ gap: 2, px: 3, pb: 2 }}>
            <Button onClick={onClose} variant="outlined">
              Close
            </Button>
            <Button
              onClick={() => onDownload(file)}
              variant="outlined"
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
            <Button onClick={handleCopyLink} variant="contained" startIcon={<FileCopyIcon />}>
              {linkCopied ? "Copied!" : "Copy Link"}
            </Button>
          </DialogActions>
        </Box>
        {/* Right nav button space */}
        <Box sx={{ width: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {hasNext && (
            <Button onClick={onNext} {...navButtonProps}>
              {">"}
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};
