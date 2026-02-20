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
import {
  EmailTemplateUpdateDtoChangeLogDetailsDto,
  EmailTemplateUpdateDto,
} from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";

dayjs.extend(relativeTime);

export interface EmailTemplateChangeLogProps {
  templateId: string;
}

interface ChangeLogEntry extends EmailTemplateUpdateDtoChangeLogDetailsDto {
  formattedDate: string;
  relativeTime: string;
}

export const EmailTemplateChangeLog = ({ templateId }: EmailTemplateChangeLogProps) => {
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
  const componentMountedRef = useRef(true);

  useEffect(() => {
    fetchChangeLog();
  }, [templateId]);

  useEffect(() => {
    if (compareDialogOpen && compareFromEntry && compareToEntry) {
      const timer = setTimeout(() => {
        if (componentMountedRef.current) {
          setIsDialogStable(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsDialogStable(false);
    }
  }, [compareDialogOpen, compareFromEntry, compareToEntry]);

  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
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
      const response = await client.api.emailTemplatesChangeLogList(parseInt(templateId), filter);
      const formatted: ChangeLogEntry[] = response.data.map((entry) => ({
        ...entry,
        formattedDate: entry.createdAt
          ? dayjs(entry.createdAt).format("MMM D, YYYY [at] h:mm A")
          : "Unknown",
        relativeTime: entry.createdAt ? dayjs(entry.createdAt).fromNow() : "Unknown",
      }));
      setEntries(formatted);
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
    setCompareDialogOpen(true);
  }, []);

  const ContentRenderer = ({ content }: { content: string }) => {
    if (content.length > 500) {
      return (
        <MonacoEditor
          height="200px"
          value={content}
          language="html"
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

  const BodyDiffRenderer = ({ oldValue, newValue }: { oldValue: string; newValue: string }) => (
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
        contentText: { fontSize: "12px" },
      }}
    />
  );

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

  const renderChangedFields = (data?: EmailTemplateUpdateDto) => {
    if (!data) return null;
    const fields = Object.entries(data).filter(([, value]) => {
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {fields.map(([key, value]) => (
          <Paper variant="outlined" sx={{ p: 2 }} key={key}>
            <Typography variant="subtitle2" sx={{ mb: 1, textTransform: "capitalize" }}>
              {key.replace(/([A-Z])/g, " $1").trim()}
            </Typography>
            {key === "bodyTemplate" && typeof value === "string" && value.length > 100 ? (
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

    if (field === "bodyTemplate" && hasFromValue && hasToValue && isModified) {
      return (
        <Grid size={{ xs: 12 }} key={field}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
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
                  field === "bodyTemplate" &&
                  typeof fromValue === "string" &&
                  fromValue.length > 100 ? (
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
                  field === "bodyTemplate" &&
                  typeof toValue === "string" &&
                  toValue.length > 100 ? (
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

    const changedFields = allFields.filter((field) => {
      const fromValue = (fromData as Record<string, unknown>)[field];
      const toValue = (toData as Record<string, unknown>)[field];

      if (Array.isArray(fromValue) && Array.isArray(toValue)) {
        if (fromValue.length !== toValue.length) return true;
        return fromValue.some((item, index) => item !== toValue[index]);
      }

      if (Array.isArray(fromValue) || Array.isArray(toValue)) {
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
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
              No change log entries found for this template. Changes will appear here once you start
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
            }}
          >
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
                      {entry.updatedBy || entry.createdBy ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <User size={12} />
                          <Typography variant="body2">
                            {entry.updatedBy || entry.createdBy}
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
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
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
                              entries[index + 1].updatedBy || entries[index + 1].createdBy
                                ? ` by ${
                                    entries[index + 1].updatedBy || entries[index + 1].createdBy
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Calendar size={16} />
                    <Typography variant="subtitle2">Date</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEntry.formattedDate}
                  </Typography>
                </Grid>

                {(selectedEntry.updatedBy || selectedEntry.createdBy) && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <User size={16} />
                      <Typography variant="subtitle2">Modified By</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEntry.updatedBy || selectedEntry.createdBy}
                    </Typography>
                  </Grid>
                )}

                {selectedEntry.source && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <GitCompare size={20} />
            <Typography variant="h6">Compare Versions</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {compareFromEntry && compareToEntry && isDialogStable && componentMountedRef.current && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor: "error.50",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Older Version ({compareFromEntry.formattedDate})
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={compareFromEntry.entityState || "Unknown"}
                          color={getEntityStateColor(compareFromEntry.entityState)}
                          size="small"
                        />
                      </Box>
                      {(compareFromEntry.updatedBy || compareFromEntry.createdBy) && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <User size={12} />
                          <Typography variant="caption" color="text.secondary">
                            {compareFromEntry.updatedBy || compareFromEntry.createdBy}
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
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor: "success.50",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Newer Version ({compareToEntry.formattedDate})
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={compareToEntry.entityState || "Unknown"}
                          color={getEntityStateColor(compareToEntry.entityState)}
                          size="small"
                        />
                      </Box>
                      {(compareToEntry.updatedBy || compareToEntry.createdBy) && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <User size={12} />
                          <Typography variant="caption" color="text.secondary">
                            {compareToEntry.updatedBy || compareToEntry.createdBy}
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
