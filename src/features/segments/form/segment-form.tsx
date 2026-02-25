import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Save, Trash2, Users, Plus, X } from "lucide-react";
import { ModuleWrapper } from "@components/module-wrapper";
import { SegmentsBreadcrumbLinks } from "../constants";
import { SegmentType, contactFields } from "../types";
import {
  ContactDetailsDto,
  RuleGroup,
  SegmentCreateDto,
  SegmentDetailsDto,
  SegmentRule,
  SegmentUpdateDto,
} from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { RuleBuilder } from "../components/rule-builder";
import { ContactPickerModal } from "../components/contact-picker-modal";
import { useSaveShortcut } from "@hooks";
import { getFormattedDateOnly } from "utils/general-helper";

const defaultRuleGroup: RuleGroup = {
  id: "default-group",
  connector: "And",
  rules: [
    {
      id: "default-rule",
      fieldId: "email",
      operator: "Contains",
      value: "",
    },
  ],
  groups: [],
};

const normalizeFieldId = (fieldId: string) => {
  if (!fieldId) return contactFields[0]?.id ?? fieldId;
  const fieldIdLower = fieldId.toLowerCase();
  const directMatch = contactFields.find(
    (field) => field.id.toLowerCase() === fieldIdLower || field.name.toLowerCase() === fieldIdLower
  );
  if (directMatch) return directMatch.id;
  const pascalToCamel = `${fieldId[0].toLowerCase()}${fieldId.slice(1)}`;
  const camelMatch = contactFields.find((field) => field.id === pascalToCamel);
  return camelMatch?.id ?? contactFields[0]?.id ?? fieldId;
};

const normalizeOperator = (operator: string, allowedOperators: SegmentRule["operator"][]) => {
  const operatorLower = operator.toLowerCase();
  const directMatch = allowedOperators.find((op) => op.toLowerCase() === operatorLower);
  if (directMatch) return directMatch;
  const normalized = operatorLower.replace(/[^a-z0-9]/g, "");
  const looseMatch = allowedOperators.find(
    (op) => op.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
  );
  return looseMatch ?? allowedOperators[0];
};

const normalizeRuleGroup = (group: RuleGroup): RuleGroup => {
  const normalizedRules = group.rules?.map((rule) => {
    const normalizedFieldId = normalizeFieldId(rule.fieldId);
    const field = contactFields.find((item) => item.id === normalizedFieldId);
    const allowedOperators = field?.operators ?? [];
    const normalizedOperator =
      allowedOperators.length > 0
        ? normalizeOperator(String(rule.operator), allowedOperators) ?? rule.operator
        : rule.operator;
    const recordRule = rule as SegmentRule & {
      values?: SegmentRule["value"];
      Value?: SegmentRule["value"];
      Values?: SegmentRule["value"];
    };
    const normalizedValue =
      rule.value ?? recordRule.values ?? recordRule.Value ?? recordRule.Values;
    return {
      ...rule,
      fieldId: normalizedFieldId,
      operator: normalizedOperator,
      value: normalizedValue,
    };
  });
  const normalizedGroups = group.groups?.map((subGroup) => normalizeRuleGroup(subGroup));
  return {
    ...group,
    rules: normalizedRules,
    groups: normalizedGroups,
  };
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`segment-tabpanel-${index}`}
      aria-labelledby={`segment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

interface SegmentFormProps {
  segment?: SegmentDetailsDto | null;
  isEdit: boolean;
  onSave: (payload: SegmentCreateDto | SegmentUpdateDto) => Promise<void>;
  onSaveSuccess?: () => void;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

export const SegmentForm = ({
  segment,
  isEdit,
  onSave,
  onSaveSuccess,
  onCancel,
  onDelete,
}: SegmentFormProps) => {
  const { client } = useRequestContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [segmentType, setSegmentType] = useState<SegmentType>("dynamic");
  const [activeTab, setActiveTab] = useState(0);

  // Dynamic segment state
  const [includeRules, setIncludeRules] = useState<RuleGroup>(defaultRuleGroup);
  const [excludeRules, setExcludeRules] = useState<RuleGroup | null>(null);
  const [showExcludeRules, setShowExcludeRules] = useState(false);
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [previewContacts, setPreviewContacts] = useState<ContactDetailsDto[]>([]);

  // Static segment state
  const [staticContactIds, setStaticContactIds] = useState<number[]>([]);
  const [isContactPickerOpen, setIsContactPickerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const clearPreviewResults = () => {
    setMatchingCount(null);
    setPreviewContacts([]);
  };

  useEffect(() => {
    if (!segment) return;

    setName(segment.name);
    setDescription(segment.description || "");
    const normalizedType = (segment.type || "dynamic").toLowerCase() as SegmentType;
    setSegmentType(normalizedType);
    setMatchingCount(segment.contactCount || 0);

    if (normalizedType === "dynamic" && segment.definition) {
      if (segment.definition.includeRules) {
        setIncludeRules(normalizeRuleGroup(segment.definition.includeRules));
      }
      if (segment.definition.excludeRules) {
        setExcludeRules(normalizeRuleGroup(segment.definition.excludeRules));
        setShowExcludeRules(true);
      } else {
        setExcludeRules(null);
        setShowExcludeRules(false);
      }
    } else if (normalizedType === "static") {
      setStaticContactIds(segment.contactIds || []);
      setExcludeRules(null);
      setShowExcludeRules(false);
    }
  }, [segment]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSegmentType(event.target.value as SegmentType);
    setActiveTab(0);
    clearPreviewResults();
  };

  const handleAddExcludeRules = () => {
    setExcludeRules({
      id: "exclude-group",
      connector: "And",
      rules: [
        {
          id: "exclude-rule-1",
          fieldId: "email",
          operator: "Contains",
          value: "",
        },
      ],
      groups: [],
    });
    setShowExcludeRules(true);
    clearPreviewResults();
  };

  const handleRemoveExcludeRules = () => {
    setExcludeRules(null);
    setShowExcludeRules(false);
    clearPreviewResults();
  };

  const handlePreview = useCallback(async () => {
    if (segmentType === "static") {
      setMatchingCount(staticContactIds.length);
      setPreviewContacts([]);
      return;
    }

    if (!includeRules.rules || includeRules.rules.length === 0) {
      setMatchingCount(0);
      setPreviewContacts([]);
      return;
    }

    try {
      const previewData = {
        includeRules,
        excludeRules: excludeRules || undefined,
      };

      const result = await client.api.segmentsPreviewCreate(previewData);
      setMatchingCount(result.data?.contactCount || 0);
      setPreviewContacts(result.data?.contacts || []);
    } catch (error) {
      console.error("Failed to preview segment:", error);
      setMatchingCount(null);
      setPreviewContacts([]);
    }
  }, [segmentType, staticContactIds, includeRules, excludeRules, client]);

  useEffect(() => {
    if (segmentType !== "dynamic") {
      setMatchingCount(staticContactIds.length);
      setPreviewContacts([]);
      return;
    }
    if (!includeRules.rules || includeRules.rules.length === 0) {
      setMatchingCount(0);
      setPreviewContacts([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void handlePreview();
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [segmentType, includeRules, excludeRules, handlePreview, staticContactIds]);

  const handleContactsSelected = (contactIds: string[]) => {
    setStaticContactIds(contactIds.map(Number));
  };

  const handleSave = async (shouldClose: boolean) => {
    try {
      const payload: SegmentCreateDto | SegmentUpdateDto = isEdit
        ? {
            name,
            description: description || null,
            definition:
              segmentType === "dynamic"
                ? {
                    includeRules,
                    excludeRules: excludeRules || undefined,
                  }
                : undefined,
            contactIds: segmentType === "static" ? staticContactIds : null,
          }
        : {
            name,
            description: description || null,
            type: (segmentType.charAt(0).toUpperCase() +
              segmentType.slice(1)) as SegmentCreateDto["type"],
            definition:
              segmentType === "dynamic"
                ? {
                    includeRules,
                    excludeRules: excludeRules || undefined,
                  }
                : undefined,
            contactIds: segmentType === "static" ? staticContactIds : null,
          };

      await onSave(payload);
      if (shouldClose) {
        onSaveSuccess?.();
      }
    } catch (error) {
      console.error("Failed to save segment:", error);
    }
  };

  const handleSaveStay = () => {
    void handleSave(false);
  };

  const handleSaveAndClose = () => {
    void handleSave(true);
  };

  useSaveShortcut(handleSaveStay, true);

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const currentBreadcrumb = isEdit ? "Edit Segment" : "Create Segment";

  return (
    <ModuleWrapper
      breadcrumbs={SegmentsBreadcrumbLinks}
      currentBreadcrumb={currentBreadcrumb}
      isForm={true}
      actionButtons={
        <Box
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Delete */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              pl: { sm: 4 },
            }}
          >
            {isEdit && onDelete && (
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
          </Box>
          {/* Right: Cancel + Save */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              pr: { sm: 4 },
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={onCancel}
              startIcon={<X size={18} />}
              size="medium"
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<Save size={18} />}
              onClick={handleSaveStay}
              disabled={!name.trim()}
              size="medium"
            >
              Save
            </Button>
            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={handleSaveAndClose}
              disabled={!name.trim()}
              size="medium"
            >
              Save and Close
            </Button>
          </Box>
        </Box>
      }
    >
      <Card sx={{ mb: 2 }}>
        <CardHeader title="Segment Details" titleTypographyProps={{ variant: "subtitle1" }} />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                size="small"
                label="Segment Name"
                placeholder="e.g., High-Value Customers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                select
                size="small"
                label="Segment Type"
                value={segmentType}
                onChange={handleTypeChange}
                fullWidth
              >
                <MenuItem value="dynamic">Dynamic (rule-based)</MenuItem>
                <MenuItem value="static">Static (manual selection)</MenuItem>
              </TextField>
            </Box>
            <TextField
              size="small"
              label="Description"
              placeholder="Describe the purpose of this segment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Definition" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Contacts
                <Chip
                  size="small"
                  label={segmentType === "dynamic" ? matchingCount : staticContactIds.length}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Definition Tab */}
      <TabPanel value={activeTab} index={0}>
        {segmentType === "dynamic" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                px: 1.5,
                py: 1,
              }}
            >
              <Users size={16} />
              <Typography variant="body2">
                This segment would match approximately <strong>{matchingCount ?? 0}</strong>{" "}
                contacts
              </Typography>
            </Box>

            {/* Include Rules */}
            <Card>
              <CardHeader
                title="Include Contacts"
                subheader="Define rules for contacts to include in this segment"
                titleTypographyProps={{ variant: "subtitle1" }}
              />
              <CardContent>
                <RuleBuilder
                  ruleGroup={includeRules}
                  onChange={(newRuleGroup) => {
                    setIncludeRules(newRuleGroup);
                    clearPreviewResults();
                  }}
                />
              </CardContent>
            </Card>

            {/* Exclude Rules */}
            {showExcludeRules && excludeRules ? (
              <Card sx={{ border: "1px solid", borderColor: "error.main" }}>
                <CardHeader
                  title="Exclude Contacts"
                  subheader="Define rules for contacts to exclude from this segment"
                  action={
                    <Button
                      size="small"
                      startIcon={<X size={16} />}
                      onClick={handleRemoveExcludeRules}
                      color="error"
                    >
                      Remove
                    </Button>
                  }
                  titleTypographyProps={{ variant: "subtitle1" }}
                />
                <CardContent>
                  <RuleBuilder
                    ruleGroup={excludeRules}
                    onChange={(newRuleGroup) => {
                      setExcludeRules(newRuleGroup as RuleGroup);
                      clearPreviewResults();
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={handleAddExcludeRules}
                sx={{ alignSelf: "flex-start" }}
                size="small"
              >
                Add Exclusion Rules
              </Button>
            )}
          </Box>
        ) : (
          <Card>
            <CardHeader
              title="Select Contacts"
              subheader="Manually choose which contacts to include in this segment"
              titleTypographyProps={{ variant: "subtitle1" }}
            />
            <CardContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {staticContactIds.length}
                    contact{staticContactIds.length !== 1 ? "s" : ""} selected
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Users size={16} />}
                    onClick={() => setIsContactPickerOpen(true)}
                    size="small"
                  >
                    Manage Contacts
                  </Button>
                </Box>

                {staticContactIds.length === 0 ? (
                  <Alert severity="info">
                    No contacts selected yet. Use the &quot;Manage Contacts&quot; button to add
                    contacts to this segment.
                  </Alert>
                ) : (
                  <Alert severity="success">
                    <Typography variant="body2">
                      {staticContactIds.length} contact
                      {staticContactIds.length !== 1 ? "s" : ""} in this segment.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {/* Contacts Tab */}
      <TabPanel value={activeTab} index={1}>
        <Card>
          <CardHeader
            title={`Contacts (${
              segmentType === "dynamic" ? matchingCount : staticContactIds.length
            })`}
            subheader={
              segmentType === "dynamic"
                ? "Contacts matching the defined rules"
                : "Manually selected contacts"
            }
            titleTypographyProps={{ variant: "subtitle1" }}
          />
          <CardContent>
            {segmentType === "dynamic" ? (
              previewContacts.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {previewContacts.map((contact) => (
                    <Box
                      key={contact.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        "&:hover": { backgroundColor: "grey.50" },
                      }}
                    >
                      {contact.avatarUrl && (
                        <Box
                          component="img"
                          src={contact.avatarUrl}
                          alt="Avatar"
                          sx={{ width: 32, height: 32, borderRadius: "50%" }}
                        />
                      )}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body1" fontWeight="500">
                          {contact.firstName || contact.lastName
                            ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                            : "Unnamed Contact"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {contact.email}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexShrink: 0,
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        {contact.countryCode && (
                          <Chip
                            label={contact.countryCode}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        )}
                        {(contact.ordersCount ?? 0) > 0 && (
                          <Chip
                            label={`${contact.ordersCount} orders`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        )}
                        {(contact.dealsCount ?? 0) > 0 && (
                          <Chip
                            label={`${contact.dealsCount} deals`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        )}
                        {(contact.totalRevenue ?? 0) > 0 && (
                          <Chip
                            label={`$${contact.totalRevenue?.toLocaleString()}`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        )}
                        {contact.lastOrderDate && (
                          <Chip
                            label={`Last order: ${getFormattedDateOnly(contact.lastOrderDate)}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                  <Box component={Users} size={48} sx={{ opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Matching contacts will appear here automatically
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2, maxWidth: 400, mx: "auto" }}>
                    Preview refreshes automatically as you update the rules.
                  </Alert>
                </Box>
              )
            ) : (
              <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
                <Users size={48} style={{ opacity: 0.5 }} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {staticContactIds.length === 0
                    ? "No contacts selected yet"
                    : isEdit
                    ? "Contact list will be updated after saving"
                    : "Contacts will be shown here after saving"}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Contact Picker Modal */}
      <ContactPickerModal
        open={isContactPickerOpen}
        onOpenChange={setIsContactPickerOpen}
        selectedContactIds={staticContactIds.map(String)}
        onConfirm={handleContactsSelected}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Segment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this segment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </ModuleWrapper>
  );
};
