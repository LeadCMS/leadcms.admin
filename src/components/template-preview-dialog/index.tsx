import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Box,
  Alert,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { EmailTemplateDetailsDto } from "@lib/network/swagger-client";
import { showApiError } from "@utils/api-error-parser";
import { TemplatePreview } from "@components/template-preview";

export interface PreviewStep {
  name: string;
  template?: EmailTemplateDetailsDto | null;
  templateId?: number | null;
}

export interface TemplatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  /** List of steps for multi-step navigation. */
  steps?: PreviewStep[];
  /** Index of the initially selected step. */
  initialStepIndex?: number;
  /** Pre-loaded template data (single-step fallback). */
  template?: EmailTemplateDetailsDto | null;
  /** Template ID (single-step fallback). */
  templateId?: number | null;
}

export const TemplatePreviewDialog = ({
  open,
  onClose,
  steps,
  initialStepIndex = 0,
  template: externalTemplate,
  templateId: externalTemplateId,
}: TemplatePreviewDialogProps) => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [currentIndex, setCurrentIndex] = useState(initialStepIndex);
  const [fetchedTemplates, setFetchedTemplates] = useState<Record<number, EmailTemplateDetailsDto>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset index when dialog opens with a new step
  useEffect(() => {
    if (open) setCurrentIndex(initialStepIndex);
  }, [open, initialStepIndex]);

  // Determine the active step
  const activeStep: PreviewStep | null = steps?.length
    ? steps[currentIndex] ?? null
    : externalTemplate || externalTemplateId
    ? {
        name: externalTemplate?.name || "Template Preview",
        template: externalTemplate,
        templateId: externalTemplateId,
      }
    : null;

  const activeTemplateId = activeStep?.templateId ?? null;
  const preLoadedTemplate = activeStep?.template ?? null;
  const resolvedTemplate =
    preLoadedTemplate || (activeTemplateId ? fetchedTemplates[activeTemplateId] : null);

  const fetchTemplate = useCallback(
    async (id: number) => {
      if (fetchedTemplates[id]) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await client.api.emailTemplatesDetail(id);
        setFetchedTemplates((prev) => ({ ...prev, [id]: data }));
      } catch (err) {
        setError("Failed to load email template.");
        showApiError(err, notificationsService, undefined, "Failed to load email template.");
      } finally {
        setLoading(false);
      }
    },
    [fetchedTemplates, client, notificationsService]
  );

  useEffect(() => {
    if (open && activeTemplateId && !preLoadedTemplate) {
      void fetchTemplate(activeTemplateId);
    }
  }, [open, activeTemplateId, preLoadedTemplate, fetchTemplate]);

  useEffect(() => {
    if (!open) {
      setFetchedTemplates({});
      setError(null);
    }
  }, [open]);

  const hasMultiple = (steps?.length ?? 0) > 1;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < (steps?.length ?? 1) - 1;

  useEffect(() => {
    if (!open || !hasMultiple) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canPrev) {
        setCurrentIndex((i) => i - 1);
      } else if (e.key === "ArrowRight" && canNext) {
        setCurrentIndex((i) => i + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, hasMultiple, canPrev, canNext]);

  const titleText = activeStep?.name
    ? steps?.length
      ? `Step ${currentIndex + 1}: ${activeStep.name}`
      : activeStep.name
    : "Template Preview";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: "85vh" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          {hasMultiple && (
            <IconButton
              size="small"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={!canPrev}
            >
              <ChevronLeft size={20} />
            </IconButton>
          )}
          <Typography variant="h6" component="span" noWrap>
            {titleText}
          </Typography>
          {hasMultiple && (
            <IconButton
              size="small"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={!canNext}
            >
              <ChevronRight size={20} />
            </IconButton>
          )}
          {hasMultiple && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, flexShrink: 0 }}>
              ({currentIndex + 1}/{steps?.length})
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {error && !loading && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        {resolvedTemplate && !loading && (
          <TemplatePreview
            key={`${currentIndex}-${activeTemplateId}`}
            source={resolvedTemplate.bodyTemplate || ""}
            subject={resolvedTemplate.subject || ""}
            fromEmail={resolvedTemplate.fromEmail || ""}
            fromName={resolvedTemplate.fromName || ""}
            language={resolvedTemplate.language || ""}
            height="calc(85vh - 120px)"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
