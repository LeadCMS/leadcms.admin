import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import type { Theme } from "@mui/material/styles";
import { X, Trash2, ImagePlus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImageSelectionDialog } from "@components/image-selection-dialog/image-selection-dialog";
import { buildAbsoluteUrlWithCacheBust } from "@lib/network/utils";
import { Link as RouterLink } from "react-router-dom";

export interface AICoverDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt: string | null, sampleImagePaths: string[]) => void;
  onEdit?: (prompt: string, sampleImagePaths: string[]) => void;
  title: string;
  description: string;
  slug: string;
  coverImageUrl?: string;
  language?: string;
  mode?: "generate" | "edit";
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  onViewErrorDetails?: () => void;
}

const MAX_SAMPLE_IMAGES = 5;

export const AICoverDialog = ({
  open,
  onClose,
  onGenerate,
  onEdit,
  title,
  description,
  slug,
  coverImageUrl,
  language,
  mode = "generate",
  isLoading = false,
  error,
  onErrorClear,
  onViewErrorDetails,
}: AICoverDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [sampleImagePaths, setSampleImagePaths] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const lastModeRef = useRef<"generate" | "edit" | null>(null);

  const isEditMode = mode === "edit";
  const hasRequiredInfo = useMemo(() => {
    if (isEditMode) {
      return (
        Boolean(title?.trim()) &&
        Boolean(description?.trim()) &&
        Boolean(coverImageUrl?.trim()) &&
        Boolean(prompt.trim())
      );
    }
    return Boolean(title?.trim()) && Boolean(description?.trim()) && Boolean(slug?.trim());
  }, [coverImageUrl, description, isEditMode, prompt, slug, title]);

  useEffect(() => {
    if (!open) return;
    // Keep errors visible when dialog re-opens after a failed request.
  }, [open]);

  useEffect(() => {
    if (!open) {
      lastModeRef.current = mode;
      return;
    }

    if (lastModeRef.current && lastModeRef.current !== mode) {
      setPrompt("");
      setSampleImagePaths([]);
      if (onErrorClear) {
        onErrorClear();
      }
    }

    lastModeRef.current = mode;
  }, [mode, onErrorClear, open]);

  const handleClose = () => {
    setPrompt("");
    setSampleImagePaths([]);
    if (onErrorClear) {
      onErrorClear();
    }
    onClose();
  };

  const handleSelectImage = (imageUrl: string) => {
    if (sampleImagePaths.includes(imageUrl)) return;
    if (sampleImagePaths.length >= MAX_SAMPLE_IMAGES) return;
    setSampleImagePaths((prev) => [...prev, imageUrl]);
  };

  const handleSelectImages = (imageUrls: string[]) => {
    setSampleImagePaths((prev) => {
      const next = [...prev];
      imageUrls.forEach((imageUrl) => {
        if (next.includes(imageUrl)) return;
        if (next.length >= MAX_SAMPLE_IMAGES) return;
        next.push(imageUrl);
      });
      return next;
    });
  };

  const handleRemoveImage = (imageUrl: string) => {
    setSampleImagePaths((prev) => prev.filter((path) => path !== imageUrl));
  };

  const handleGenerate = () => {
    if (!hasRequiredInfo || isLoading) return;
    const trimmedPrompt = prompt.trim();
    if (isEditMode) {
      onEdit?.(trimmedPrompt, sampleImagePaths);
      return;
    }
    onGenerate(trimmedPrompt ? trimmedPrompt : null, sampleImagePaths);
  };

  const initialFolder = slug ? slug.replace(/^\/+|\/+$/g, "") : "";

  return (
    <>
      <Backdrop
        open={open}
        sx={{
          zIndex: (theme: Theme) => theme.zIndex.modal - 1,
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{
          zIndex: (theme: Theme) => theme.zIndex.modal,
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Sparkles size={20} />
            </Box>
            <Box>
              <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                {isEditMode ? "Edit Cover with AI" : "Generate Cover with AI"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
                {isEditMode
                  ? "Update your existing cover image"
                  : "Create a cover image based on your content"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {!hasRequiredInfo && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {isEditMode
                ? "Please provide a prompt before editing the cover image."
                : "Please set Title, Description, and Slug before generating a cover image."}
            </Alert>
          )}

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Title
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {title || "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontWeight: 500,
                }}
              >
                {description || "-"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Slug
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {slug || "-"}
              </Typography>
            </Box>
            <TextField
              label={isEditMode ? "Prompt" : "Prompt (optional)"}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isEditMode
                  ? "Describe how you want to change the current cover"
                  : "Describe the mood, style, or details you want"
              }
              multiline
              minRows={3}
              fullWidth
              required={isEditMode}
            />

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sample cover images (optional)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sampleImagePaths.length}/{MAX_SAMPLE_IMAGES}
                </Typography>
              </Box>

              <Stack spacing={1} sx={{ mt: 1 }}>
                {sampleImagePaths.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    No sample cover images selected.
                  </Typography>
                )}

                {sampleImagePaths.map((path) => (
                  <Box
                    key={path}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      border: "1px solid",
                      borderColor: "grey.200",
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src={buildAbsoluteUrlWithCacheBust(path)}
                      alt="Sample"
                      sx={{ width: 56, height: 56, objectFit: "cover", borderRadius: 1 }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {path}
                    </Typography>
                    <IconButton size="small" onClick={() => handleRemoveImage(path)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ImagePlus size={16} />}
                  onClick={() => setGalleryOpen(true)}
                  disabled={sampleImagePaths.length >= MAX_SAMPLE_IMAGES}
                >
                  Add sample cover image
                </Button>
                <Typography variant="caption" color="text.secondary">
                  If no sample cover images are provided, AI will pick cover references from other
                  posts when available. Otherwise, it will infer the best match from the prompt,
                  title, description, and the{" "}
                  <Link component={RouterLink} to="/settings" underline="hover">
                    Site Profile Cover Instructions
                  </Link>
                  .
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 3 }}
              action={
                onViewErrorDetails ? (
                  <Button color="error" size="small" onClick={onViewErrorDetails}>
                    View Details
                  </Button>
                ) : undefined
              }
            >
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2, gap: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={isLoading} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            disabled={!hasRequiredInfo || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <Sparkles size={16} />}
            sx={{
              minWidth: 160,
              fontWeight: 600,
              px: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #694d90 100%)",
              },
              "&:disabled": {
                background: "rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            {isLoading
              ? isEditMode
                ? "Editing..."
                : "Generating..."
              : isEditMode
              ? "Edit"
              : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      <ImageSelectionDialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={(imageUrl) => {
          handleSelectImage(imageUrl);
          setGalleryOpen(false);
        }}
        onSelectMultiple={(imageUrls) => {
          handleSelectImages(imageUrls);
          setGalleryOpen(false);
        }}
        initialFolder={initialFolder}
        selectionMode="multiple"
        maxSelection={MAX_SAMPLE_IMAGES}
      />
    </>
  );
};
