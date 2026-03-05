import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Chip,
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Send,
  Bot,
  Search,
  Settings2,
  Mail,
  Users,
} from "lucide-react";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useUserInfo } from "@providers/user-provider";
import {
  CampaignPreviewRequestDto,
  CampaignPreviewResultDto,
  ContactDetailsDto,
  EmailTemplateSendTestDto,
  EmailTemplateDetailsDto,
} from "@lib/network/swagger-client";
import { showApiError } from "@utils/api-error-parser";
import {
  type ContactType,
  type PreviewDataMode,
  type CustomParam,
  CONTACT_TYPE_OPTIONS,
  SERVER_KNOWN_LOWER,
  extractTemplateTokens,
  guessParamValue,
  loadStored,
  saveStored,
  getContactLabel,
} from "@utils/template-preview-utils";

export interface CampaignPreviewProps {
  /** Selected email template */
  template: EmailTemplateDetailsDto;
  /** Included segment IDs */
  segmentIds: number[];
  /** Excluded segment IDs */
  excludeSegmentIds?: number[];
  /** Campaign language */
  language?: string;
  /** Height for the preview container */
  height?: string;
}

const STORAGE_PREFIX = "campaign-preview-";
const CUSTOM_PARAMS_KEY = `${STORAGE_PREFIX}custom-params`;
const DATA_MODE_KEY = `${STORAGE_PREFIX}data-mode`;
const CONTACT_TYPE_KEY = `${STORAGE_PREFIX}contact-type`;
const SELECTED_CONTACT_KEY = `${STORAGE_PREFIX}selected-contact`;

const HeaderRow: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1,
      alignItems: "baseline",
      py: 0.5,
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        width: 60,
        minWidth: 60,
        textAlign: "left",
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    <Typography variant="body1" sx={{ wordBreak: "break-word", minWidth: 0 }}>
      {children}
    </Typography>
  </Box>
);

/**
 * Campaign preview component. Uses the campaigns/preview API
 * to show a rendered template with audience statistics along
 * with a "Send Test" dialog that uses the
 * emailTemplatesSendTestCreate API.
 */
export const CampaignPreview: React.FC<CampaignPreviewProps> = ({
  template,
  segmentIds,
  excludeSegmentIds,
  language,
  height = "calc(100vh - 360px)",
}) => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const userInfo = useUserInfo();

  // Preview state
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewContact, setPreviewContact] = useState<{
    name?: string;
    email?: string;
  } | null>(null);
  const [audienceStats, setAudienceStats] = useState<CampaignPreviewResultDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // UI state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  // Data mode
  const [dataMode, setDataMode] = useState<PreviewDataMode>(
    () => loadStored<string>(DATA_MODE_KEY, "dummy") as PreviewDataMode
  );
  const [contactType, setContactType] = useState<ContactType>(
    () => loadStored<string>(CONTACT_TYPE_KEY, "Full") as ContactType
  );

  // Contact search
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactOptions, setContactOptions] = useState<ContactDetailsDto[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactDetailsDto | null>(() =>
    loadStored<ContactDetailsDto | null>(SELECTED_CONTACT_KEY, null)
  );
  const [contactLoading, setContactLoading] = useState(false);
  const contactSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleGroupRef = useRef<HTMLDivElement>(null);
  const [toggleGroupWidth, setToggleGroupWidth] = useState<number>(0);

  useEffect(() => {
    const el = toggleGroupRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setToggleGroupWidth(el.offsetWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [settingsOpen]);

  // Persist settings
  useEffect(() => {
    saveStored(DATA_MODE_KEY, dataMode);
  }, [dataMode]);

  useEffect(() => {
    saveStored(CONTACT_TYPE_KEY, contactType);
  }, [contactType]);

  useEffect(() => {
    if (selectedContact) {
      saveStored(SELECTED_CONTACT_KEY, selectedContact);
    } else {
      localStorage.removeItem(SELECTED_CONTACT_KEY);
    }
  }, [selectedContact]);

  // Custom parameters
  const [customParams, setCustomParams] = useState<CustomParam[]>(() =>
    loadStored<CustomParam[]>(CUSTOM_PARAMS_KEY, [])
  );
  const [paramsExpanded, setParamsExpanded] = useState(false);

  const source = template.bodyTemplate || "";
  const subject = template.subject || "";
  const fromEmail = template.fromEmail || "";
  const fromName = template.fromName || "";

  const templateCustomTokens = useMemo(() => {
    if (!source.trim()) return [] as string[];
    const tokens = extractTemplateTokens(source);
    return tokens.filter((t) => !SERVER_KNOWN_LOWER.has(t.toLowerCase()));
  }, [source]);

  useEffect(() => {
    if (templateCustomTokens.length === 0) return;
    setCustomParams((prev) => {
      const existingKeys = new Set(prev.map((p) => p.key.toLowerCase()));
      const newParams: CustomParam[] = [];
      for (const token of templateCustomTokens) {
        if (!existingKeys.has(token.toLowerCase())) {
          newParams.push({
            key: token,
            value: guessParamValue(token),
            autoGenerated: true,
          });
        }
      }
      if (newParams.length === 0) return prev;
      if (newParams.length > 0) setParamsExpanded(true);
      return [...prev, ...newParams];
    });
  }, [templateCustomTokens]);

  const visibleCustomParams = useMemo(() => {
    if (templateCustomTokens.length === 0) return [];
    const tokenSet = new Set(templateCustomTokens.map((t) => t.toLowerCase()));
    return customParams.filter((p) => tokenSet.has(p.key.trim().toLowerCase()));
  }, [customParams, templateCustomTokens]);

  // Send test dialog
  const [sendTestOpen, setSendTestOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(() => userInfo?.details?.email || "");
  const [isSending, setIsSending] = useState(false);

  // Contact search — uses segment contacts API
  const fetchSegmentContacts = useCallback(
    async (query?: string) => {
      if (segmentIds.length === 0) return;
      setContactLoading(true);
      try {
        const segId = segmentIds[0];
        const resp = await client.api.segmentsContactsList(segId, {
          query: query || undefined,
          limit: 10,
        });
        setContactOptions(resp.data || []);
      } catch {
        setContactOptions([]);
      } finally {
        setContactLoading(false);
      }
    },
    [segmentIds, client]
  );

  // Load top 10 segment contacts when switching to contact mode
  useEffect(() => {
    if (dataMode === "contact") {
      fetchSegmentContacts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMode, segmentIds]);

  // Debounced search within segment contacts
  // When query is cleared (e.g. user clicks "x"), reload the top 10.
  useEffect(() => {
    if (dataMode !== "contact") return;
    if (contactSearchTimerRef.current) {
      clearTimeout(contactSearchTimerRef.current);
    }
    contactSearchTimerRef.current = setTimeout(
      () => {
        fetchSegmentContacts(contactSearchQuery || undefined);
      },
      contactSearchQuery ? 400 : 0
    );
    return () => {
      if (contactSearchTimerRef.current) {
        clearTimeout(contactSearchTimerRef.current);
      }
    };
  }, [contactSearchQuery, dataMode, fetchSegmentContacts]);

  const customTemplateParameters = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of visibleCustomParams) {
      if (p.key.trim()) map[p.key.trim()] = p.value;
    }
    return Object.keys(map).length > 0 ? map : undefined;
  }, [visibleCustomParams]);

  /* ------ campaign preview API ------ */
  const fetchPreview = useCallback(async () => {
    if (!template.id) {
      setPreviewError("No email template selected.");
      return;
    }
    if (segmentIds.length === 0) {
      setPreviewError("No segments selected.");
      return;
    }

    setIsLoading(true);
    setPreviewError(null);

    try {
      const request: CampaignPreviewRequestDto = {
        emailTemplateId: template.id,
        segmentIds,
        excludeSegmentIds:
          excludeSegmentIds && excludeSegmentIds.length > 0 ? excludeSegmentIds : undefined,
        language: language || undefined,
        customTemplateParameters,
      };

      if (dataMode === "dummy") {
        request.contactType = contactType;
        request.contactId = null;
      } else if (dataMode === "contact" && selectedContact?.id) {
        request.contactId = selectedContact.id;
        request.contactType = null;
      } else if (dataMode === "contact") {
        setPreviewError("Please select a contact first.");
        setIsLoading(false);
        return;
      }

      const resp = await client.api.campaignsPreviewCreate(request);
      const result: CampaignPreviewResultDto = resp.data;

      setAudienceStats(result);

      const tplPreview = result.templatePreview;
      if (tplPreview) {
        setPreviewHtml(tplPreview.renderedBody || "");
        setPreviewSubject(tplPreview.renderedSubject || "");
        if (tplPreview.previewContactName || tplPreview.previewContactEmail) {
          setPreviewContact({
            name: tplPreview.previewContactName,
            email: tplPreview.previewContactEmail,
          });
        } else {
          setPreviewContact(null);
        }
      }
    } catch (error) {
      showApiError(error, notificationsService, showErrorModal, "Campaign preview failed");
      setPreviewError("Failed to generate preview.");
    } finally {
      setIsLoading(false);
    }
  }, [
    template.id,
    segmentIds,
    excludeSegmentIds,
    language,
    dataMode,
    contactType,
    selectedContact,
    customTemplateParameters,
    client,
    notificationsService,
    showErrorModal,
  ]);

  // Auto-fetch preview
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevParamsRef = useRef(customTemplateParameters);

  useEffect(() => {
    if (!template.id || segmentIds.length === 0) return;

    const paramsChanged = prevParamsRef.current !== customTemplateParameters;
    prevParamsRef.current = customTemplateParameters;

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    if (paramsChanged) {
      refreshTimerRef.current = setTimeout(() => {
        fetchPreview();
      }, 600);
    } else {
      fetchPreview();
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMode, contactType, selectedContact, customTemplateParameters]);

  // Initial fetch
  useEffect(() => {
    if (template.id && segmentIds.length > 0) {
      fetchPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------ send test email ------ */
  const handleSendTest = useCallback(async () => {
    if (!recipientEmail.trim()) {
      notificationsService.error("Please enter a recipient email.");
      return;
    }
    if (!source.trim()) {
      notificationsService.error("Template body is empty.");
      return;
    }
    if (!subject.trim()) {
      notificationsService.error("Template subject is required.");
      return;
    }
    if (!fromEmail.trim()) {
      notificationsService.error("Sender email is required.");
      return;
    }
    if (!fromName.trim()) {
      notificationsService.error("Sender name is required.");
      return;
    }

    setIsSending(true);
    try {
      const request: EmailTemplateSendTestDto = {
        subject,
        bodyTemplate: source,
        fromEmail,
        fromName,
        recipientEmail: recipientEmail.trim(),
        customTemplateParameters,
      };

      if (dataMode === "dummy") {
        request.contactType = contactType;
        request.contactId = null;
      } else if (dataMode === "contact") {
        request.contactId = selectedContact?.id ?? null;
        request.contactType = null;
      }

      await client.api.emailTemplatesSendTestCreate(request);
      notificationsService.success(`Test email sent to ${recipientEmail.trim()}`);
      setSendTestOpen(false);
    } catch (error) {
      showApiError(error, notificationsService, showErrorModal, "Failed to send test email");
    } finally {
      setIsSending(false);
    }
  }, [
    recipientEmail,
    source,
    subject,
    fromEmail,
    fromName,
    dataMode,
    contactType,
    selectedContact,
    customTemplateParameters,
    client,
    notificationsService,
    showErrorModal,
  ]);

  // Persist custom params
  useEffect(() => {
    try {
      saveStored(CUSTOM_PARAMS_KEY, customParams);
    } catch {
      /* quota exceeded */
    }
  }, [customParams]);

  const updateCustomParam = (idx: number, updates: Partial<CustomParam>) => {
    setCustomParams((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height }}>
      {/* Audience stats bar */}
      {audienceStats && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Users size={16} />
              <Typography variant="body2">
                <strong>{audienceStats.totalAudienceCount ?? 0}</strong> total audience
              </Typography>
            </Box>
            <Chip
              size="small"
              label={`${audienceStats.sendableCount ?? 0} sendable`}
              color="success"
              variant="outlined"
            />
            {(audienceStats.unsubscribedCount ?? 0) > 0 && (
              <Chip
                size="small"
                label={`${audienceStats.unsubscribedCount} unsubscribed`}
                color="warning"
                variant="outlined"
              />
            )}
            {(audienceStats.invalidEmailCount ?? 0) > 0 && (
              <Chip
                size="small"
                label={`${audienceStats.invalidEmailCount} invalid`}
                color="error"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )}

      {/* Top action bar */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          px: 1.5,
          py: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Tooltip title="Preview settings">
          <IconButton
            size="small"
            onClick={() => setSettingsOpen((o) => !o)}
            color={settingsOpen ? "primary" : "default"}
            sx={{ width: 32, height: 32 }}
          >
            <Settings2 size={18} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        <ToggleButtonGroup
          size="small"
          exclusive
          value={mobilePreview ? "mobile" : "desktop"}
          onChange={(_, v) => {
            if (v) setMobilePreview(v === "mobile");
          }}
          sx={{
            height: 32,
            "& .MuiToggleButton-root": { px: 1 },
          }}
        >
          <ToggleButton value="desktop">
            <Monitor size={17} />
          </ToggleButton>
          <ToggleButton value="mobile">
            <Smartphone size={17} />
          </ToggleButton>
        </ToggleButtonGroup>

        <Chip
          label="HTML"
          size="small"
          variant="outlined"
          color="default"
          sx={{ ml: 0.5, height: 28 }}
        />

        {isLoading && <CircularProgress size={18} sx={{ ml: 1 }} />}

        <Box sx={{ flex: 1 }} />

        <Button
          size="small"
          variant="outlined"
          startIcon={<Send size={14} />}
          onClick={() => setSendTestOpen(true)}
          sx={{ textTransform: "none" }}
        >
          Send Test
        </Button>
      </Stack>

      {/* Settings drawer */}
      <Collapse in={settingsOpen}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "80px auto 1fr auto",
              columnGap: 2,
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Data source
            </Typography>
            <ToggleButtonGroup
              ref={toggleGroupRef}
              size="small"
              value={dataMode}
              exclusive
              onChange={(_, v) => {
                if (v) setDataMode(v);
              }}
              sx={{
                height: 40,
                "& .MuiToggleButton-root": { px: 1.5 },
              }}
            >
              <ToggleButton value="dummy">
                <Bot size={14} />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  Dummy
                </Typography>
              </ToggleButton>
              <ToggleButton value="contact">
                <Search size={14} />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  Contact
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>

            <Box>
              {dataMode === "dummy" && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={contactType}
                    label="Type"
                    onChange={(e: SelectChangeEvent) =>
                      setContactType(e.target.value as ContactType)
                    }
                  >
                    {CONTACT_TYPE_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}{" "}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 0.5 }}
                        >
                          — {o.description}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {dataMode === "contact" && (
                <Autocomplete
                  size="small"
                  options={contactOptions}
                  getOptionLabel={getContactLabel}
                  value={selectedContact}
                  loading={contactLoading}
                  onInputChange={(_, v, reason) => {
                    if (reason === "input" || reason === "clear") {
                      setContactSearchQuery(v);
                    }
                  }}
                  onOpen={() => fetchSegmentContacts()}
                  onChange={(_, v) => setSelectedContact(v)}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  noOptionsText="No contacts found in segment"
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box>
                        <Typography variant="body2">
                          {option.firstName} {option.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search segment contact"
                      placeholder="Name or email"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {contactLoading ? (
                                <CircularProgress color="inherit" size={16} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                  sx={{ minWidth: 260 }}
                />
              )}
            </Box>

            <Box sx={{ justifySelf: "end" }}>
              {visibleCustomParams.length > 0 && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setParamsExpanded((p) => !p)}
                  endIcon={paramsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  sx={{
                    textTransform: "none",
                    px: 1,
                    color: "text.secondary",
                  }}
                >
                  {visibleCustomParams.length} custom{" "}
                  {visibleCustomParams.length === 1 ? "parameter" : "parameters"}
                </Button>
              )}
            </Box>
          </Box>

          <Collapse in={paramsExpanded && visibleCustomParams.length > 0}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `80px ${toggleGroupWidth > 0 ? toggleGroupWidth : 160}px 1fr`,
                columnGap: 2,
                rowGap: 0.75,
                maxHeight: 240,
                overflowY: "auto",
                alignItems: "center",
              }}
            >
              {visibleCustomParams.map((param) => {
                const idx = customParams.indexOf(param);
                return (
                  <React.Fragment key={param.key}>
                    <Box />
                    <TextField size="small" value={param.key} disabled />
                    <TextField
                      size="small"
                      placeholder="Value"
                      value={param.value}
                      onChange={(e) =>
                        updateCustomParam(idx, {
                          value: e.target.value,
                        })
                      }
                    />
                  </React.Fragment>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      </Collapse>

      {/* Error */}
      {previewError && (
        <Alert severity="warning" sx={{ borderRadius: 0 }}>
          {previewError}
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.50",
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <CircularProgress size={28} />
            <Typography variant="caption" color="text.secondary">
              Rendering preview...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Preview area */}
      {!isLoading && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            bgcolor: mobilePreview ? "grey.100" : "white",
            overflow: "hidden",
            p: mobilePreview ? 3 : 0,
            transition: "background-color 0.3s ease",
          }}
        >
          {previewHtml ? (
            <Box
              sx={{
                width: mobilePreview ? "375px" : "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.3s ease",
                background: "white",
              }}
            >
              {(previewSubject || previewContact || fromEmail) && (
                <Box
                  sx={{
                    px: "5px",
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  {fromName && fromEmail && (
                    <HeaderRow label="From:">
                      {fromName} &lt;{fromEmail}&gt;
                    </HeaderRow>
                  )}
                  {previewContact && (
                    <HeaderRow label="To:">
                      {previewContact.name || "Contact"}{" "}
                      {previewContact.email && <>&lt;{previewContact.email}&gt;</>}
                    </HeaderRow>
                  )}
                  {previewSubject && <HeaderRow label="Subject:">{previewSubject}</HeaderRow>}
                </Box>
              )}
              <iframe
                srcDoc={`<div style="padding:5px 5px">${previewHtml}</div>`}
                title="Campaign Email Preview"
                sandbox="allow-same-origin allow-scripts"
                style={{
                  border: "none",
                  width: "100%",
                  flex: 1,
                  background: "white",
                }}
              />
            </Box>
          ) : (
            !previewError && (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ flex: 1, py: 6 }}
              >
                <Mail size={32} color="#bbb" />
                <Typography variant="body2" color="text.secondary">
                  Loading campaign preview...
                </Typography>
              </Stack>
            )
          )}
        </Box>
      )}

      {/* Send Test Email Dialog */}
      <Dialog open={sendTestOpen} onClose={() => setSendTestOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a test email using the current template and preview settings (
            {dataMode === "dummy"
              ? `dummy ${contactType} contact`
              : selectedContact
              ? `${selectedContact.firstName} ${selectedContact.lastName}`
              : "no contact selected"}
            ).
          </Typography>
          <TextField
            autoFocus
            label="Recipient Email"
            type="email"
            fullWidth
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Enter email address"
            sx={{ mt: 1 }}
          />
          {(!fromEmail || !fromName) && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Sender email and name are required in the template settings.
            </Alert>
          )}
          {!subject && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Template subject is required.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendTestOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSendTest}
            variant="contained"
            disabled={isSending || !recipientEmail.trim() || !fromEmail || !fromName || !subject}
            startIcon={
              isSending ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />
            }
          >
            {isSending ? "Sending..." : "Send Test"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
