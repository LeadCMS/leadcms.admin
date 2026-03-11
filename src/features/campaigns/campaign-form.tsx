import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRequestContext } from "providers/request-provider";
import { useNotificationsService, useSaveShortcut } from "@hooks";
import { useConfig } from "@providers/config-provider";
import { CoreModule, getCoreModuleRoute, getViewFormRoute } from "lib/router";
import { ModuleWrapper } from "@components/module-wrapper";
import { campaignFormBreadcrumbLinks, campaignAddHeader, campaignEditHeader } from "./constants";
import {
  CampaignCreateDto,
  CampaignDetailsDto,
  CampaignLaunchDto,
  CampaignUpdateDto,
  EmailGroupDetailsDto,
  EmailTemplateDetailsDto,
  SegmentDetailsDto,
} from "lib/network/swagger-client";
import { LanguageSelect } from "@components/language-select";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { timezones } from "utils/constants";
import { formatTimezoneLong } from "utils/timezone-helpers";
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
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Calendar,
  CheckCircle2,
  Info,
  Loader2,
  Save,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { showApiError } from "@utils/api-error-parser";
import { ENTITY_KEYS, hasEntity } from "@utils/entity-availability";
import { CampaignPreview } from "@components/campaign-preview";

const steps = ["Details", "Segment", "Template", "Preview & Test", "Schedule", "Review"];

const stepDescriptions = [
  "Set the campaign name, description and language",
  "Choose which segments to include or exclude",
  "Choose an email template for this campaign",
  "Preview your email and send a test",
  "Choose when to send this campaign",
  "Review your campaign settings before launching",
];

interface CampaignFormProps {
  mode: "create" | "edit";
  campaignId?: number;
}

export const CampaignForm = ({ mode, campaignId }: CampaignFormProps) => {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const navigate = useNavigate();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const isEdit = mode === "edit";
  const hasSegments = hasEntity(config?.entities, ENTITY_KEYS.segment);

  const [activeStep, setActiveStep] = useState(0);
  const [savingAction, setSavingAction] = useState<"draft" | "launch" | "save" | null>(null);
  const saving = savingAction !== null;
  const [loading, setLoading] = useState(isEdit);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [launchConfirmOpen, setLaunchConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingLaunchAction, setPendingLaunchAction] = useState<(() => Promise<void>) | null>(
    null
  );
  const [campaign, setCampaign] = useState<CampaignDetailsDto | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<number[]>([]);
  const [excludeSegmentIds, setExcludeSegmentIds] = useState<number[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
  const [sendOption, setSendOption] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const getBrowserTimezoneOffset = () => {
    const browserOffset = -new Date().getTimezoneOffset();
    const values = [...new Set(timezones.map((tz) => tz.value))];
    return values.reduce((prev, curr) =>
      Math.abs(curr - browserOffset) < Math.abs(prev - browserOffset) ? curr : prev
    );
  };

  const [timeZone, setTimeZone] = useState<number>(getBrowserTimezoneOffset());
  const [useContactTimeZone, setUseContactTimeZone] = useState(false);
  const [allowPastTimeZones, setAllowPastTimeZones] = useState(false);
  const [language, setLanguage] = useState(
    !isEdit && isLanguageFilterActive && selectedLanguage !== "all" ? selectedLanguage : ""
  );

  // Data lists
  const [segments, setSegments] = useState<SegmentDetailsDto[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateDetailsDto[]>([]);
  const [emailGroups, setEmailGroups] = useState<EmailGroupDetailsDto[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingEmailGroups, setLoadingEmailGroups] = useState(false);
  const [emailGroupFilter, setEmailGroupFilter] = useState<number | "">("");

  const campaignStatus = (campaign?.status || "Draft") as NonNullable<CampaignDetailsDto["status"]>;
  const isDraftEdit = isEdit && (campaignStatus === "Draft" || campaignStatus === "Cancelled");
  const isScheduleOnlyEdit =
    isEdit && (campaignStatus === "Scheduled" || campaignStatus === "Paused");
  const isControlOnlyEdit = isEdit && campaignStatus === "Sending";
  const isReadOnlyEdit = isEdit && !isDraftEdit && !isScheduleOnlyEdit && !isControlOnlyEdit;

  const canEditDetails = !isEdit || isDraftEdit;
  const canEditAudience = !isEdit || isDraftEdit;
  const canEditTemplate = !isEdit || isDraftEdit;
  const canEditSchedule = !isEdit || isDraftEdit || isScheduleOnlyEdit;
  const isScheduleModeLocked = isScheduleOnlyEdit;

  const canLaunch =
    name.trim() !== "" &&
    selectedSegmentIds.length > 0 &&
    selectedTemplateId !== "" &&
    (sendOption === "now" || (scheduledDate !== "" && scheduledTime !== ""));

  const getCampaignViewRoute = (id: number) =>
    `${getCoreModuleRoute(CoreModule.campaigns)}/${getViewFormRoute(id)}`;

  // Load campaign data (edit mode only)
  useEffect(() => {
    if (!isEdit || !campaignId) return;
    const load = async () => {
      try {
        const result = await client.api.campaignsDetail(campaignId);
        const data = result.data;
        setCampaign(data);
        setName(data.name);
        setDescription(data.description || "");
        setSelectedSegmentIds(data.segmentIds || []);
        setExcludeSegmentIds(data.excludeSegmentIds || []);
        setLanguage(data.language || "");
        setSelectedTemplateId(data.emailTemplateId);
        setTimeZone(data.timeZone || 0);
        setUseContactTimeZone(data.useContactTimeZone || false);
        if (data.scheduledAt) {
          const dt = new Date(data.scheduledAt);
          const datePart = dt.toISOString().split("T")[0];
          const timePart = dt.toISOString().split("T")[1].slice(0, 5);
          setScheduledDate(datePart);
          setScheduledTime(timePart);
          setSendOption("scheduled");
        }
      } catch (error) {
        showApiError(error, notificationsService, undefined, "Failed to load campaign.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, campaignId, client, notificationsService]);

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

  useEffect(() => {
    if (isScheduleModeLocked) {
      setSendOption("scheduled");
    }
  }, [isScheduleModeLocked]);

  // Load email groups
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

  const canProceed = useCallback(() => {
    switch (activeStep) {
      case 0:
        return name.trim() !== "";
      case 1:
        return selectedSegmentIds.length > 0;
      case 2:
        return selectedTemplateId !== "";
      case 3:
        return selectedTemplateId !== "";
      case 4:
        return sendOption === "now" || (scheduledDate !== "" && scheduledTime !== "");
      default:
        return true;
    }
  }, [
    activeStep,
    name,
    selectedSegmentIds,
    selectedTemplateId,
    sendOption,
    scheduledDate,
    scheduledTime,
  ]);

  /** Save Draft available from step 5+ in create mode */
  const canSaveDraft =
    !isEdit &&
    activeStep >= 4 &&
    name.trim() !== "" &&
    selectedSegmentIds.length > 0 &&
    selectedTemplateId !== "" &&
    (sendOption === "now" || (scheduledDate !== "" && scheduledTime !== ""));

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
    if (isEdit && campaignId) {
      navigate(getCampaignViewRoute(campaignId));
    } else {
      navigate(getCoreModuleRoute(CoreModule.campaigns));
    }
  };

  const handleDelete = async () => {
    if (!campaignId) return;
    setDeleting(true);
    try {
      await client.api.campaignsDelete(campaignId);
      notificationsService.success("Campaign deleted.");
      navigate(getCoreModuleRoute(CoreModule.campaigns));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to delete campaign.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const buildCreatePayload = (): CampaignCreateDto => {
    const payload: CampaignCreateDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      emailTemplateId: selectedTemplateId as number,
      segmentIds: selectedSegmentIds,
      excludeSegmentIds: excludeSegmentIds.length > 0 ? excludeSegmentIds : undefined,
      timeZone: timeZone || undefined,
      useContactTimeZone,
      language: language || undefined,
    };
    if (sendOption === "scheduled" && scheduledDate && scheduledTime) {
      payload.scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`;
    }
    return payload;
  };

  const handleSaveDraft = async () => {
    if (!name.trim()) {
      notificationsService.error("Campaign name is required.");
      return;
    }
    setSavingAction("draft");
    try {
      await client.api.campaignsCreate(buildCreatePayload());
      notificationsService.success("Campaign draft saved successfully.");
      navigate(getCoreModuleRoute(CoreModule.campaigns));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to save campaign draft.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleLaunch = async () => {
    if (!name.trim()) {
      notificationsService.error("Campaign name is required.");
      return;
    }
    setSavingAction("launch");
    try {
      const createResult = await client.api.campaignsCreate(buildCreatePayload());
      const newId = createResult.data?.id;
      if (newId) {
        const launchPayload: CampaignLaunchDto = {
          sendNow: sendOption === "now",
          timeZone: timeZone || undefined,
          useContactTimeZone,
          allowPastTimeZones: useContactTimeZone ? allowPastTimeZones : undefined,
        };
        if (sendOption === "scheduled" && scheduledDate && scheduledTime) {
          launchPayload.scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`;
        }
        await client.api.campaignsLaunchCreate(newId, launchPayload);
      }
      const msg =
        sendOption === "now"
          ? "Campaign launched successfully."
          : "Campaign scheduled successfully.";
      notificationsService.success(msg);
      navigate(getCoreModuleRoute(CoreModule.campaigns));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to launch campaign.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleLaunchExisting = async () => {
    if (!campaignId || !isDraftEdit) return;
    if (!canLaunch) {
      notificationsService.error("Complete audience, template, and schedule before launching.");
      return;
    }
    setSavingAction("launch");
    try {
      const launchPayload: CampaignLaunchDto = {
        sendNow: sendOption === "now",
        timeZone: timeZone || undefined,
        useContactTimeZone,
        allowPastTimeZones: useContactTimeZone ? allowPastTimeZones : undefined,
      };
      if (sendOption === "scheduled" && scheduledDate && scheduledTime) {
        launchPayload.scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`;
      }
      await client.api.campaignsLaunchCreate(campaignId, launchPayload);
      notificationsService.success(
        sendOption === "now"
          ? "Campaign launched successfully."
          : "Campaign scheduled successfully."
      );
      navigate(getCampaignViewRoute(campaignId));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to launch campaign.");
    } finally {
      setSavingAction(null);
    }
  };

  const buildEditPayload = (): CampaignUpdateDto => {
    if (isScheduleOnlyEdit) {
      const scheduleOnlyPayload: CampaignUpdateDto = {
        timeZone: timeZone || undefined,
        useContactTimeZone,
      };
      if (sendOption === "scheduled" && scheduledDate && scheduledTime) {
        scheduleOnlyPayload.scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`;
      } else {
        scheduleOnlyPayload.scheduledAt = null;
      }
      return scheduleOnlyPayload;
    }

    const payload: CampaignUpdateDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      emailTemplateId: selectedTemplateId !== "" ? (selectedTemplateId as number) : undefined,
      segmentIds: selectedSegmentIds.length > 0 ? selectedSegmentIds : undefined,
      excludeSegmentIds: excludeSegmentIds.length > 0 ? excludeSegmentIds : [],
      timeZone: timeZone || undefined,
      useContactTimeZone,
      language: language || undefined,
    };
    if (sendOption === "scheduled" && scheduledDate && scheduledTime) {
      payload.scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`;
    } else {
      payload.scheduledAt = null;
    }
    return payload;
  };

  const handleSaveDraftEdit = async () => {
    if (!campaignId || !name.trim()) {
      notificationsService.error("Campaign name is required.");
      return;
    }
    setSavingAction("draft");
    try {
      await client.api.campaignsPartialUpdate(campaignId, buildEditPayload());
      notificationsService.success("Campaign draft saved successfully.");
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to save campaign draft.");
    } finally {
      setSavingAction(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !campaignId) {
      notificationsService.error("Campaign name is required.");
      return;
    }
    setSavingAction("save");
    try {
      await client.api.campaignsPartialUpdate(campaignId, buildEditPayload());
      notificationsService.success(
        isScheduleOnlyEdit
          ? "Campaign schedule updated successfully."
          : "Campaign updated successfully."
      );
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to update campaign.");
    } finally {
      setSavingAction(null);
    }
  };

  useSaveShortcut(
    isEdit ? (isDraftEdit ? handleSaveDraftEdit : handleSave) : handleSaveDraft,
    !saving && !!name.trim() && (isEdit || canSaveDraft)
  );

  const selectedSegments = segments.filter((s) => selectedSegmentIds.includes(s.id ?? 0));
  const excludedSegments = segments.filter((s) => excludeSegmentIds.includes(s.id ?? 0));
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const getTimezoneLabel = (value: number) => formatTimezoneLong(value);

  const tzLabel = useContactTimeZone ? "Fallback Timezone" : "Timezone";

  const currentBreadcrumb = isEdit ? campaign?.name || campaignEditHeader : campaignAddHeader;

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <TextField
              label="Campaign Name *"
              placeholder="e.g., Black Friday Sale 2024"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEditDetails}
            />
            <TextField
              label="Description"
              placeholder="What is this campaign about?"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEditDetails}
            />
            <LanguageSelect
              value={language}
              onChange={(val) => {
                setLanguage(val);
                setSelectedTemplateId("");
              }}
              label="Language"
              disabled={!canEditDetails}
            />
            {!canEditDetails && (
              <Alert severity="info" icon={<Info size={18} />}>
                Campaign details are locked in this status to prevent content drift.
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {!hasSegments && (
              <Alert severity="info">
                Segments are not available in this project configuration.
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              You can select multiple segments. Contacts in all selected segments will receive this
              campaign.
            </Typography>
            {hasSegments && loadingSegments ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <Loader2 size={24} className="animate-spin" />
              </Box>
            ) : hasSegments && segments.length === 0 ? (
              <Alert severity="info">No segments available. Please create a segment first.</Alert>
            ) : hasSegments ? (
              segments.map((segment) => {
                const isSelected = selectedSegmentIds.includes(segment.id ?? 0);
                return (
                  <Card
                    key={segment.id}
                    variant="outlined"
                    sx={{
                      cursor: canEditAudience ? "pointer" : "default",
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected ? "action.selected" : "background.paper",
                      "&:hover": canEditAudience
                        ? {
                            bgcolor: "action.hover",
                          }
                        : undefined,
                      opacity: canEditAudience ? 1 : 0.75,
                    }}
                    onClick={() => {
                      if (!canEditAudience) return;
                      setSelectedSegmentIds((prev) =>
                        isSelected
                          ? prev.filter((sid) => sid !== (segment.id ?? 0))
                          : [...prev, segment.id ?? 0]
                      );
                    }}
                  >
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {segment.name}
                          </Typography>
                          {segment.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {segment.description}
                            </Typography>
                          )}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <Users size={14} />
                            <Typography variant="caption" color="text.secondary">
                              {segment.contactCount ?? 0} contacts
                            </Typography>
                            <Chip
                              size="small"
                              label={segment.type || "dynamic"}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        {isSelected && (
                          <CheckCircle2 size={20} color="var(--mui-palette-primary-main)" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            ) : null}
            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Optionally exclude segments from this campaign. Contacts in excluded segments will not
              receive this campaign.
            </Typography>

            {hasSegments &&
              !loadingSegments &&
              segments.length > 0 &&
              segments.map((segment) => {
                const isIncluded = selectedSegmentIds.includes(segment.id ?? 0);
                if (isIncluded) return null;
                const isExcluded = excludeSegmentIds.includes(segment.id ?? 0);
                return (
                  <Card
                    key={`exclude-${segment.id}`}
                    variant="outlined"
                    sx={{
                      cursor: canEditAudience ? "pointer" : "default",
                      borderColor: isExcluded ? "error.main" : "divider",
                      bgcolor: isExcluded ? "error.lighter" : "background.paper",
                      "&:hover": canEditAudience
                        ? {
                            bgcolor: "action.hover",
                          }
                        : undefined,
                      opacity: canEditAudience ? 1 : 0.75,
                    }}
                    onClick={() => {
                      if (!canEditAudience) return;
                      setExcludeSegmentIds((prev) =>
                        isExcluded
                          ? prev.filter((sid) => sid !== (segment.id ?? 0))
                          : [...prev, segment.id ?? 0]
                      );
                    }}
                  >
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {segment.name}
                          </Typography>
                          {segment.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {segment.description}
                            </Typography>
                          )}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            <Users size={14} />
                            <Typography variant="caption" color="text.secondary">
                              {segment.contactCount ?? 0} contacts
                            </Typography>
                            <Chip size="small" label="Exclude" variant="outlined" color="error" />
                          </Box>
                        </Box>
                        {isExcluded && <Ban size={20} color="var(--mui-palette-error-main)" />}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}

            {!canEditAudience && (
              <Alert severity="info" icon={<Info size={18} />}>
                Audience is locked for this campaign status. Only scheduling fields can be changed.
              </Alert>
            )}
          </Box>
        );

      case 2: {
        const filteredTemplates = templates.filter((t) => {
          if (language && t.language !== language) return false;
          if (emailGroupFilter !== "" && t.emailGroupId !== emailGroupFilter) {
            return false;
          }
          return true;
        });
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {language && (
              <Typography variant="body2" color="text.secondary">
                Showing templates for <strong>{language}</strong>.
              </Typography>
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Email Group</InputLabel>
              <Select
                value={emailGroupFilter}
                label="Filter by Email Group"
                onChange={(e) => {
                  const val = e.target.value as number | "";
                  setEmailGroupFilter(val);
                }}
              >
                <MenuItem value="">All Groups</MenuItem>
                {emailGroups
                  .filter((g) => !language || g.language === language)
                  .map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                      {group.language ? ` (${group.language})` : ""}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {loadingTemplates || loadingEmailGroups ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <Loader2 size={24} className="animate-spin" />
              </Box>
            ) : filteredTemplates.length === 0 ? (
              <Alert severity="info">
                {templates.length === 0
                  ? "No email templates available. " + "Please create a template first."
                  : "No templates match the " + "current filters."}
              </Alert>
            ) : (
              <RadioGroup
                value={selectedTemplateId ? String(selectedTemplateId) : ""}
                onChange={(e) => {
                  if (!canEditTemplate) return;
                  setSelectedTemplateId(Number(e.target.value));
                }}
              >
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    variant="outlined"
                    sx={{
                      mb: 1,
                      cursor: canEditTemplate ? "pointer" : "default",
                      borderColor: selectedTemplateId === template.id ? "primary.main" : "divider",
                      bgcolor:
                        selectedTemplateId === template.id ? "action.selected" : "background.paper",
                      "&:hover": canEditTemplate
                        ? {
                            bgcolor: "action.hover",
                          }
                        : undefined,
                      opacity: canEditTemplate ? 1 : 0.75,
                    }}
                    onClick={() => {
                      if (!canEditTemplate) return;
                      setSelectedTemplateId(template.id ?? 0);
                    }}
                  >
                    <CardContent sx={{ py: 2, px: 3 }}>
                      <FormControlLabel
                        value={String(template.id)}
                        control={<Radio disabled={!canEditTemplate} />}
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {template.name}
                            </Typography>
                            {template.subject && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                Subject: {template.subject}
                              </Typography>
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                mt: 0.5,
                              }}
                            >
                              {template.language && (
                                <Chip size="small" label={template.language} variant="outlined" />
                              )}
                              {template.emailGroup?.name && (
                                <Chip
                                  size="small"
                                  label={template.emailGroup.name}
                                  variant="outlined"
                                  color="secondary"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                        sx={{
                          alignItems: "flex-start",
                          m: 0,
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            )}

            {!canEditTemplate && (
              <Alert severity="info" icon={<Info size={18} />}>
                Template and content are locked for this campaign status.
              </Alert>
            )}
          </Box>
        );
      }

      case 3:
        return selectedTemplate ? (
          <Box sx={{ mx: -2, mt: -1 }}>
            <CampaignPreview
              template={selectedTemplate}
              segmentIds={selectedSegmentIds}
              excludeSegmentIds={excludeSegmentIds}
              language={language || undefined}
            />
          </Box>
        ) : (
          <Alert severity="info" icon={<Info size={18} />}>
            Please select an email template in the previous step to preview it here.
          </Alert>
        );

      case 4:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <RadioGroup
              value={sendOption}
              onChange={(e) => {
                if (!canEditSchedule || isScheduleModeLocked) return;
                setSendOption(e.target.value as "now" | "scheduled");
              }}
            >
              <Card
                variant="outlined"
                sx={{
                  mb: 1,
                  cursor: canEditSchedule && !isScheduleModeLocked ? "pointer" : "default",
                  borderColor: sendOption === "now" ? "primary.main" : "divider",
                  bgcolor: sendOption === "now" ? "action.selected" : "background.paper",
                  "&:hover":
                    canEditSchedule && !isScheduleModeLocked
                      ? {
                          bgcolor: "action.hover",
                        }
                      : undefined,
                  opacity: canEditSchedule ? 1 : 0.75,
                }}
                onClick={() => {
                  if (!canEditSchedule || isScheduleModeLocked) return;
                  setSendOption("now");
                }}
              >
                <CardContent sx={{ py: 2, px: 3 }}>
                  <FormControlLabel
                    value="now"
                    control={<Radio disabled={!canEditSchedule || isScheduleModeLocked} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Send size={16} />
                          <Typography fontWeight={500}>Send now</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          The campaign will be sent immediately after confirmation.
                        </Typography>
                      </Box>
                    }
                    sx={{
                      alignItems: "flex-start",
                      m: 0,
                    }}
                  />
                </CardContent>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  cursor: canEditSchedule ? "pointer" : "default",
                  borderColor: sendOption === "scheduled" ? "primary.main" : "divider",
                  bgcolor: sendOption === "scheduled" ? "action.selected" : "background.paper",
                  "&:hover": canEditSchedule
                    ? {
                        bgcolor: "action.hover",
                      }
                    : undefined,
                  opacity: canEditSchedule ? 1 : 0.75,
                }}
                onClick={() => {
                  if (!canEditSchedule) return;
                  setSendOption("scheduled");
                }}
              >
                <CardContent sx={{ py: 2, px: 3 }}>
                  <FormControlLabel
                    value="scheduled"
                    control={<Radio disabled={!canEditSchedule} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Calendar size={16} />
                          <Typography fontWeight={500}>Schedule for later</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Choose a specific date and time to send.
                        </Typography>
                      </Box>
                    }
                    sx={{
                      alignItems: "flex-start",
                      m: 0,
                    }}
                  />
                </CardContent>
              </Card>
            </RadioGroup>

            {sendOption === "scheduled" && (
              <Card variant="outlined">
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Send Date *"
                        type="date"
                        fullWidth
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        disabled={!canEditSchedule}
                        slotProps={{
                          inputLabel: { shrink: true },
                          htmlInput: {
                            min: new Date().toISOString().split("T")[0],
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Send Time *"
                        type="time"
                        fullWidth
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        disabled={!canEditSchedule}
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: "flex", alignItems: "flex-start", mt: 1 }}>
                    <Checkbox
                      checked={useContactTimeZone}
                      onChange={(e) => setUseContactTimeZone(e.target.checked)}
                      disabled={!canEditSchedule}
                      sx={{ mt: -0.5 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Use contact&apos;s timezone as priority
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sends at the scheduled time in each contact&apos;s local timezone. Falls
                        back to the timezone below when not set.
                      </Typography>
                    </Box>
                  </Box>

                  {useContactTimeZone && sendOption === "scheduled" && (
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Checkbox
                        checked={allowPastTimeZones}
                        onChange={(e) => setAllowPastTimeZones(e.target.checked)}
                        disabled={!canEditSchedule}
                        sx={{ mt: -0.5 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Allow past timezones
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          When the scheduled time has already passed in some contacts&apos;
                          timezones, send to them shortly after the campaign is scheduled.
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <FormControl fullWidth>
                    <InputLabel>{tzLabel}</InputLabel>
                    <Select
                      value={timeZone}
                      label={tzLabel}
                      onChange={(e) => setTimeZone(e.target.value as number)}
                      disabled={!canEditSchedule}
                    >
                      {timezones.map((tz, index) => (
                        <MenuItem key={`${tz.value}-${index}`} value={tz.value}>
                          {tz.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {scheduledDate && scheduledTime && (
                    <Alert severity="info" icon={<Info size={18} />}>
                      {useContactTimeZone ? (
                        <>
                          Campaign will be sent on <strong>{scheduledDate}</strong> at{" "}
                          <strong>{scheduledTime}</strong> in each contact&apos;s local timezone.
                          Contacts without a timezone will receive it at{" "}
                          {getTimezoneLabel(timeZone)}.
                          {allowPastTimeZones &&
                            " Contacts whose local time has already passed" +
                              " will receive the campaign shortly after it is scheduled."}
                        </>
                      ) : (
                        <>
                          Campaign will be sent on <strong>{scheduledDate}</strong> at{" "}
                          <strong>{scheduledTime}</strong> {getTimezoneLabel(timeZone)}
                        </>
                      )}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {sendOption === "now" && (
              <Alert severity="warning" icon={<AlertCircle size={18} />}>
                The campaign will begin sending immediately once you confirm. Make sure your content
                and segment are finalized.
              </Alert>
            )}

            {!canEditSchedule && (
              <Alert severity="info" icon={<Info size={18} />}>
                Scheduling is locked for this campaign status.
              </Alert>
            )}

            {isScheduleModeLocked && (
              <Alert severity="info" icon={<Info size={18} />}>
                In {campaignStatus.toLowerCase()} status, only scheduling fields can be changed.
              </Alert>
            )}
          </Box>
        );

      case 5:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Campaign Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {name}
              </Typography>
            </Box>

            {description && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Description
                </Typography>
                <Typography variant="body1">{description}</Typography>
              </Box>
            )}

            {language && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Language
                </Typography>
                <Typography variant="body1">{language}</Typography>
              </Box>
            )}

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Segments
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {selectedSegments.map((seg) => (
                  <Chip
                    key={seg.id}
                    label={`${seg.name} (${seg.contactCount ?? 0} contacts)`}
                    icon={<Users size={14} />}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {excludedSegments.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Excluded Segments
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {excludedSegments.map((seg) => (
                    <Chip
                      key={seg.id}
                      label={`${seg.name} (${seg.contactCount ?? 0} contacts)`}
                      icon={<Ban size={14} />}
                      variant="outlined"
                      color="error"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Email Template
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedTemplate?.name}
              </Typography>
              {selectedTemplate?.subject && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  Subject: {selectedTemplate.subject}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Send Schedule
              </Typography>
              {sendOption === "now" ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Send size={16} />
                  <Typography variant="body1" fontWeight={500}>
                    Send immediately
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Calendar size={16} />
                    <Typography variant="body1">
                      {scheduledDate} at {scheduledTime}
                    </Typography>
                  </Box>
                  {useContactTimeZone ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      Using contact&apos;s timezone (fallback: {getTimezoneLabel(timeZone)})
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {getTimezoneLabel(timeZone)}
                    </Typography>
                  )}
                  {useContactTimeZone && allowPastTimeZones && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      Contacts whose local time has already passed will receive the campaign shortly
                      after it is scheduled.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {isEdit ? (
              <Alert severity="info" icon={<Info size={18} />}>
                Review your changes before saving.
              </Alert>
            ) : (
              <Alert
                severity={sendOption === "now" ? "warning" : "info"}
                icon={<AlertCircle size={18} />}
              >
                {sendOption === "now"
                  ? "This campaign will begin " +
                    "sending immediately once " +
                    "you confirm. This action " +
                    "cannot be undone."
                  : "Once scheduled, this " +
                    "campaign will be sent " +
                    "automatically at the " +
                    "specified time. You can " +
                    "cancel it before the " +
                    "send time."}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const actionButtons = (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      {/* Left: Delete + Cancel + Back */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          pl: { sm: 4 },
        }}
      >
        {isEdit && campaignId && (
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

      {/* Right: mode-specific buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          pr: { sm: 4 },
        }}
      >
        {!isEdit && canSaveDraft && (
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            disabled={saving}
            startIcon={<Save size={18} />}
            size="medium"
          >
            Save Draft
          </Button>
        )}
        {isEdit && activeStep < steps.length - 1 && (
          <Button
            variant="outlined"
            onClick={handleNext}
            disabled={!canProceed()}
            endIcon={<ArrowRight size={18} />}
            size="medium"
          >
            Next
          </Button>
        )}
        {isEdit && isDraftEdit && (
          <Button
            variant="outlined"
            onClick={handleSaveDraftEdit}
            disabled={saving || !name.trim()}
            startIcon={
              savingAction === "draft" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={18} />
              )
            }
            size="medium"
          >
            {savingAction === "draft" ? "Saving..." : "Save Draft"}
          </Button>
        )}
        {isEdit && isDraftEdit && (
          <Button
            variant="contained"
            onClick={() => {
              setPendingLaunchAction(() => handleLaunchExisting);
              setLaunchConfirmOpen(true);
            }}
            disabled={saving || !canLaunch}
            startIcon={
              savingAction === "launch" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={18} />
              )
            }
            size="medium"
          >
            {sendOption === "now" ? "Launch Campaign" : "Schedule Campaign"}
          </Button>
        )}
        {isEdit && !isDraftEdit && !isControlOnlyEdit && !isReadOnlyEdit && (
          <Button
            variant="outlined"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            startIcon={
              savingAction === "save" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={18} />
              )
            }
            size="medium"
          >
            {savingAction === "save" ? "Saving..." : isScheduleOnlyEdit ? "Save Schedule" : "Save"}
          </Button>
        )}
        {!isEdit && activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed()}
            endIcon={<ArrowRight size={18} />}
            size="medium"
          >
            Next
          </Button>
        )}
        {!isEdit && activeStep === steps.length - 1 && (
          <Button
            variant="contained"
            onClick={() => {
              setPendingLaunchAction(() => handleLaunch);
              setLaunchConfirmOpen(true);
            }}
            disabled={saving || !canProceed()}
            startIcon={
              savingAction === "launch" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={18} />
              )
            }
            size="medium"
          >
            {sendOption === "now" ? "Send Campaign" : "Schedule Campaign"}
          </Button>
        )}
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <ModuleWrapper
        breadcrumbs={campaignFormBreadcrumbLinks}
        currentBreadcrumb={currentBreadcrumb}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      </ModuleWrapper>
    );
  }

  if (isEdit && !campaign) {
    return (
      <ModuleWrapper
        breadcrumbs={campaignFormBreadcrumbLinks}
        currentBreadcrumb={currentBreadcrumb}
      >
        <Alert severity="error">Campaign not found</Alert>
      </ModuleWrapper>
    );
  }

  if (isEdit && (isControlOnlyEdit || isReadOnlyEdit)) {
    return (
      <ModuleWrapper
        breadcrumbs={campaignFormBreadcrumbLinks}
        currentBreadcrumb={currentBreadcrumb}
      >
        <Alert severity="warning">
          {isControlOnlyEdit
            ? "This campaign is currently sending, so fields are locked. Use Pause, Resume, or " +
              "Cancel actions from the campaign preview or list."
            : "This campaign is immutable in its current status. Content, audience, and schedule " +
              "can no longer be edited."}
        </Alert>
      </ModuleWrapper>
    );
  }

  return (
    <ModuleWrapper
      breadcrumbs={campaignFormBreadcrumbLinks}
      currentBreadcrumb={currentBreadcrumb}
      isForm={true}
      actionButtons={actionButtons}
    >
      {isEdit && isScheduleOnlyEdit && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Info size={18} />}>
          This campaign is in {campaignStatus.toLowerCase()} status. You can update scheduling
          fields only. Audience and template/content are locked to prevent recipient/content drift.
        </Alert>
      )}

      <Box
        sx={{
          mb: 3,
          overflowX: "auto",
          mx: { xs: -2, sm: 0 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Stepper activeStep={activeStep} nonLinear={isEdit} sx={{ minWidth: 500, pb: 2.5 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={isEdit || undefined}>
              {isEdit ? (
                <StepButton onClick={() => setActiveStep(index)}>{label}</StepButton>
              ) : (
                <StepLabel>{label}</StepLabel>
              )}
            </Step>
          ))}
        </Stepper>
      </Box>

      <Card>
        <CardHeader
          title={steps[activeStep]}
          subheader={stepDescriptions[activeStep]}
          titleTypographyProps={{
            variant: "subtitle1",
          }}
        />
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Campaign</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this campaign? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Launch/Schedule Confirmation Dialog */}
      <Dialog
        open={launchConfirmOpen}
        onClose={() => setLaunchConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{sendOption === "now" ? "Launch Campaign" : "Schedule Campaign"}</DialogTitle>
        <DialogContent>
          {sendOption === "now" ? (
            <Alert severity="warning" sx={{ mt: 1 }}>
              The campaign will begin sending immediately. This action cannot be undone.
            </Alert>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <Typography variant="body2">
                Campaign will be sent on <strong>{scheduledDate}</strong> at{" "}
                <strong>{scheduledTime}</strong>
                {useContactTimeZone ? (
                  <>
                    {" "}
                    in each contact&apos;s local timezone. Contacts without a timezone will receive
                    it at {getTimezoneLabel(timeZone)}.
                  </>
                ) : (
                  <> {getTimezoneLabel(timeZone)}</>
                )}
              </Typography>
              {useContactTimeZone && allowPastTimeZones && (
                <Typography variant="body2" color="text.secondary">
                  Contacts whose local time has already passed will receive the campaign shortly
                  after it is scheduled.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLaunchConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setLaunchConfirmOpen(false);
              if (pendingLaunchAction) {
                await pendingLaunchAction();
                setPendingLaunchAction(null);
              }
            }}
          >
            {sendOption === "now" ? "Launch" : "Schedule"}
          </Button>
        </DialogActions>
      </Dialog>
    </ModuleWrapper>
  );
};
