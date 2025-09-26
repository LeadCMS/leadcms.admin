import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Paper,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { History, Eye, User, Calendar, GitCompare } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MonacoEditor from "@monaco-editor/react";
import ReactDiffViewer from "react-diff-viewer-continued";
import { ContentUpdateDtoChangeLogDetailsDto, ContentUpdateDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";

dayjs.extend(relativeTime);

export interface ContentChangeLogProps {
  contentId: string;
  contentType?: string;
}

interface ChangeLogEntry extends ContentUpdateDtoChangeLogDetailsDto {
  formattedDate: string;
  relativeTime: string;
}

export const ContentChangeLog = ({ contentId, contentType }: ContentChangeLogProps) => {
  const { client } = useRequestContext();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<ChangeLogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ChangeLogEntry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareFromEntry, setCompareFromEntry] = useState<ChangeLogEntry | null>(null);
  const [compareToEntry, setCompareToEntry] = useState<ChangeLogEntry | null>(null);
  const [isDialogStable, setIsDialogStable] = useState(false);
  const [contentTypeDetails, setContentTypeDetails] = useState<{ format?: string } | null>(null);
  const componentMountedRef = useRef(true);

  useEffect(() => {
    fetchChangeLog();
  }, [contentId, contentType]);

  // Manage dialog stability for diff renderer
  useEffect(() => {
    if (compareDialogOpen && compareFromEntry && compareToEntry) {
      // Quick delay to ensure dialog is rendered before showing diff
      const timer = setTimeout(() => {
        if (componentMountedRef.current) {
          setIsDialogStable(true);
        }
      }, 100); // Reduced delay since react-diff-viewer is more stable
      return () => clearTimeout(timer);
    } else {
      setIsDialogStable(false);
    }
  }, [compareDialogOpen, compareFromEntry, compareToEntry]);

  // Cleanup effect for component unmount
  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      // Ensure component state is cleaned up when component unmounts
      componentMountedRef.current = false;
      setIsDialogStable(false);
      setCompareDialogOpen(false);
      setCompareFromEntry(null);
      setCompareToEntry(null);
    };
  }, []);

  const fetchChangeLog = async () => {
    try {
      setLoading(true);

      const filter: Record<string, unknown> = {
        ["filter[order]"]: "createdAt desc",
      };

      // Fetch change log and content type details in parallel
      const [changeLogResponse, contentTypesResponse] = await Promise.all([
        client.api.contentChangeLogList(parseInt(contentId), filter),
        contentType ? client.api.contentTypesList() : Promise.resolve({ data: [] }),
      ]);

      // Find the specific content type details
      if (contentType) {
        const typeDetails = contentTypesResponse.data.find(
          (ct: { uid: string; format?: string }) => ct.uid === contentType
        );
        setContentTypeDetails(typeDetails || null);
      }

      const formattedEntries: ChangeLogEntry[] = changeLogResponse.data.map((entry) => ({
        ...entry,
        formattedDate: entry.createdAt
          ? dayjs(entry.createdAt).format("MMM D, YYYY [at] h:mm A")
          : "Unknown",
        relativeTime: entry.createdAt ? dayjs(entry.createdAt).fromNow() : "Unknown",
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error("Failed to fetch change log:", error);
      showErrorModal(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleViewEntry = (entry: ChangeLogEntry) => {
    setSelectedEntry(entry);
    setViewDialogOpen(true);
  };

  // Handle dialog close with proper cleanup
  const handleCompareDialogClose = useCallback(() => {
    if (!componentMountedRef.current) return;

    setIsDialogStable(false);
    setCompareDialogOpen(false);
    setCompareFromEntry(null);
    setCompareToEntry(null);
  }, []);

  const handleCompareEntries = useCallback((fromEntry: ChangeLogEntry, toEntry: ChangeLogEntry) => {
    setCompareFromEntry(fromEntry);
    setCompareToEntry(toEntry);
    // Open dialog immediately, stability check will handle rendering delay
    setCompareDialogOpen(true);
  }, []);

  // Helper function to get Monaco language from content type format
  const getMonacoLanguageFromFormat = (format?: string): string => {
    if (!format) return "plaintext";
    const upperFormat = format.toUpperCase();
    switch (upperFormat) {
      case "JSON":
        return "json";
      case "YAML":
      case "YML":
        return "yaml";
      case "HTML":
        return "html";
      case "MD":
      case "MDX":
      case "MARKDOWN":
        return "markdown";
      default:
        return "plaintext";
    }
  };

  // Component to render content with syntax highlighting
  const ContentRenderer = ({ content }: { content: string }) => {
    // Use content type format if available, otherwise fall back to content detection
    const getLanguage = () => {
      if (contentTypeDetails?.format) {
        return getMonacoLanguageFromFormat(contentTypeDetails.format);
      }
      // Simple content detection
      const trimmed = content.trim();
      try {
        JSON.parse(trimmed);
        return "json";
      } catch {
        if (trimmed.includes("# ") || trimmed.includes("```")) {
          return "markdown";
        }
        return "plaintext";
      }
    };

    if (content.length > 500) {
      // For long content, use Monaco Editor with syntax highlighting
      return (
        <MonacoEditor
          height="200px"
          value={content}
          language={getLanguage()}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            fontSize: 12,
          }}
        />
      );
    }

    // For shorter content, use simple pre-formatted text
    return (
      <Box
        component="pre"
        sx={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: 0,
          fontSize: "12px",
          lineHeight: "1.4",
          maxHeight: "200px",
          overflow: "auto",
        }}
      >
        {content}
      </Box>
    );
  };

  // Component to render diff for body content using react-diff-viewer-continued
  const BodyDiffRenderer = ({ oldValue, newValue }: { oldValue: string; newValue: string }) => {
    return (
      <ReactDiffViewer
        oldValue={oldValue || ""}
        newValue={newValue || ""}
        splitView={true}
        styles={{
          line: {
            padding: "0 8px",
            fontSize: "12px",
            lineHeight: "1.4",
          },
          gutter: {
            padding: "0 4px",
            fontSize: "12px",
          },
          contentText: {
            fontSize: "12px",
          },
        }}
      />
    );
  };

  const getEntityStateColor = (entityState?: string) => {
    switch (entityState) {
      case "Added":
        return "success";
      case "Modified":
        return "warning";
      case "Deleted":
        return "error";
      default:
        return "default";
    }
  };

  const renderChangedFields = (data?: ContentUpdateDto) => {
    if (!data) return null;

    const fields = Object.entries(data).filter(([, value]) => {
      // Exclude null, undefined, empty strings, and empty arrays
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });

    if (fields.length === 0)
      return (
        <Typography variant="body2" color="text.secondary">
          No changes detected
        </Typography>
      );

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {fields.map(([key, value]) => (
          <Paper variant="outlined" sx={{ p: 2 }} key={key}>
            <Typography variant="subtitle2" sx={{ mb: 1, textTransform: "capitalize" }}>
              {key.replace(/([A-Z])/g, " $1").trim()}
            </Typography>
            {key === "body" && typeof value === "string" && value.length > 100 ? (
              <ContentRenderer content={value} />
            ) : (
              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    );
  };

  const renderFieldComparison = (field: string, fromValue: unknown, toValue: unknown) => {
    const hasFromValue = fromValue !== null && fromValue !== undefined;
    const hasToValue = toValue !== null && toValue !== undefined;
    const hasChange = fromValue !== toValue;
    const isAdded = !hasFromValue && hasToValue;
    const isRemoved = hasFromValue && !hasToValue;
    const isModified = hasFromValue && hasToValue && hasChange;

    const getValueDisplay = (value: unknown) => {
      if (value === null || value === undefined) return "";
      return Array.isArray(value) ? value.join(", ") : String(value);
    };

    // For body field, only show the advanced diff view if both values exist and are modified
    if (field === "body" && hasFromValue && hasToValue && isModified) {
      return (
        <Grid size={{ xs: 12 }} key={field}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ textTransform: "capitalize" }}>
                {field.replace(/([A-Z])/g, " $1").trim()}
              </Typography>
            </Box>
            {isDialogStable ? (
              <BodyDiffRenderer
                oldValue={getValueDisplay(fromValue)}
                newValue={getValueDisplay(toValue)}
              />
            ) : (
              <Box
                sx={{
                  mt: 1,
                  height: "400px",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading diff viewer...
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      );
    }

    return (
      <Grid size={{ xs: 12 }} key={field}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ textTransform: "capitalize" }}>
              {field.replace(/([A-Z])/g, " $1").trim()}
            </Typography>
            {isAdded && <Chip label="Added" color="success" size="small" />}
            {isRemoved && <Chip label="Removed" color="error" size="small" />}
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                From (Older Version)
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: isRemoved ? "error.50" : isModified ? "error.50" : "grey.50",
                  borderColor: isRemoved ? "error.main" : isModified ? "error.main" : "grey.300",
                  borderLeft: isRemoved || isModified ? "4px solid" : "1px solid",
                  borderLeftColor: isRemoved
                    ? "error.main"
                    : isModified
                    ? "error.main"
                    : "grey.300",
                }}
              >
                {hasFromValue ? (
                  field === "body" && typeof fromValue === "string" && fromValue.length > 100 ? (
                    <ContentRenderer content={fromValue} />
                  ) : (
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                      {getValueDisplay(fromValue)}
                    </Typography>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    (not set)
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                To (Newer Version)
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: isAdded ? "success.50" : isModified ? "success.50" : "grey.50",
                  borderColor: isAdded ? "success.main" : isModified ? "success.main" : "grey.300",
                  borderLeft: isAdded || isModified ? "4px solid" : "1px solid",
                  borderLeftColor: isAdded
                    ? "success.main"
                    : isModified
                    ? "success.main"
                    : "grey.300",
                }}
              >
                {hasToValue ? (
                  field === "body" && typeof toValue === "string" && toValue.length > 100 ? (
                    <ContentRenderer content={toValue} />
                  ) : (
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                      {getValueDisplay(toValue)}
                    </Typography>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    (not set)
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  };

  const renderComparison = () => {
    if (!compareFromEntry || !compareToEntry) return null;

    const fromData = compareFromEntry.data || {};
    const toData = compareToEntry.data || {};

    const allFields = Array.from(new Set([...Object.keys(fromData), ...Object.keys(toData)]));

    // Filter to show only fields that have actually changed
    const changedFields = allFields.filter((field) => {
      const fromValue = (fromData as Record<string, unknown>)[field];
      const toValue = (toData as Record<string, unknown>)[field];

      // Special handling for arrays (like tags) - compare contents not just reference
      if (Array.isArray(fromValue) && Array.isArray(toValue)) {
        // Both are arrays, compare contents
        if (fromValue.length !== toValue.length) return true;
        return fromValue.some((item, index) => item !== toValue[index]);
      }

      // Handle cases where one is array and other is not
      if (Array.isArray(fromValue) || Array.isArray(toValue)) {
        // If one is empty array and other is null/undefined, consider them the same
        const fromIsEmpty = !fromValue || (Array.isArray(fromValue) && fromValue.length === 0);
        const toIsEmpty = !toValue || (Array.isArray(toValue) && toValue.length === 0);
        if (fromIsEmpty && toIsEmpty) return false;
        return true;
      }

      return fromValue !== toValue;
    });

    if (changedFields.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
          No field changes detected between these versions.
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {changedFields.map((field) =>
          renderFieldComparison(
            field,
            (fromData as Record<string, unknown>)[field],
            (toData as Record<string, unknown>)[field]
          )
        )}
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading change log...
        </Typography>
      </Box>
    );
  }

  if (entries.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <History size={48} color="#ccc" style={{ marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              No Change History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No change log entries found for this content. Changes will appear here once you start
              editing.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <History size={20} />
            <Typography variant="h6" sx={{ ml: 1 }}>
              Change Log ({entries.length})
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Modified By</TableCell>
                  <TableCell>Data Size</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow key={entry.id || index}>
                    <TableCell>
                      <Chip
                        label={entry.entityState || "Unknown"}
                        color={getEntityStateColor(entry.entityState)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {entry.formattedDate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.relativeTime}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {entry.createdBy || entry.updatedBy ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <User size={12} />
                          <Typography variant="body2">
                            {entry.createdBy || entry.updatedBy}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          Unknown
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entry.data
                          ? `${(new Blob([JSON.stringify(entry.data)]).size / 1024).toFixed(1)} KB`
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Eye size={16} />}
                          onClick={() => handleViewEntry(entry)}
                        >
                          View
                        </Button>
                        {index < entries.length - 1 && (
                          <Tooltip
                            title={`Compare with ${entries[index + 1].formattedDate}${
                              entries[index + 1].createdBy || entries[index + 1].updatedBy
                                ? ` by ${
                                    entries[index + 1].createdBy || entries[index + 1].updatedBy
                                  }`
                                : ""
                            }`}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              startIcon={<GitCompare size={16} />}
                              onClick={() => handleCompareEntries(entries[index + 1], entry)}
                            >
                              Compare
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Entry Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Change Details - {selectedEntry?.entityState}</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Calendar size={16} />
                    <Typography variant="subtitle2">Date</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEntry.formattedDate}
                  </Typography>
                </Grid>

                {(selectedEntry.createdBy || selectedEntry.updatedBy) && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <User size={16} />
                      <Typography variant="subtitle2">Modified By</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEntry.createdBy || selectedEntry.updatedBy}
                    </Typography>
                  </Grid>
                )}

                {selectedEntry.source && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <User size={16} />
                      <Typography variant="subtitle2">Source</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEntry.source}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Changed Fields
              </Typography>
              {renderChangedFields(selectedEntry.data)}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Compare Versions Dialog */}
      <Dialog open={compareDialogOpen} onClose={handleCompareDialogClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GitCompare size={20} />
            <Typography variant="h6">Compare Versions</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {compareFromEntry && compareToEntry && isDialogStable && componentMountedRef.current && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: "error.50" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Older Version ({compareFromEntry.formattedDate})
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={compareFromEntry.entityState || "Unknown"}
                          color={getEntityStateColor(compareFromEntry.entityState)}
                          size="small"
                        />
                      </Box>
                      {(compareFromEntry.createdBy || compareFromEntry.updatedBy) && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <User size={12} />
                          <Typography variant="caption" color="text.secondary">
                            {compareFromEntry.createdBy || compareFromEntry.updatedBy}
                          </Typography>
                        </Box>
                      )}
                      {compareFromEntry.source && (
                        <Typography variant="caption" color="text.secondary">
                          Source: {compareFromEntry.source}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: "success.50" }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Newer Version ({compareToEntry.formattedDate})
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={compareToEntry.entityState || "Unknown"}
                          color={getEntityStateColor(compareToEntry.entityState)}
                          size="small"
                        />
                      </Box>
                      {(compareToEntry.createdBy || compareToEntry.updatedBy) && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <User size={12} />
                          <Typography variant="caption" color="text.secondary">
                            {compareToEntry.createdBy || compareToEntry.updatedBy}
                          </Typography>
                        </Box>
                      )}
                      {compareToEntry.source && (
                        <Typography variant="caption" color="text.secondary">
                          Source: {compareToEntry.source}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Field Changes
              </Typography>
              {renderComparison()}
            </Box>
          )}

          {/* Show loading state when dialog is not stable */}
          {compareFromEntry && compareToEntry && !isDialogStable && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Preparing comparison view...
              </Typography>
            </Box>
          )}

          {/* Show message when no comparison data */}
          {(!compareFromEntry || !compareToEntry) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No comparison data available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCompareDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
