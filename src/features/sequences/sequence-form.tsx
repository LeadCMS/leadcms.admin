import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRequestContext } from "providers/request-provider";
import { useNotificationsService, useSaveShortcut } from "@hooks";
import { useConfig } from "@providers/config-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { LanguageSelect } from "@components/language-select";
import { CoreModule, getCoreModuleRoute, getViewFormRoute } from "lib/router";
import { ModuleWrapper } from "@components/module-wrapper";
import { sequenceFormBreadcrumbLinks, sequenceAddHeader, sequenceEditHeader } from "./constants";
import {
  EmailGroupDetailsDto,
  SequenceCreateDto,
  SequenceDetailsDto,
  SequenceUpdateDto,
  SequenceStepCreateDto,
  SequenceStepDetailsDto,
  EmailTemplateDetailsDto,
  SegmentDetailsDto,
} from "lib/network/swagger-client";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Step,
  StepButton,
  Stepper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Calendar,
  Clock,
  Eye,
  Info,
  Mail,
  Plus,
  Save,
  Trash2,
  Zap,
  X,
} from "lucide-react";
import { showApiError } from "@utils/api-error-parser";
import { TemplatePreviewDialog } from "@components/template-preview-dialog";
import { ENTITY_KEYS, hasEntity } from "@utils/entity-availability";
import { timezones } from "utils/constants";
import { formatTimezoneLong } from "utils/timezone-helpers";

const steps = ["Details", "Enrollment", "Steps", "Settings", "Review"];

const stepDescriptions = [
  "Set the sequence name and description",
  "Configure how contacts are enrolled",
  "Add email steps with timing and delivery rules",
  "Configure exit conditions and scheduling",
  "Review your sequence before saving",
];

const delayUnits = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface SequenceFormProps {
  mode: "create" | "edit";
  sequenceId?: number;
}

interface StepFormData {
  id?: number | null;
  localId: string;
  emailTemplateId: number | "";
  name: string;
  delayValue: number;
  delayUnit: string;
  sendAt: string;
  allowedWeekDays: string[];
}

const getTimingMode = (step: StepFormData): "immediate" | "delay" => {
  if (step.delayValue === 0 && !step.sendAt && step.allowedWeekDays.length === 0) {
    return "immediate";
  }
  return "delay";
};

const getTimingSummary = (step: StepFormData): string => {
  if (getTimingMode(step) === "immediate") return "Immediately";
  const parts: string[] = [];
  if (step.delayValue > 0) {
    const unit = step.delayValue === 1 ? step.delayUnit.replace(/s$/, "") : step.delayUnit;
    parts.push(`Wait ${step.delayValue} ${unit}`);
  }
  if (step.sendAt) parts.push(`at ${step.sendAt}`);
  if (step.allowedWeekDays.length > 0) {
    const isWeekdays =
      step.allowedWeekDays.length === 5 &&
      !step.allowedWeekDays.includes("Saturday") &&
      !step.allowedWeekDays.includes("Sunday");
    parts.push(
      isWeekdays ? "weekdays only" : step.allowedWeekDays.map((d) => d.slice(0, 3)).join(", ")
    );
  }
  return parts.join(" \u00B7 ") || "No delay";
};

const getBrowserTimezoneOffset = () => {
  const browserOffset = -new Date().getTimezoneOffset();
  const values = [...new Set(timezones.map((tz) => tz.value))];
  return values.reduce((prev, curr) =>
    Math.abs(curr - browserOffset) < Math.abs(prev - browserOffset) ? curr : prev
  );
};

const calculateProjectedDates = (steps: StepFormData[], enrollmentDate: Date): Date[] => {
  const dates: Date[] = [];
  let current = new Date(enrollmentDate);
  for (const step of steps) {
    current = new Date(current);
    const delayMs =
      step.delayUnit === "minutes"
        ? step.delayValue * 60 * 1000
        : step.delayUnit === "hours"
        ? step.delayValue * 3600 * 1000
        : step.delayValue * 86400 * 1000;
    current = new Date(current.getTime() + delayMs);
    if (step.sendAt) {
      const [h, m] = step.sendAt.split(":").map(Number);
      const target = new Date(current);
      target.setHours(h, m, 0, 0);
      if (target <= current) target.setDate(target.getDate() + 1);
      current = target;
    }
    if (step.allowedWeekDays.length > 0) {
      const dayMap: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      const allowed = step.allowedWeekDays.map((d) => dayMap[d]);
      let guard = 0;
      while (!allowed.includes(current.getDay()) && guard < 7) {
        current.setDate(current.getDate() + 1);
        guard++;
      }
    }
    dates.push(new Date(current));
  }
  return dates;
};

export const SequenceForm = ({ mode, sequenceId }: SequenceFormProps) => {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  const hasSegments = hasEntity(config?.entities, ENTITY_KEYS.segment);
  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;

  const [activeStep, setActiveStep] = useState(0);
  const [savingAction, setSavingAction] = useState<"draft" | "activate" | "save" | null>(null);
  const saving = savingAction !== null;
  const [loading, setLoading] = useState(isEdit);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [previewStepIndex, setPreviewStepIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingActivateAction, setPendingActivateAction] = useState<(() => Promise<void>) | null>(
    null
  );
  const [sequence, setSequence] = useState<SequenceDetailsDto | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState(() => {
    if (!isEdit && isLanguageFilterActive && selectedLanguage !== "all") {
      return selectedLanguage;
    }
    if (!hasMultipleLanguages) {
      return config?.defaultLanguage || "";
    }
    return "";
  });
  const [stopOnReply, setStopOnReply] = useState(true);
  const [useContactTimeZone, setUseContactTimeZone] = useState(false);
  const [timeZone, setTimeZone] = useState<number>(getBrowserTimezoneOffset());
  const [previewDate, setPreviewDate] = useState<Date>(new Date());

  // Enrollment
  const [enrollmentModes, setEnrollmentModes] = useState<string[]>(["manual"]);
  const [includeSegmentIds, setIncludeSegmentIds] = useState<number[]>([]);
  const [excludeSegmentIds, setExcludeSegmentIds] = useState<number[]>([]);
  const [reentryPolicy, setReentryPolicy] = useState<
    "OnceEver" | "AllowAfterCompletion" | "Always"
  >("OnceEver");

  // Steps
  const [sequenceSteps, setSequenceSteps] = useState<StepFormData[]>([]);

  // Data lists
  const [segments, setSegments] = useState<SegmentDetailsDto[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateDetailsDto[]>([]);
  const [emailGroups, setEmailGroups] = useState<EmailGroupDetailsDto[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingEmailGroups, setLoadingEmailGroups] = useState(false);
  const [emailGroupFilter, setEmailGroupFilter] = useState<number | "">("");

  const sequenceStatus = (sequence?.status || "Draft") as NonNullable<SequenceDetailsDto["status"]>;
  const isDraftEdit = isEdit && sequenceStatus === "Draft";
  const isReadOnly = isEdit && sequenceStatus !== "Draft" && sequenceStatus !== "Paused";
  const effectiveSequenceLanguage = language;

  const canEditDetails = !isEdit || isDraftEdit;

  const getSequenceViewRoute = (id: number) =>
    `${getCoreModuleRoute(CoreModule.sequences)}/${getViewFormRoute(id)}`;

  // Load sequence data (edit mode only)
  useEffect(() => {
    if (!isEdit || !sequenceId) return;
    const load = async () => {
      try {
        const result = await client.api.sequencesDetail(sequenceId);
        const data = result.data;
        setSequence(data);
        setName(data.name);
        setDescription(data.description || "");
        setLanguage(data.language || "");
        setStopOnReply(data.stopOnReply ?? true);
        setUseContactTimeZone(data.useContactTimeZone ?? false);
        if (data.timeZone != null) setTimeZone(data.timeZone);
        if (data.enrollment) {
          setEnrollmentModes(data.enrollment.modes || ["manual"]);
          setIncludeSegmentIds(data.enrollment.includeSegmentIds || []);
          setExcludeSegmentIds(data.enrollment.excludeSegmentIds || []);
          setReentryPolicy(data.enrollment.reentryPolicy || "OnceEver");
        }
        if (data.steps && data.steps.length > 0) {
          setSequenceSteps(
            (data.steps || []).map((s: SequenceStepDetailsDto, idx: number) => ({
              id: s.id ?? null,
              localId: `step-${s.id || idx}`,
              emailTemplateId: s.emailTemplateId || "",
              name: s.name || "",
              delayValue: s.timing?.delay?.value ?? 0,
              delayUnit: s.timing?.delay?.unit ?? "days",
              sendAt: s.timing?.sendAt ?? "",
              allowedWeekDays: s.timing?.allowedWeekDays ?? [],
            }))
          );
        }
      } catch (error) {
        showApiError(error, notificationsService, undefined, "Failed to load sequence.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, sequenceId, client, notificationsService]);

  useEffect(() => {
    if (isEdit || language || !isLanguageFilterActive || selectedLanguage === "all") {
      return;
    }

    setLanguage(selectedLanguage);
  }, [isEdit, isLanguageFilterActive, language, selectedLanguage]);

  // Load segments
  useEffect(() => {
    const load = async () => {
      if (!hasSegments) {
        setSegments([]);
        setLoadingSegments(false);
        return;
      }
      setLoadingSegments(true);
      try {
        const result = await client.api.segmentsList();
        setSegments(result.data || []);
      } catch {
        // ignore
      } finally {
        setLoadingSegments(false);
      }
    };
    load();
  }, [client, hasSegments]);

  // Load templates
  useEffect(() => {
    const load = async () => {
      setLoadingTemplates(true);
      try {
        const result = await client.api.emailTemplatesList();
        setTemplates(result.data || []);
      } catch {
        // ignore
      } finally {
        setLoadingTemplates(false);
      }
    };
    load();
  }, [client]);

  // Load email groups for template filtering
  useEffect(() => {
    const load = async () => {
      setLoadingEmailGroups(true);
      try {
        const result = await client.api.emailGroupsList();
        setEmailGroups(result.data || []);
      } catch {
        // ignore
      } finally {
        setLoadingEmailGroups(false);
      }
    };
    load();
  }, [client]);

  useEffect(() => {
    if (emailGroupFilter === "") return;
    const selectedGroup = emailGroups.find((group) => group.id === emailGroupFilter);
    if (!selectedGroup) {
      setEmailGroupFilter("");
      return;
    }
    if (effectiveSequenceLanguage && selectedGroup.language !== effectiveSequenceLanguage) {
      setEmailGroupFilter("");
    }
  }, [emailGroupFilter, emailGroups, effectiveSequenceLanguage]);

  const canProceed = useCallback(() => {
    switch (activeStep) {
      case 0:
        return name.trim() !== "" && language !== "";
      case 1:
        return true;
      case 2:
        return sequenceSteps.length > 0 && sequenceSteps.every((s) => s.emailTemplateId !== "");
      case 3:
        return true;
      default:
        return true;
    }
  }, [activeStep, name, language, sequenceSteps]);

  const canSaveDraft = !isEdit && name.trim() !== "" && language !== "";
  const canActivate =
    !isReadOnly && name.trim() !== "" && language !== "" && sequenceSteps.length > 0;

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    if (isEdit && sequenceId) {
      navigate(getSequenceViewRoute(sequenceId));
    } else {
      navigate(getCoreModuleRoute(CoreModule.sequences));
    }
  };

  const handleDelete = async () => {
    if (!sequenceId) return;
    setDeleting(true);
    try {
      await client.api.sequencesDelete(sequenceId);
      notificationsService.success("Sequence deleted.");
      navigate(getCoreModuleRoute(CoreModule.sequences));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to delete sequence.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const buildSteps = (): SequenceStepCreateDto[] =>
    sequenceSteps.map((s, idx) => ({
      id: s.id ?? undefined,
      emailTemplateId: s.emailTemplateId as number,
      name: s.name.trim() || `Step ${idx + 1}`,
      type: "Email" as const,
      timing: {
        delay: {
          value: s.delayValue,
          unit: s.delayUnit,
        },
        sendAt: s.sendAt || undefined,
        allowedWeekDays: s.allowedWeekDays.length > 0 ? s.allowedWeekDays : undefined,
      },
    }));

  const buildCreatePayload = (): SequenceCreateDto => ({
    name: name.trim(),
    description: description.trim() || undefined,
    language: effectiveSequenceLanguage,
    stopOnReply,
    useContactTimeZone,
    timeZone: timeZone || undefined,
    enrollment: {
      modes: enrollmentModes,
      includeSegmentIds: includeSegmentIds.length > 0 ? includeSegmentIds : undefined,
      excludeSegmentIds: excludeSegmentIds.length > 0 ? excludeSegmentIds : undefined,
      reentryPolicy,
    },
    steps: buildSteps(),
  });

  const handleSaveDraft = async () => {
    if (!name.trim()) {
      notificationsService.error("Sequence name is required.");
      return;
    }
    setSavingAction("draft");
    try {
      await client.api.sequencesCreate(buildCreatePayload());
      notificationsService.success("Sequence draft saved.");
      navigate(getCoreModuleRoute(CoreModule.sequences));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to save sequence draft.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleSaveAndActivate = async () => {
    if (!name.trim()) {
      notificationsService.error("Sequence name is required.");
      return;
    }
    if (sequenceSteps.length === 0) {
      notificationsService.error("Add at least one step.");
      return;
    }
    setSavingAction("activate");
    try {
      const result = await client.api.sequencesCreate(buildCreatePayload());
      const newId = result.data?.id;
      if (newId) {
        await client.api.sequencesActivateCreate(newId);
      }
      notificationsService.success("Sequence saved and activated.");
      navigate(getCoreModuleRoute(CoreModule.sequences));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to save and activate sequence.");
    } finally {
      setSavingAction(null);
    }
  };

  const buildEditPayload = (): SequenceUpdateDto => ({
    name: name.trim(),
    description: description.trim() || undefined,
    language: effectiveSequenceLanguage,
    stopOnReply,
    useContactTimeZone,
    timeZone: timeZone || undefined,
    enrollment: {
      modes: enrollmentModes,
      includeSegmentIds: includeSegmentIds.length > 0 ? includeSegmentIds : undefined,
      excludeSegmentIds: excludeSegmentIds.length > 0 ? excludeSegmentIds : undefined,
      reentryPolicy,
    },
    steps: buildSteps(),
  });

  const handleSaveDraftEdit = async () => {
    if (!sequenceId || !name.trim()) {
      notificationsService.error("Sequence name is required.");
      return;
    }
    setSavingAction("draft");
    try {
      await client.api.sequencesPartialUpdate(sequenceId, buildEditPayload());
      notificationsService.success("Sequence draft saved.");
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to save sequence draft.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !sequenceId) {
      notificationsService.error("Sequence name is required.");
      return;
    }
    setSavingAction("save");
    try {
      await client.api.sequencesPartialUpdate(sequenceId, buildEditPayload());
      notificationsService.success("Sequence updated.");
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to update sequence.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleActivateExisting = async () => {
    if (!sequenceId || !canActivate) {
      notificationsService.error("Add a name and at least one step before activating.");
      return;
    }
    setSavingAction("activate");
    try {
      await client.api.sequencesPartialUpdate(sequenceId, buildEditPayload());
      await client.api.sequencesActivateCreate(sequenceId);
      notificationsService.success("Sequence saved and activated.");
      navigate(getSequenceViewRoute(sequenceId));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to activate sequence.");
    } finally {
      setSavingAction(null);
    }
  };

  useSaveShortcut(
    isEdit ? (isDraftEdit ? handleSaveDraftEdit : handleSave) : handleSaveDraft,
    !saving && !!name.trim() && (isEdit || canSaveDraft)
  );

  const addStep = () => {
    const id = `step-${Date.now()}`;
    setSequenceSteps((prev) => [
      ...prev,
      {
        localId: id,
        emailTemplateId: "",
        name: `Step ${prev.length + 1}`,
        delayValue: prev.length === 0 ? 0 : 1,
        delayUnit: "days",
        sendAt: "",
        allowedWeekDays: [],
      },
    ]);
  };

  const removeStep = (localId: string) => {
    setSequenceSteps((prev) => prev.filter((s) => s.localId !== localId));
  };

  const updateStep = (localId: string, updates: Partial<StepFormData>) => {
    setSequenceSteps((prev) => prev.map((s) => (s.localId === localId ? { ...s, ...updates } : s)));
  };

  const moveStep = (localId: string, direction: "up" | "down") => {
    setSequenceSteps((prev) => {
      const currentIndex = prev.findIndex((step) => step.localId === localId);
      if (currentIndex === -1) return prev;
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const [item] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const toggleEnrollmentMode = (mode: string) => {
    setEnrollmentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const selectedSegments = segments.filter((s) => includeSegmentIds.includes(s.id ?? 0));
  const excludedSegments = segments.filter((s) => excludeSegmentIds.includes(s.id ?? 0));
  const availableTemplateGroups = emailGroups.filter(
    (group) => !effectiveSequenceLanguage || group.language === effectiveSequenceLanguage
  );
  const filteredTemplates = templates.filter((template) => {
    if (effectiveSequenceLanguage && template.language !== effectiveSequenceLanguage) {
      return false;
    }
    if (emailGroupFilter !== "" && template.emailGroupId !== emailGroupFilter) {
      return false;
    }
    return true;
  });

  const getTemplateMeta = (template?: EmailTemplateDetailsDto | null) => {
    if (!template) return "";
    const groupName =
      template.emailGroup?.name ||
      emailGroups.find((group) => group.id === template.emailGroupId)?.name ||
      "";
    return [template.language, groupName].filter(Boolean).join(" / ");
  };

  const getTemplateDisplayLabel = (template?: EmailTemplateDetailsDto | null) => {
    if (!template) return "";
    const meta = getTemplateMeta(template);
    return meta ? `${template.name} (${meta})` : template.name;
  };

  if (loading) {
    return (
      <ModuleWrapper
        breadcrumbs={sequenceFormBreadcrumbLinks}
        currentBreadcrumb={sequenceEditHeader}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </ModuleWrapper>
    );
  }

  const actionButtons = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          pl: { sm: 4 },
        }}
      >
        {isEdit && sequenceId && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={<Trash2 size={18} />}
            size="medium"
            disabled={deleting}
          >
            Delete
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          onClick={handleCancel}
          startIcon={<X size={18} />}
          size="medium"
        >
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<ArrowLeft size={18} />}
            size="medium"
          >
            Back
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          pr: { sm: 4 },
        }}
      >
        {!isEdit && canSaveDraft && (
          <Button
            variant="outlined"
            onClick={() => void handleSaveDraft()}
            disabled={saving}
            startIcon={
              savingAction === "draft" ? <CircularProgress size={16} /> : <Save size={18} />
            }
            size="medium"
          >
            {savingAction === "draft" ? "Saving..." : "Save Draft"}
          </Button>
        )}

        {isEdit && !isReadOnly && (
          <Button
            variant="outlined"
            onClick={() => void (isDraftEdit ? handleSaveDraftEdit() : handleSave())}
            disabled={saving || !name.trim()}
            startIcon={
              savingAction === (isDraftEdit ? "draft" : "save") ? (
                <CircularProgress size={16} />
              ) : (
                <Save size={18} />
              )
            }
            size="medium"
          >
            {savingAction === (isDraftEdit ? "draft" : "save")
              ? "Saving..."
              : isDraftEdit
              ? "Save Draft"
              : "Save"}
          </Button>
        )}

        {activeStep < steps.length - 1 && (
          <Button
            variant={isEdit ? "outlined" : "contained"}
            onClick={handleNext}
            disabled={!canProceed()}
            endIcon={<ArrowRight size={18} />}
            size="medium"
          >
            Next
          </Button>
        )}

        {activeStep === steps.length - 1 && !isReadOnly && (
          <Button
            variant="contained"
            onClick={() => {
              setPendingActivateAction(() =>
                isEdit ? handleActivateExisting : handleSaveAndActivate
              );
              setActivateDialogOpen(true);
            }}
            disabled={saving || !canActivate}
            startIcon={
              savingAction === "activate" ? <CircularProgress size={16} /> : <Zap size={18} />
            }
            size="medium"
          >
            {savingAction === "activate" ? "Activating..." : "Activate"}
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <ModuleWrapper
      breadcrumbs={sequenceFormBreadcrumbLinks}
      currentBreadcrumb={isEdit ? sequenceEditHeader : sequenceAddHeader}
      actionButtons={actionButtons}
    >
      <Box
        sx={{
          mb: 3,
          overflowX: "auto",
        }}
      >
        <Stepper
          nonLinear
          activeStep={activeStep}
          sx={{
            width: "fit-content",
            minWidth: "100%",
            justifyContent: "flex-start",
            "& .MuiStep-root": {
              flex: "0 0 auto",
              pl: 0,
              pr: 3,
            },
            "& .MuiStepButton-root": {
              justifyContent: "flex-start",
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepButton
                onClick={() => {
                  if (index < activeStep || canProceed()) {
                    setActiveStep(index);
                  }
                }}
              >
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {stepDescriptions[activeStep]}
        </Typography>
      </Box>

      {/* Step 1: Details */}
      {activeStep === 0 && (
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Sequence Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={!canEditDetails}
                />
              </Grid>
              {hasMultipleLanguages && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <LanguageSelect
                    value={language}
                    onChange={(value) => setLanguage(value)}
                    label="Language"
                    disabled={!canEditDetails}
                    required
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={3}
                  disabled={!canEditDetails}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Enrollment */}
      {activeStep === 1 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Card variant="outlined">
            <CardHeader title="Enrollment Methods" subheader="Choose how contacts are enrolled" />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={enrollmentModes.includes("manual")}
                      onChange={() => toggleEnrollmentMode("manual")}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Manual enrollment</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Manually add contacts from the contact list
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={enrollmentModes.includes("api")}
                      onChange={() => toggleEnrollmentMode("api")}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">API enrollment</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Enroll contacts via API calls
                      </Typography>
                    </Box>
                  }
                />
                {hasSegments && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enrollmentModes.includes("segment")}
                        onChange={() => toggleEnrollmentMode("segment")}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">Segment-based enrollment</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Automatically enroll contacts when they enter a segment
                        </Typography>
                      </Box>
                    }
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {enrollmentModes.includes("segment") && hasSegments && (
            <Card variant="outlined">
              <CardHeader
                title="Segment Selection"
                subheader="Choose which segments to include or exclude"
              />
              <CardContent sx={{ pt: 0 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Include Segments</InputLabel>
                      <Select
                        multiple
                        value={includeSegmentIds}
                        onChange={(e) => setIncludeSegmentIds(e.target.value as number[])}
                        label="Include Segments"
                        renderValue={() => (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {selectedSegments.map((s) => (
                              <Chip key={s.id} label={s.name} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {loadingSegments ? (
                          <MenuItem disabled>Loading...</MenuItem>
                        ) : (
                          segments.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              <Checkbox
                                checked={includeSegmentIds.includes(s.id ?? 0)}
                                size="small"
                              />
                              {s.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Exclude Segments</InputLabel>
                      <Select
                        multiple
                        value={excludeSegmentIds}
                        onChange={(e) => setExcludeSegmentIds(e.target.value as number[])}
                        label="Exclude Segments"
                        renderValue={() => (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {excludedSegments.map((s) => (
                              <Chip key={s.id} label={s.name} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {loadingSegments ? (
                          <MenuItem disabled>Loading...</MenuItem>
                        ) : (
                          segments.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              <Checkbox
                                checked={excludeSegmentIds.includes(s.id ?? 0)}
                                size="small"
                              />
                              {s.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Card variant="outlined">
            <CardHeader title="Re-entry Policy" subheader="Can contacts re-enter this sequence?" />
            <CardContent sx={{ pt: 0 }}>
              <RadioGroup
                value={reentryPolicy}
                onChange={(e) => setReentryPolicy(e.target.value as typeof reentryPolicy)}
              >
                <FormControlLabel
                  value="OnceEver"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2">Once ever</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Contacts can only enter this sequence once
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="AllowAfterCompletion"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2">Allow after completion</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Contacts can re-enter after completing the sequence
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="Always"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2">Always allow</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Contacts can always re-enter
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Step 3: Steps */}
      {activeStep === 2 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Template filter bar */}
          {!loadingTemplates && !loadingEmailGroups && filteredTemplates.length === 0 && (
            <Alert severity="info">
              {templates.length === 0
                ? "No email templates available. Create one first."
                : "No templates match the current filters."}
            </Alert>
          )}

          {/* Timeline — single continuous borderLeft */}
          <Box
            sx={{
              ml: "17px",
              borderLeft: "2px solid",
              borderColor: "divider",
            }}
          >
            {/* Enrollment node */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                ml: "-19px",
                py: 1,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  color: "success.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Zap size={18} />
              </Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ flexShrink: 0 }}>
                Contact enrolls in sequence
              </Typography>
              <TextField
                type="datetime-local"
                value={
                  previewDate.getFullYear() +
                  "-" +
                  String(previewDate.getMonth() + 1).padStart(2, "0") +
                  "-" +
                  String(previewDate.getDate()).padStart(2, "0") +
                  "T" +
                  String(previewDate.getHours()).padStart(2, "0") +
                  ":" +
                  String(previewDate.getMinutes()).padStart(2, "0")
                }
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  if (!isNaN(d.getTime())) setPreviewDate(d);
                }}
                size="small"
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{ width: 220 }}
              />
              <Box sx={{ flex: 1 }} />
              <FormControl size="small" sx={{ minWidth: 300 }}>
                <InputLabel>Filter Templates by Email Group</InputLabel>
                <Select
                  value={emailGroupFilter}
                  label="Filter Templates by Email Group"
                  onChange={(e) => setEmailGroupFilter(e.target.value as number | "")}
                >
                  <MenuItem value="">All Groups</MenuItem>
                  {availableTemplateGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                      {group.language ? ` (${group.language})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {(() => {
              const projectedDates = calculateProjectedDates(sequenceSteps, previewDate);
              return sequenceSteps.map((step, idx) => {
                const timingMode = getTimingMode(step);
                const selectedTemplate = templates.find((t) => t.id === step.emailTemplateId);
                const stepTemplateOptions =
                  selectedTemplate && !filteredTemplates.some((t) => t.id === selectedTemplate.id)
                    ? [selectedTemplate, ...filteredTemplates]
                    : filteredTemplates;
                const projected = projectedDates[idx];

                return (
                  <Box key={step.localId}>
                    {/* Step number on the line + timing summary beside it */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        ml: "-19px",
                        py: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {getTimingSummary(step)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {projected.toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          {projected.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step configuration card — indented inside the line */}
                    <Box sx={{ pl: 3, pb: 1 }}>
                      <Card variant="outlined">
                        <CardContent
                          sx={{
                            p: 2,
                            "&:last-child": { pb: 2 },
                          }}
                        >
                          {/* Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Mail size={16} />
                              <Typography variant="subtitle2" fontWeight={600}>
                                Email Step
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => setPreviewStepIndex(idx)}
                                disabled={!step.emailTemplateId}
                              >
                                <Eye size={14} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => moveStep(step.localId, "up")}
                                disabled={isReadOnly || idx === 0}
                              >
                                <ArrowUp size={14} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => moveStep(step.localId, "down")}
                                disabled={isReadOnly || idx === sequenceSteps.length - 1}
                              >
                                <ArrowDown size={14} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeStep(step.localId)}
                                disabled={isReadOnly}
                              >
                                <X size={14} />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Name + Template */}
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField
                                fullWidth
                                label="Step Name"
                                value={step.name}
                                onChange={(e) =>
                                  updateStep(step.localId, {
                                    name: e.target.value,
                                  })
                                }
                                size="small"
                                disabled={isReadOnly}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Email Template</InputLabel>
                                <Select
                                  value={step.emailTemplateId}
                                  onChange={(e) =>
                                    updateStep(step.localId, {
                                      emailTemplateId: e.target.value as number,
                                    })
                                  }
                                  label="Email Template"
                                  disabled={isReadOnly}
                                  renderValue={(value) => {
                                    const tmpl = templates.find((item) => item.id === value);
                                    return getTemplateDisplayLabel(tmpl);
                                  }}
                                >
                                  {loadingTemplates || loadingEmailGroups ? (
                                    <MenuItem disabled>Loading...</MenuItem>
                                  ) : (
                                    stepTemplateOptions.map((template) => (
                                      <MenuItem key={template.id} value={template.id}>
                                        <Box>
                                          <Typography variant="body2">{template.name}</Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {getTemplateMeta(template)}
                                          </Typography>
                                        </Box>
                                      </MenuItem>
                                    ))
                                  )}
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>

                          {/* Timing section */}
                          <Box
                            sx={{
                              bgcolor: "action.hover",
                              borderRadius: 1,
                              p: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              color="text.secondary"
                              sx={{
                                mb: 1.5,
                                display: "block",
                              }}
                            >
                              TIMING
                            </Typography>
                            <RadioGroup
                              row
                              value={timingMode}
                              onChange={(e) => {
                                if (e.target.value === "immediate") {
                                  updateStep(step.localId, {
                                    delayValue: 0,
                                    delayUnit: "minutes",
                                    sendAt: "",
                                    allowedWeekDays: [],
                                  });
                                } else {
                                  updateStep(step.localId, {
                                    delayValue: step.delayValue || 1,
                                    delayUnit:
                                      step.delayUnit === "minutes" && step.delayValue === 0
                                        ? "days"
                                        : step.delayUnit,
                                  });
                                }
                              }}
                              sx={{
                                mb: timingMode === "delay" ? 2 : 0,
                              }}
                            >
                              <FormControlLabel
                                value="immediate"
                                control={<Radio size="small" />}
                                label={<Typography variant="body2">Send immediately</Typography>}
                                disabled={isReadOnly}
                              />
                              <FormControlLabel
                                value="delay"
                                control={<Radio size="small" />}
                                label={<Typography variant="body2">Wait before sending</Typography>}
                                disabled={isReadOnly}
                              />
                            </RadioGroup>

                            {timingMode === "delay" && (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 2,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 2,
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography variant="body2" sx={{ flexShrink: 0 }}>
                                    Wait
                                  </Typography>
                                  <TextField
                                    type="number"
                                    value={step.delayValue}
                                    onChange={(e) =>
                                      updateStep(step.localId, {
                                        delayValue: Math.max(0, Number(e.target.value)),
                                      })
                                    }
                                    size="small"
                                    disabled={isReadOnly}
                                    sx={{ width: 80 }}
                                    slotProps={{
                                      input: {
                                        inputProps: {
                                          min: 0,
                                        },
                                      },
                                    }}
                                  />
                                  <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <Select
                                      value={step.delayUnit}
                                      onChange={(e) =>
                                        updateStep(step.localId, {
                                          delayUnit: e.target.value,
                                        })
                                      }
                                      disabled={isReadOnly}
                                    >
                                      {delayUnits.map((u) => (
                                        <MenuItem key={u.value} value={u.value}>
                                          {u.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Box>

                                <Box>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        size="small"
                                        checked={!!step.sendAt}
                                        onChange={(e) =>
                                          updateStep(step.localId, {
                                            sendAt: e.target.checked ? "09:00" : "",
                                          })
                                        }
                                        disabled={isReadOnly}
                                      />
                                    }
                                    label={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                        }}
                                      >
                                        <Clock size={14} />
                                        <Typography variant="body2">At a specific time</Typography>
                                      </Box>
                                    }
                                  />
                                  {!!step.sendAt && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        ml: 5,
                                      }}
                                    >
                                      <TextField
                                        type="time"
                                        value={step.sendAt}
                                        onChange={(e) =>
                                          updateStep(step.localId, {
                                            sendAt: e.target.value,
                                          })
                                        }
                                        size="small"
                                        disabled={isReadOnly}
                                        slotProps={{
                                          inputLabel: {
                                            shrink: true,
                                          },
                                        }}
                                        sx={{ width: 140 }}
                                      />
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          display: "block",
                                          mt: 0.5,
                                        }}
                                      >
                                        Sends at the next occurrence of this time after the delay
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                <Box>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        size="small"
                                        checked={step.allowedWeekDays.length > 0}
                                        onChange={(e) =>
                                          updateStep(step.localId, {
                                            allowedWeekDays: e.target.checked
                                              ? [
                                                  "Monday",
                                                  "Tuesday",
                                                  "Wednesday",
                                                  "Thursday",
                                                  "Friday",
                                                ]
                                              : [],
                                          })
                                        }
                                        disabled={isReadOnly}
                                      />
                                    }
                                    label={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                        }}
                                      >
                                        <Calendar size={14} />
                                        <Typography variant="body2">
                                          Only on certain days
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                  {step.allowedWeekDays.length > 0 && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        ml: 5,
                                        display: "flex",
                                        gap: 0.5,
                                        flexWrap: "wrap",
                                      }}
                                    >
                                      {weekDays.map((day) => (
                                        <Chip
                                          key={day}
                                          label={day.slice(0, 3)}
                                          size="small"
                                          variant={
                                            step.allowedWeekDays.includes(day)
                                              ? "filled"
                                              : "outlined"
                                          }
                                          color={
                                            step.allowedWeekDays.includes(day)
                                              ? "primary"
                                              : "default"
                                          }
                                          onClick={() => {
                                            if (isReadOnly) return;
                                            const newDays = step.allowedWeekDays.includes(day)
                                              ? step.allowedWeekDays.filter((d) => d !== day)
                                              : [...step.allowedWeekDays, day];
                                            updateStep(step.localId, {
                                              allowedWeekDays: newDays.length > 0 ? newDays : [],
                                            });
                                          }}
                                          sx={{
                                            cursor: isReadOnly ? "default" : "pointer",
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                );
              });
            })()}

            {/* Add step node */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                ml: "-19px",
                py: 1,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "2px dashed",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  cursor: isReadOnly ? "default" : "pointer",
                  "&:hover": isReadOnly ? {} : { borderColor: "primary.main" },
                }}
                onClick={isReadOnly ? undefined : addStep}
              >
                <Plus size={16} />
              </Box>
              <Button size="small" onClick={addStep} disabled={isReadOnly}>
                Add Step
              </Button>
            </Box>
          </Box>

          {sequenceSteps.length === 0 && (
            <Alert severity="info" icon={<Info size={16} />}>
              Add at least one email step to your sequence.
            </Alert>
          )}
        </Box>
      )}

      {/* Step 4: Settings */}
      {activeStep === 3 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Card variant="outlined">
            <CardHeader
              title="Exit Conditions"
              subheader="When should contacts automatically exit?"
            />
            <CardContent sx={{ pt: 0 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={stopOnReply}
                    onChange={(e) => setStopOnReply(e.target.checked)}
                    disabled={isReadOnly}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Stop on reply</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Exit when contact replies to any email in the sequence
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader
              title="Timezone Settings"
              subheader="Configure timezone handling for email delivery"
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={useContactTimeZone}
                      onChange={(e) => setUseContactTimeZone(e.target.checked)}
                      disabled={isReadOnly}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Use contact timezone</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Send emails based on each contact&apos;s local timezone. Falls back to the
                        timezone below when not set.
                      </Typography>
                    </Box>
                  }
                />
                <FormControl fullWidth>
                  <InputLabel>
                    {useContactTimeZone ? "Fallback Timezone" : "Default Timezone"}
                  </InputLabel>
                  <Select
                    value={timeZone}
                    label={useContactTimeZone ? "Fallback Timezone" : "Default Timezone"}
                    onChange={(e) => setTimeZone(e.target.value as number)}
                    disabled={isReadOnly}
                  >
                    {timezones.map((tz, index) => (
                      <MenuItem key={`${tz.value}-${index}`} value={tz.value}>
                        {tz.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Step 5: Review */}
      {activeStep === 4 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Card variant="outlined">
            <CardHeader title="Sequence Summary" />
            <CardContent sx={{ pt: 0 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body2">{name || "—"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">{description || "—"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Language
                  </Typography>
                  <Typography variant="body2">{effectiveSequenceLanguage || "—"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Enrollment Methods
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      flexWrap: "wrap",
                      mt: 0.5,
                    }}
                  >
                    {enrollmentModes.map((mode) => (
                      <Chip
                        key={mode}
                        label={
                          mode === "segment" ? "Segment" : mode === "manual" ? "Manual" : "API"
                        }
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Re-entry Policy
                  </Typography>
                  <Typography variant="body2">
                    {reentryPolicy === "OnceEver"
                      ? "Once ever"
                      : reentryPolicy === "AllowAfterCompletion"
                      ? "Allow after completion"
                      : "Always"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Email Steps
                  </Typography>
                  <Typography variant="body2">{sequenceSteps.length}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Stop on Reply
                  </Typography>
                  <Typography variant="body2">{stopOnReply ? "Yes" : "No"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Use Contact Timezone
                  </Typography>
                  <Typography variant="body2">{useContactTimeZone ? "Yes" : "No"}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    {useContactTimeZone ? "Fallback Timezone" : "Default Timezone"}
                  </Typography>
                  <Typography variant="body2">{formatTimezoneLong(timeZone)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {sequenceSteps.length > 0 && (
            <Card variant="outlined">
              <CardHeader title="Steps Overview" />
              <CardContent sx={{ pt: 0 }}>
                <Box
                  sx={{
                    ml: "11px",
                    borderLeft: "2px solid",
                    borderColor: "divider",
                  }}
                >
                  {/* Start node */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      ml: "-13px",
                      py: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                        color: "success.contrastText",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Zap size={12} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Enrollment
                    </Typography>
                  </Box>

                  {sequenceSteps.map((step, idx) => {
                    const template = templates.find((t) => t.id === step.emailTemplateId);
                    return (
                      <Box
                        key={step.localId}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          ml: "-13px",
                          py: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">
                            {step.name || template?.name || `Step ${idx + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getTimingSummary(step)} · {template?.name || "No template"}
                          </Typography>
                        </Box>
                        <Chip
                          label="Email"
                          size="small"
                          variant="outlined"
                          icon={<Mail size={12} />}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={activateDialogOpen} onClose={() => setActivateDialogOpen(false)}>
        <DialogTitle>Activate Sequence</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Activate this sequence now? Enrolled contacts will start receiving emails.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setActivateDialogOpen(false);
              setPendingActivateAction(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={saving || !pendingActivateAction}
            onClick={async () => {
              const action = pendingActivateAction;
              setActivateDialogOpen(false);
              setPendingActivateAction(null);
              await action?.();
            }}
            startIcon={
              savingAction === "activate" ? <CircularProgress size={16} /> : <Zap size={16} />
            }
          >
            {savingAction === "activate" ? "Activating..." : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Sequence</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sequence? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => void handleDelete()}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Trash2 size={16} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <TemplatePreviewDialog
        open={previewStepIndex !== null}
        onClose={() => setPreviewStepIndex(null)}
        steps={sequenceSteps.map((s, i) => ({
          name: s.name.trim() || `Step ${i + 1}`,
          template: templates.find((t) => t.id === s.emailTemplateId) || null,
          templateId: (s.emailTemplateId as number) || null,
        }))}
        initialStepIndex={previewStepIndex ?? 0}
      />
    </ModuleWrapper>
  );
};
