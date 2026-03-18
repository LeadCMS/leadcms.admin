import { useEffect, useState, useCallback, ReactElement, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRequestContext } from "providers/request-provider";
import { useNotificationsService } from "@hooks";
import { CoreModule, getCoreModuleRoute } from "lib/router";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import {
  ContactDetailsDto,
  EnrollmentStepTimelineEntryDto,
  SequenceEnrollmentDetailsDto,
  StepEmailPreviewDto,
} from "lib/network/swagger-client";
import { formatTimezoneShort } from "@utils/timezone-helpers";
import { sequenceFormBreadcrumbLinks } from "./constants";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Zap,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  SkipForward,
  Calendar,
  ArrowLeft,
  LogOut,
  Ban,
  UserX,
  MessageSquare,
  Archive,
} from "lucide-react";
import { showApiError } from "@utils/api-error-parser";

const enrollmentViewHeader = "Enrollment Details";

const enrollmentStatusConfig: Record<
  string,
  {
    color: "default" | "info" | "success" | "error" | "warning";
  }
> = {
  Active: { color: "info" },
  Completed: { color: "success" },
  Exited: { color: "default" },
};

const stepStatusConfig: Record<
  string,
  {
    color: "default" | "info" | "success" | "error" | "warning";
    icon: ReactElement;
    label: string;
  }
> = {
  Planned: {
    color: "default",
    icon: <Clock size={14} />,
    label: "Planned",
  },
  Scheduled: {
    color: "info",
    icon: <Calendar size={14} />,
    label: "Scheduled",
  },
  Sent: {
    color: "success",
    icon: <Send size={14} />,
    label: "Sent",
  },
  Failed: {
    color: "error",
    icon: <XCircle size={14} />,
    label: "Failed",
  },
  Skipped: {
    color: "warning",
    icon: <SkipForward size={14} />,
    label: "Skipped",
  },
};

const exitReasonConfig: Record<string, { label: string; icon: ReactElement }> = {
  Completed: {
    label: "Completed",
    icon: <CheckCircle2 size={18} />,
  },
  Failed: {
    label: "Failed",
    icon: <XCircle size={18} />,
  },
  Unsubscribed: {
    label: "Unsubscribed",
    icon: <Ban size={18} />,
  },
  ReplyStopped: {
    label: "Reply Stopped",
    icon: <MessageSquare size={18} />,
  },
  ManuallyRemoved: {
    label: "Manually Removed",
    icon: <UserX size={18} />,
  },
  Archived: {
    label: "Archived",
    icon: <Archive size={18} />,
  },
};

const formatBrowserDateTime = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTimeAtOffset = (iso: string, offsetMinutes: number) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000);
  return shifted.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};

const isHtmlEmailBody = (body: string) => /<\/?[a-z][\s\S]*>/i.test(body);

const htmlEmailToText = (html: string) => {
  if (typeof window !== "undefined" && "DOMParser" in window) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, String.fromCharCode(34))
    .replace(/&#39;/gi, "'");
};

const getEmailPreviewSnippet = (body?: string | null) => {
  const content = (body || "").trim();
  if (!content) return "No content available.";
  const text = isHtmlEmailBody(content) ? htmlEmailToText(content) : content;
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 120) return cleaned;
  return `${cleaned.slice(0, 117)}...`;
};

const formatEmailSender = (preview?: StepEmailPreviewDto | null) => {
  const fromName = preview?.fromName?.trim();
  const fromEmail = preview?.fromEmail?.trim();

  if (fromName && fromEmail) {
    return `${fromName} <${fromEmail}>`;
  }

  return fromName || fromEmail || null;
};

const renderEmailBody = (body?: string | null) => {
  const content = (body || "").trim();
  if (!content) {
    return (
      <Typography variant="body2" color="text.secondary">
        No content available.
      </Typography>
    );
  }
  if (isHtmlEmailBody(content)) {
    return (
      <Box
        component="div"
        sx={{
          color: "text.secondary",
          typography: "body2",
          "& p": { margin: 0 },
          "& ul, & ol": {
            margin: 0,
            paddingLeft: 3,
          },
        }}
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    );
  }
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      component="div"
      sx={{ whiteSpace: "pre-wrap" }}
    >
      {content}
    </Typography>
  );
};

const getContactDisplayName = (
  contact?: ContactDetailsDto | null,
  fallbackContactId?: number | null
) => {
  const displayName = contact?.fullName?.trim();
  if (displayName) return displayName;
  const contactId = contact?.id ?? fallbackContactId;
  return contactId ? `Contact #${contactId}` : "—";
};

const getContactRoute = (contactId?: number | null) => {
  if (!contactId) return "";
  return `${getCoreModuleRoute(CoreModule.contacts)}/${contactId}/view`;
};

const formatStepTiming = (step: EnrollmentStepTimelineEntryDto) => {
  const delayValue = step.timing?.delay?.value ?? 0;
  const delayUnit = step.timing?.delay?.unit ?? "days";
  const parts = [`Delay: ${delayValue} ${delayUnit}`];
  if (step.timing?.sendAt) {
    parts.push(`Send at ${step.timing.sendAt}`);
  }
  if (step.timing?.allowedWeekDays && step.timing.allowedWeekDays.length > 0) {
    parts.push(`Days: ${step.timing.allowedWeekDays.join(", ")}`);
  } else {
    parts.push("Days: Any");
  }
  return parts.join(" · ");
};

const getStepTimelineTimestamp = (step: EnrollmentStepTimelineEntryDto) => {
  return step.sentAt || step.scheduledAt || null;
};

export const SequenceEnrollmentView = () => {
  const { id, enrollmentId } = useParams<{
    id: string;
    enrollmentId: string;
  }>();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const navigate = useNavigate();
  const theme = useTheme();

  const [enrollment, setEnrollment] = useState<SequenceEnrollmentDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailPreview, setEmailPreview] = useState<StepEmailPreviewDto | null>(null);

  const sequenceId = Number(id);
  const enrollId = Number(enrollmentId);

  const breadcrumbs = [
    ...sequenceFormBreadcrumbLinks,
    {
      linkText: "View Sequence",
      toRoute:
        `${getCoreModuleRoute(CoreModule.sequences)}` + `/${sequenceId}/view?tab=enrollments`,
    },
  ];

  const loadData = useCallback(async () => {
    if (!sequenceId || !enrollId) return;
    setLoading(true);
    try {
      const result = await client.api.sequencesEnrollmentsDetail(sequenceId, enrollId);
      if (!result.data) {
        notificationsService.error("Enrollment not found.");
      }
      setEnrollment(result.data);
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to load enrollment details.");
    } finally {
      setLoading(false);
    }
  }, [sequenceId, enrollId, client, notificationsService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBack = () => {
    navigate(`${getCoreModuleRoute(CoreModule.sequences)}` + `/${sequenceId}/view?tab=enrollments`);
  };

  if (loading) {
    return (
      <ModuleWrapper breadcrumbs={breadcrumbs} currentBreadcrumb={enrollmentViewHeader}>
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

  if (!enrollment) {
    return (
      <ModuleWrapper breadcrumbs={breadcrumbs} currentBreadcrumb={enrollmentViewHeader}>
        <Alert severity="error">Enrollment not found</Alert>
      </ModuleWrapper>
    );
  }

  const contact = enrollment.contact;
  const contactName = getContactDisplayName(contact, enrollment.contactId);
  const contactRoute = getContactRoute(contact?.id ?? enrollment.contactId);
  const status = enrollment.status || "Active";
  const isCompleted = status === "Completed";
  const isExited = status === "Exited";

  const timelineSteps = [...(enrollment.steps || [])].sort(
    (a, b) => (a.position || 0) - (b.position || 0)
  );

  const contactTimezone = contact?.timezone;

  const formatDualTime = (iso?: string | null) => {
    const browserTime = formatBrowserDateTime(iso);
    if (!browserTime || !iso) return browserTime;
    if (contactTimezone == null) return browserTime;
    const contactTime = formatDateTimeAtOffset(iso, contactTimezone);
    const tzLabel = formatTimezoneShort(contactTimezone);
    if (!contactTime) return browserTime;
    return `${contactTime} ${tzLabel}`;
  };

  const exitReason =
    enrollment.exitReason && enrollment.exitReason !== "None" ? enrollment.exitReason : null;
  const exitConfig = exitReason ? exitReasonConfig[exitReason] : null;
  const exitTimestamp = enrollment.exitedAt ? new Date(enrollment.exitedAt).getTime() : null;
  const exitInsertIndex =
    isExited && exitTimestamp != null
      ? timelineSteps.findIndex((step) => {
          if (step.status === "Planned") {
            return true;
          }

          const stepTimestamp = getStepTimelineTimestamp(step);
          if (!stepTimestamp) {
            return false;
          }

          const stepTime = new Date(stepTimestamp).getTime();
          if (Number.isNaN(stepTime)) {
            return false;
          }

          return stepTime > exitTimestamp;
        })
      : -1;

  const renderExitTimelineNode = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        ml: "-19px",
        py: 2.5,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: "grey.500",
          color: "common.white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {exitConfig?.icon || <LogOut size={18} />}
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight={600}>
          {exitConfig?.label || "Exited"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDualTime(enrollment.exitedAt) || "—"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <ModuleWrapper breadcrumbs={breadcrumbs} currentBreadcrumb={enrollmentViewHeader}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="text"
          size="small"
          startIcon={<ArrowLeft size={14} />}
          onClick={handleBack}
        >
          Back to Enrollments
        </Button>
      </Box>

      {/* Enrollment header card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Avatar src={contact?.avatarUrl || undefined} sx={{ width: 48, height: 48 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                {contactRoute ? (
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    component={GhostLink}
                    to={contactRoute}
                    sx={{
                      color: "inherit",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {contactName}
                  </Typography>
                ) : (
                  <Typography variant="h6" fontWeight={600}>
                    {contactName}
                  </Typography>
                )}
                <Chip
                  size="small"
                  label={status}
                  color={enrollmentStatusConfig[status]?.color || "default"}
                  variant="outlined"
                />
              </Box>
              {contact?.email && (
                <Typography variant="body2" color="text.secondary">
                  {contact.email}
                </Typography>
              )}
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Entered At
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDualTime(enrollment.enteredAt) || "—"}
              </Typography>
            </Grid>
            {enrollment.completedAt && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Completed At
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDualTime(enrollment.completedAt) || "—"}
                </Typography>
              </Grid>
            )}
            {enrollment.exitedAt && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Exited At
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDualTime(enrollment.exitedAt) || "—"}
                </Typography>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Source
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {enrollment.enrollmentSource || "—"}
              </Typography>
            </Grid>
            {enrollment.enrollmentReason && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Reason
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {enrollment.enrollmentReason}
                </Typography>
              </Grid>
            )}
            {exitReason && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Exit Reason
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {exitConfig?.label || exitReason}
                </Typography>
              </Grid>
            )}
            {contactTimezone != null && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Contact Timezone
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatTimezoneShort(contactTimezone)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
            }}
          >
            <Box
              sx={{
                color: "text.secondary",
                display: "flex",
              }}
            >
              <Clock size={18} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Enrollment Timeline
            </Typography>
          </Box>

          <Box
            sx={{
              ml: "17px",
              borderLeft: "2px solid",
              borderColor: "divider",
              pr: 1,
            }}
          >
            {/* Enrollment start node */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                ml: "-19px",
                py: 2,
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
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Enrolled
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDualTime(enrollment.enteredAt) || "—"}
                </Typography>
              </Box>
            </Box>

            {/* Step nodes  */}
            {timelineSteps.map((step, idx) => {
              const stepStatus = step.status;
              const statusConf = stepStatus ? stepStatusConfig[stepStatus] : null;
              const isPending = stepStatus === "Planned";
              const hasDetail =
                Boolean(step.scheduledAt) ||
                stepStatus === "Sent" ||
                stepStatus === "Failed" ||
                stepStatus === "Skipped" ||
                stepStatus === "Scheduled";

              let nodeColor: string;
              let nodeBgColor: string;
              let nodeIcon: ReactNode;

              if (stepStatus === "Sent") {
                nodeColor = theme.palette.success.contrastText;
                nodeBgColor = theme.palette.success.main;
                nodeIcon = <CheckCircle2 size={16} />;
              } else if (stepStatus === "Failed") {
                nodeColor = theme.palette.error.contrastText;
                nodeBgColor = theme.palette.error.main;
                nodeIcon = <XCircle size={16} />;
              } else if (stepStatus === "Skipped") {
                nodeColor = theme.palette.warning.contrastText;
                nodeBgColor = theme.palette.warning.main;
                nodeIcon = <SkipForward size={16} />;
              } else if (stepStatus === "Scheduled") {
                nodeColor = theme.palette.info.contrastText;
                nodeBgColor = theme.palette.info.main;
                nodeIcon = <Calendar size={16} />;
              } else {
                nodeColor = theme.palette.text.disabled;
                nodeBgColor = theme.palette.action.disabledBackground;
                nodeIcon = (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "inherit",
                      lineHeight: 1,
                    }}
                  >
                    {idx + 1}
                  </Typography>
                );
              }

              const stepName = step.name?.trim() || `Step ${idx + 1}`;

              return (
                <Box key={step.stepId || idx}>
                  {isExited && idx === exitInsertIndex && renderExitTimelineNode()}

                  {/* Step node on line */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2.5,
                      ml: "-19px",
                      py: 2.5,
                    }}
                  >
                    <Tooltip title={statusConf?.label || ""} arrow>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: nodeBgColor,
                          color: nodeColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                      >
                        {nodeIcon}
                      </Box>
                    </Tooltip>
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          flexWrap: "wrap",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{
                            color: isPending ? "text.disabled" : "text.primary",
                          }}
                        >
                          {stepName}
                        </Typography>
                        {stepStatus && (
                          <Chip
                            size="medium"
                            icon={statusConf?.icon}
                            label={statusConf?.label}
                            color={statusConf?.color || "default"}
                            variant="outlined"
                            sx={{
                              height: 28,
                              borderRadius: 999,
                              gap: 0.25,
                              "& .MuiChip-label": {
                                px: 1.25,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              },
                              "& .MuiChip-icon": {
                                ml: 0.75,
                                mr: 0,
                              },
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          opacity: isPending ? 0.6 : 1,
                          mb: hasDetail ? 0 : 0.5,
                        }}
                      >
                        {formatStepTiming(step)}
                      </Typography>

                      {/* Step detail card */}
                      {hasDetail && (
                        <Card
                          variant="outlined"
                          sx={{
                            mt: 2,
                            bgcolor: theme.palette.mode === "dark" ? "action.hover" : "grey.50",
                          }}
                        >
                          <CardContent
                            sx={{
                              p: 2.5,
                              "&:last-child": {
                                pb: 2.5,
                              },
                            }}
                          >
                            {step.scheduledAt && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <Calendar size={14} color={theme.palette.info.main} />
                                <Typography variant="body2" fontWeight={500}>
                                  Scheduled: {formatDualTime(step.scheduledAt)}
                                </Typography>
                              </Box>
                            )}
                            {step.sentAt && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <Send size={14} color={theme.palette.success.main} />
                                <Typography variant="body2" fontWeight={500}>
                                  Sent: {formatDualTime(step.sentAt)}
                                </Typography>
                              </Box>
                            )}
                            {step.emailPreview && (
                              <Box sx={{ mt: 1.5 }}>
                                {formatEmailSender(step.emailPreview) && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 0.75 }}
                                  >
                                    From: {formatEmailSender(step.emailPreview)}
                                  </Typography>
                                )}
                                <Typography
                                  component="button"
                                  type="button"
                                  variant="body2"
                                  onClick={() => {
                                    if (step.emailPreview) {
                                      setEmailPreview(step.emailPreview);
                                    }
                                  }}
                                  sx={{
                                    p: 0,
                                    m: 0,
                                    border: 0,
                                    background: "transparent",
                                    textAlign: "left",
                                    fontWeight: 500,
                                    color: "primary.main",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    "&:hover": {
                                      opacity: 0.8,
                                    },
                                  }}
                                >
                                  {step.emailPreview.subject || "(No subject)"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 500,
                                    mt: 0.5,
                                  }}
                                >
                                  {getEmailPreviewSnippet(step.emailPreview.body)}
                                </Typography>
                              </Box>
                            )}
                            {step.errorMessage && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <AlertTriangle size={14} color={theme.palette.error.main} />
                                <Typography variant="body2" color="error.main">
                                  {step.errorMessage}
                                </Typography>
                              </Box>
                            )}
                            {step.skipReason && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 1,
                                }}
                              >
                                <SkipForward size={14} color={theme.palette.warning.main} />
                                <Typography variant="body2" color="warning.main">
                                  Skip reason: {step.skipReason}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}

            {/* Terminal node */}
            {isCompleted && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  ml: "-19px",
                  py: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: isCompleted ? "success.main" : "grey.500",
                    color: isCompleted ? "success.contrastText" : "common.white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    exitConfig?.icon || <LogOut size={18} />
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Completed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDualTime(enrollment.completedAt) || "—"}
                  </Typography>
                </Box>
              </Box>
            )}
            {isExited && exitInsertIndex === -1 && renderExitTimelineNode()}
          </Box>
        </CardContent>
      </Card>

      {/* Email preview dialog */}
      <Dialog
        open={Boolean(emailPreview)}
        onClose={() => setEmailPreview(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {emailPreview?.subject || "(No subject)"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "auto 1fr",
              },
              columnGap: 2,
              rowGap: 1.25,
              mb: 2.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              From name
            </Typography>
            <Typography variant="body2">{emailPreview?.fromName || "-"}</Typography>
            <Typography variant="caption" color="text.secondary">
              From email
            </Typography>
            <Typography variant="body2">{emailPreview?.fromEmail || "-"}</Typography>
            <Typography variant="caption" color="text.secondary">
              Sender
            </Typography>
            <Typography variant="body2">{formatEmailSender(emailPreview) || "-"}</Typography>
          </Box>
          {renderEmailBody(emailPreview?.body)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailPreview(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ModuleWrapper>
  );
};
