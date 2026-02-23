import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Mail, MessageSquare, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ContactEmailCommunicationListItemDto } from "lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { showApiError } from "@utils/api-error-parser";
import { ContactViewOutletContext } from "../types";

type EmailStatus = "NotSent" | "Sent" | "Received";

const formatStatusLabel = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2");

const getEmailStatusColor = (status?: EmailStatus) => {
  switch (status) {
    case "Sent":
      return "success" as const;
    case "Received":
      return "info" as const;
    case "NotSent":
      return "warning" as const;
    default:
      return "default" as const;
  }
};

export const ContactCommunications = () => {
  const { contact, contactId } = useOutletContext<ContactViewOutletContext>();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [communications, setCommunications] = useState<ContactEmailCommunicationListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    if (!contactId) {
      setCommunications([]);
      return;
    }

    setIsLoading(true);
    (async () => {
      try {
        const { data } = await client.api.contactsEmailCommunicationsList(contactId);
        setCommunications(data || []);
      } catch (error) {
        showApiError(error, notificationsService, undefined, "Could not retrieve communications.");
        setCommunications([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [client, contactId, notificationsService]);

  const sortedCommunications = useMemo(
    () =>
      [...communications].sort((a, b) => {
        const aTime = a.updatedAt || a.createdAt || "";
        const bTime = b.updatedAt || b.createdAt || "";
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      }),
    [communications]
  );

  const localDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  );

  const utcDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      }),
    []
  );

  const formatLocalTime = (iso?: string | null) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";
    return localDateFormatter.format(date);
  };

  const formatContactTime = (iso?: string | null) => {
    if (!iso || contact?.timezone == null) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const adjusted = new Date(date.getTime() + contact.timezone * 60 * 1000);
    return utcDateFormatter.format(adjusted);
  };

  const formatTimezoneOffset = (offsetMinutes?: number | null) => {
    if (offsetMinutes == null) return "";
    const utcMinutes = -offsetMinutes;
    const sign = utcMinutes >= 0 ? "+" : "-";
    const absoluteMinutes = Math.abs(utcMinutes);
    const hours = Math.floor(absoluteMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (absoluteMinutes % 60).toString().padStart(2, "0");
    return `UTC${sign}${hours}:${minutes}`;
  };

  useEffect(() => {
    if (selectedIndex >= sortedCommunications.length) {
      setSelectedIndex(-1);
    }
  }, [selectedIndex, sortedCommunications.length]);

  const selectedCommunication = selectedIndex >= 0 ? sortedCommunications[selectedIndex] : null;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < sortedCommunications.length - 1;

  const openPrev = () => {
    if (hasPrev) {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const openNext = () => {
    if (hasNext) {
      setSelectedIndex((prev) => Math.min(prev + 1, sortedCommunications.length - 1));
    }
  };

  const isHtmlBody = (body: string) => /<\/?[a-z][\s\S]*>/i.test(body);

  const htmlToText = (html: string) => {
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
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  };

  const getPreviewText = (body?: string | null) => {
    const content = (body || "").trim();
    if (!content) return "No content available.";
    const text = isHtmlBody(content) ? htmlToText(content) : content;
    return text.replace(/\s+/g, " ").trim();
  };

  const getPreviewSnippet = (body?: string | null) => {
    const previewText = getPreviewText(body);
    if (previewText.length <= 180) return previewText;
    return `${previewText.slice(0, 177)}...`;
  };

  const renderBody = (body?: string | null) => {
    const content = (body || "").trim();
    if (!content) {
      return (
        <Typography variant="body2" color="text.secondary">
          No content available.
        </Typography>
      );
    }

    if (isHtmlBody(content)) {
      return (
        <Box
          component="div"
          sx={{
            color: "text.secondary",
            typography: "body2",
            "& p": { margin: 0 },
            "& ul, & ol": { margin: 0, paddingLeft: 3 },
          }}
          dangerouslySetInnerHTML={{ __html: content }}
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

  return (
    <Box sx={{ mt: 3 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Communication History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Latest conversations and messages with this contact.
          </Typography>

          {isLoading ? (
            <Box
              sx={{
                py: 6,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={32} />
            </Box>
          ) : sortedCommunications.length === 0 ? (
            <Box
              sx={{
                py: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 1,
              }}
            >
              <Box sx={{ color: "text.disabled" }}>
                <MessageSquare size={44} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                No communications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email communications will appear here when messages are sent or received.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Mail size={16} />}
                component="a"
                href={contact?.email ? `mailto:${contact.email}` : undefined}
                disabled={!contact?.email}
                sx={{ mt: 1 }}
              >
                Send Email
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {sortedCommunications.map((communication, index) => {
                const communicationId = communication.id ?? index;
                const bodyPreview = getPreviewSnippet(communication.body);
                const hasBody = !!(communication.body && communication.body.trim());

                return (
                  <Card key={communicationId} variant="outlined">
                    <CardActionArea
                      component="div"
                      role="button"
                      tabIndex={0}
                      onClick={() => hasBody && setSelectedIndex(index)}
                      onKeyDown={(event) => {
                        if (!hasBody) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedIndex(index);
                        }
                      }}
                      sx={{
                        cursor: hasBody ? "pointer" : "default",
                        transition: "background-color 0.15s",
                        "&:hover": {
                          bgcolor: hasBody ? "action.hover" : "transparent",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: {
                              xs: "flex-start",
                              sm: "center",
                            },
                            justifyContent: "space-between",
                            gap: 1,
                            flexDirection: {
                              xs: "column",
                              sm: "row",
                            },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                            {communication.id != null && (
                              <Typography variant="caption" fontWeight={700} color="text.secondary">
                                #{communication.id}
                              </Typography>
                            )}
                            <Typography variant="subtitle2" fontWeight={600}>
                              {communication.subject || "(No subject)"}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            color={getEmailStatusColor(communication.status)}
                            label={formatStatusLabel(communication.status || "Unknown")}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {bodyPreview}
                        </Typography>
                        <Box
                          sx={{
                            mt: 1.25,
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
                            columnGap: 1.5,
                            rowGap: 0.5,
                            color: "text.secondary",
                          }}
                        >
                          {communication.fromEmail && (
                            <>
                              <Typography variant="caption" fontWeight={600}>
                                From
                              </Typography>
                              <Typography variant="caption">{communication.fromEmail}</Typography>
                            </>
                          )}
                          {communication.recipients && (
                            <>
                              <Typography variant="caption" fontWeight={600}>
                                To
                              </Typography>
                              <Typography variant="caption">{communication.recipients}</Typography>
                            </>
                          )}
                          <>
                            <Typography variant="caption" fontWeight={600}>
                              Your time
                            </Typography>
                            <Typography variant="caption">
                              {formatLocalTime(
                                communication.updatedAt || communication.createdAt || ""
                              )}
                            </Typography>
                          </>
                          {contact?.timezone != null && (
                            <>
                              <Typography variant="caption" fontWeight={600}>
                                Contact time ({formatTimezoneOffset(contact.timezone)})
                              </Typography>
                              <Typography variant="caption">
                                {formatContactTime(
                                  communication.updatedAt || communication.createdAt || ""
                                )}
                              </Typography>
                            </>
                          )}
                          {communication.source && (
                            <>
                              <Typography variant="caption" fontWeight={600}>
                                Source
                              </Typography>
                              <Typography variant="caption">{communication.source}</Typography>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={!!selectedCommunication}
        onClose={() => setSelectedIndex(-1)}
        onKeyDown={(event) => {
          if (!selectedCommunication) return;
          if (event.key === "ArrowLeft") {
            openPrev();
          }
          if (event.key === "ArrowRight") {
            openNext();
          }
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <IconButton size="small" onClick={openPrev} disabled={!hasPrev}>
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton size="small" onClick={openNext} disabled={!hasNext}>
              <ChevronRight size={18} />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  {selectedCommunication?.id != null && (
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      #{selectedCommunication.id}
                    </Typography>
                  )}
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {selectedCommunication?.subject || "(No subject)"}
                  </Typography>
                </Box>
                <Box sx={{ ml: 0.5 }}>
                  <Chip
                    size="small"
                    color={getEmailStatusColor(selectedCommunication?.status)}
                    label={formatStatusLabel(selectedCommunication?.status || "Unknown")}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <IconButton onClick={() => setSelectedIndex(-1)} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
              columnGap: 2,
              rowGap: 1,
              mb: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              From
            </Typography>
            <Typography variant="body2">{selectedCommunication?.fromEmail || "-"}</Typography>
            <Typography variant="caption" color="text.secondary">
              To
            </Typography>
            <Typography variant="body2">{selectedCommunication?.recipients || "-"}</Typography>
            <Typography variant="caption" color="text.secondary">
              Your time
            </Typography>
            <Typography variant="body2">
              {formatLocalTime(
                selectedCommunication?.updatedAt || selectedCommunication?.createdAt || ""
              )}
            </Typography>
            {contact?.timezone != null && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Contact time ({formatTimezoneOffset(contact.timezone)})
                </Typography>
                <Typography variant="body2">
                  {formatContactTime(
                    selectedCommunication?.updatedAt || selectedCommunication?.createdAt || ""
                  )}
                </Typography>
              </>
            )}
            {selectedCommunication?.source && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body2">{selectedCommunication.source}</Typography>
              </>
            )}
          </Box>
          {renderBody(selectedCommunication?.body)}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
