import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Chip,
  Skeleton,
  LinearProgress,
  Checkbox,
  IconButton,
  Tooltip,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  PlayArrow,
  Refresh,
  CheckCircle,
  Cancel,
  Schedule,
  CloudUpload,
  TrendingUp,
  AccessTime,
  Error as ErrorIcon,
  HourglassEmpty,
  Visibility,
  Rocket,
  Warning,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { parseApiError } from "@utils/api-error-parser";
import { AlertCircle } from "lucide-react";
import type { DeploymentRecordDto, DeploymentStatsDto, DeploymentTargetDto } from "../types";
import {
  formatDuration,
  formatDate,
  getStatusColor,
  getStatusLabel,
  getProviderDisplayName,
  formatRelativeTime,
} from "../utils";
import { DEPLOYMENT_HISTORY_LIMIT } from "../constants";

export const DeploymentsList = () => {
  const { client } = useRequestContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const hasInitializedTab = useRef(false);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);

  const [deployments, setDeployments] = useState<DeploymentRecordDto[]>([]);
  const [stats, setStats] = useState<DeploymentStatsDto | null>(null);
  const [targets, setTargets] = useState<DeploymentTargetDto[]>([]);

  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "single" | "selected" | "all";
    targetId?: string;
    targetName?: string;
  }>({ open: false, type: "single" });

  useEffect(() => {
    if (hasInitializedTab.current) return;

    const tabParam = searchParams.get("tab");
    const parsedTab = Number(tabParam);
    const isValidTab = Number.isInteger(parsedTab) && parsedTab >= 0 && parsedTab <= 2;

    if (isValidTab) {
      setActiveTab(parsedTab);
    } else {
      setSearchParams({ tab: "0" }, { replace: true });
    }

    hasInitializedTab.current = true;
  }, [searchParams, setSearchParams]);

  const loadDeployments = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await client.api.deploymentsList({ limit: DEPLOYMENT_HISTORY_LIMIT });
      setDeployments(response.data || []);
    } catch (error) {
      const apiError = parseApiError(error, "Failed to load deployments");
      setLoadError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [client.api]);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await client.api.deploymentsStatsList();
      setStats(response.data || null);
    } catch (error) {
      const apiError = parseApiError(error, "Failed to load deployment stats");
      if (!loadError) setLoadError(apiError.message);
    } finally {
      setStatsLoading(false);
    }
  }, [client.api]);

  const loadTargets = useCallback(async () => {
    try {
      setTargetsLoading(true);
      const response = await client.api.deploymentsTargetsList();
      setTargets(response.data || []);
    } catch (error) {
      const apiError = parseApiError(error, "Failed to load deployment targets");
      if (!loadError) setLoadError(apiError.message);
    } finally {
      setTargetsLoading(false);
    }
  }, [client.api]);

  useEffect(() => {
    loadDeployments();
    loadStats();
    loadTargets();
  }, [loadDeployments, loadStats, loadTargets]);

  const handleRefresh = () => {
    loadDeployments();
    loadStats();
    loadTargets();
  };

  const handleToggleTarget = (targetId: string) => {
    setSelectedTargets((prev) =>
      prev.includes(targetId) ? prev.filter((id) => id !== targetId) : [...prev, targetId]
    );
  };

  const openConfirmDialog = (
    type: "single" | "selected" | "all",
    targetId?: string,
    targetName?: string
  ) => {
    setConfirmDialog({ open: true, type, targetId, targetName });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, type: "single" });
  };

  const executeDeployment = async (
    targetIds: string[] | null,
    triggerAll: boolean,
    pendingMessage: string,
    successMessage: string
  ) => {
    setDeploying(true);

    const deployPromise = async () => {
      const result = await client.api.deploymentsTriggerCreate({
        targetIds,
        triggerAll,
      });
      return result;
    };

    try {
      await notificationsService.promise(deployPromise(), {
        pending: pendingMessage,
        success: successMessage,
        error: (error) => {
          const errMessage = "Deployment failed to start";
          const errDetails: string[] = [];
          const errorWithMessage = error as { message?: string } | undefined;
          if (errorWithMessage?.message) {
            errDetails.push(errorWithMessage.message);
          }
          return {
            title: errMessage,
            onClick: errDetails.length > 0 ? () => showErrorModal(errDetails) : undefined,
          };
        },
      });

      // Only refresh after successful deployment trigger
      if (!triggerAll) {
        setSelectedTargets([]);
      }
      await loadDeployments();
      await loadStats();
    } finally {
      setDeploying(false);
    }
  };

  const handleConfirmDeploy = async () => {
    closeConfirmDialog();

    if (confirmDialog.type === "single" && confirmDialog.targetId) {
      await executeDeployment(
        [confirmDialog.targetId],
        false,
        `Starting deployment to ${confirmDialog.targetName}...`,
        `Deployment to ${confirmDialog.targetName} started successfully`
      );
    } else if (confirmDialog.type === "selected") {
      await executeDeployment(
        selectedTargets,
        false,
        `Starting ${selectedTargets.length} deployment(s)...`,
        `${selectedTargets.length} deployment(s) started successfully`
      );
    } else if (confirmDialog.type === "all") {
      await executeDeployment(
        null,
        true,
        "Starting all deployments...",
        "All deployments started successfully"
      );
    }
  };

  const handleDeploySelected = () => {
    if (selectedTargets.length === 0) return;
    openConfirmDialog("selected");
  };

  const handleDeployAll = () => {
    openConfirmDialog("all");
  };

  const handleQuickDeploy = (targetId: string, targetName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmDialog("single", targetId, targetName);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchParams({ tab: String(newValue) });
  };

  const handleViewDeployment = (id: string | undefined) => {
    if (id) {
      navigate(`/deployments/${id}`);
    }
  };

  // Get last deployment status for each target
  const getLastDeploymentForTarget = (targetId: string | undefined) => {
    if (!targetId) return null;
    return deployments.find((d) => d.targetId === targetId) || null;
  };

  // Get selected target names for confirmation dialog
  const getSelectedTargetNames = () => {
    return selectedTargets
      .map((id) => targets.find((t) => t.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const isHttpUrl = (value: string | null | undefined) =>
    Boolean(value && (value.startsWith("http://") || value.startsWith("https://")));

  const successRate = stats?.successRate ?? 0;
  const inProgressCount = stats?.inProgressDeployments ?? 0;
  const pendingCount = stats?.pendingDeployments ?? 0;

  if (loading && statsLoading && targetsLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Box>
    );
  }

  if (loadError && !loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          py: 6,
          px: 2,
        }}
      >
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            backgroundColor: "grey.50",
            borderRadius: 3,
            border: "2px dashed",
            borderColor: "grey.300",
            maxWidth: 500,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
              color: "error.main",
            }}
          >
            <AlertCircle size={48} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: "grey.700",
            }}
          >
            Error loading deployments
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "grey.600",
              lineHeight: 1.6,
            }}
          >
            {loadError}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Deploy your site to production and staging environments
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Deployments
                  </Typography>
                  <Typography variant="h4">
                    {statsLoading ? <Skeleton width={60} /> : stats?.totalDeployments ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lifetime total
                  </Typography>
                </Box>
                <CloudUpload sx={{ color: "text.secondary" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Success Rate
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {statsLoading ? <Skeleton width={60} /> : `${successRate.toFixed(0)}%`}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={successRate}
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                    color="success"
                  />
                </Box>
                <TrendingUp sx={{ color: "success.main", ml: 2 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Deployments
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ textAlign: "center", minWidth: 50 }}>
                      <Typography variant="h4" color="info.main">
                        {statsLoading ? <Skeleton width={40} /> : inProgressCount}
                      </Typography>
                      <Typography variant="caption" color="info.main">
                        running
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center", minWidth: 50 }}>
                      <Typography variant="h4" color="warning.main">
                        {statsLoading ? <Skeleton width={40} /> : pendingCount}
                      </Typography>
                      <Typography variant="caption" color="warning.main">
                        queued
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <PlayArrow sx={{ color: "info.main" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Avg Duration
                  </Typography>
                  <Typography variant="h4">
                    {statsLoading ? (
                      <Skeleton width={60} />
                    ) : (
                      formatDuration(stats?.averageDuration)
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Average deployment time
                  </Typography>
                </Box>
                <AccessTime sx={{ color: "text.secondary" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Deploy" />
            <Tab label="History" />
            <Tab label="Targets" />
          </Tabs>
        </Box>
      </Paper>

      {/* Trigger Deployment Tab */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Choose Deployment Targets
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {"Select one or more targets to start a new deployment. "}
            {"Each target will build and publish your site independently."}
          </Typography>

          {targetsLoading ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={72}
                  sx={{ mb: 2, borderRadius: 1 }}
                />
              ))}
            </Box>
          ) : targets.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Schedule sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography color="text.secondary">No deployment targets configured yet</Typography>
              <Typography variant="caption" color="text.secondary">
                Configure targets in your deployment settings to get started
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {targets.map((target) => {
                  const isSelected = selectedTargets.includes(target.id || "");
                  const lastDeployment = getLastDeploymentForTarget(target.id);
                  const lastStatus = lastDeployment?.status;
                  return (
                    <Paper
                      key={target.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        borderColor: isSelected ? "primary.main" : "divider",
                        bgcolor: isSelected ? "primary.50" : "background.paper",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: isSelected ? "primary.50" : "action.hover",
                        },
                      }}
                      onClick={() => handleToggleTarget(target.id || "")}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Checkbox checked={isSelected} color="primary" />
                          {lastStatus === "Failed" ? (
                            <ErrorIcon color="error" />
                          ) : lastStatus === "Completed" ? (
                            <CheckCircle color="success" />
                          ) : (
                            <CloudUpload color={isSelected ? "primary" : "disabled"} />
                          )}
                          <Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="subtitle1" fontWeight={500}>
                                {target.name}
                              </Typography>
                              {lastDeployment && (
                                <Chip
                                  size="small"
                                  label={getStatusLabel(lastDeployment.status)}
                                  color={getStatusColor(lastDeployment.status)}
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {getProviderDisplayName(target.provider)}
                              {target.resource && ` • ${target.resource}`}
                              {lastDeployment?.startedAt &&
                                ` • ${formatRelativeTime(lastDeployment.startedAt)}`}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {target.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mr: 1, display: { xs: "none", md: "block" } }}
                            >
                              {target.description}
                            </Typography>
                          )}
                          <Tooltip title="Deploy Now">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) =>
                                handleQuickDeploy(target.id || "", target.name || "", e)
                              }
                              disabled={deploying}
                              sx={{
                                bgcolor: "primary.light",
                                "&:hover": { bgcolor: "primary.main", color: "white" },
                              }}
                            >
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 3,
                  pt: 3,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {selectedTargets.length} target(s) selected
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    onClick={handleDeployAll}
                    disabled={deploying || targets.length === 0}
                  >
                    Deploy All
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={handleDeploySelected}
                    disabled={deploying || selectedTargets.length === 0}
                  >
                    Deploy Selected
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Deployment History Tab */}
      {activeTab === 1 && (
        <Paper>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">Deployment History</Typography>
            <Typography variant="body2" color="text.secondary">
              Track the status and details of your recent deployments
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Triggered By</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : deployments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                      <Typography color="text.secondary">
                        No deployments yet. Start your first deployment from the Deploy tab.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  deployments.map((deployment) => (
                    <TableRow
                      key={deployment.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleViewDeployment(deployment.id)}
                    >
                      <TableCell>
                        <Chip
                          size="small"
                          label={getStatusLabel(deployment.status)}
                          color={getStatusColor(deployment.status)}
                          icon={
                            deployment.status === "Completed" ? (
                              <CheckCircle fontSize="small" />
                            ) : deployment.status === "Failed" ? (
                              <ErrorIcon fontSize="small" />
                            ) : deployment.status === "InProgress" ? (
                              <Schedule fontSize="small" />
                            ) : deployment.status === "Pending" ? (
                              <HourglassEmpty fontSize="small" />
                            ) : (
                              <Cancel fontSize="small" />
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {deployment.targetName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isHttpUrl(deployment.resource) ? (
                          <Link
                            href={deployment.resource || ""}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {deployment.resource}
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {deployment.resource || "-"}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {deployment.triggeredByName || "System"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDuration(deployment.duration)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={formatDate(deployment.startedAt)}>
                          <Typography variant="body2">
                            {formatRelativeTime(deployment.startedAt)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDeployment(deployment.id);
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Targets Tab */}
      {activeTab === 2 && (
        <Paper>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6">Configured Targets</Typography>
            <Typography variant="body2" color="text.secondary">
              Available deployment destinations for your site
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {targetsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(4)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : targets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                      <Typography color="text.secondary">
                        No deployment targets configured. Add targets in your settings.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  targets.map((target) => (
                    <TableRow key={target.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {target.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getProviderDisplayName(target.provider)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {target.resource || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {target.description || "-"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Rocket color="primary" />
          Confirm Deployment
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {"This will start a new deployment pipeline. "}
              {"The process typically takes 1-3 minutes to complete."}
            </Typography>
          </Alert>

          {confirmDialog.type === "single" && (
            <>
              <Typography variant="body1" gutterBottom>
                You are about to deploy to:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CloudUpload color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={confirmDialog.targetName}
                    secondary="Build and deploy to this target"
                  />
                </ListItem>
              </List>
            </>
          )}

          {confirmDialog.type === "selected" && (
            <>
              <Typography variant="body1" gutterBottom>
                You are about to deploy to {selectedTargets.length} target(s):
              </Typography>
              <List dense>
                {getSelectedTargetNames().map((name) => (
                  <ListItem key={name}>
                    <ListItemIcon>
                      <CloudUpload color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={name} secondary="Build and deploy" />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {confirmDialog.type === "all" && (
            <>
              <Typography variant="body1" gutterBottom>
                You are about to deploy to all {targets.length} configured targets:
              </Typography>
              <List dense>
                {targets.map((target) => (
                  <ListItem key={target.id}>
                    <ListItemIcon>
                      <CloudUpload color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={target.name}
                      secondary={target.resource || "Build and deploy"}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
            <Typography variant="body2">
              Deployments will run in sequence. You can monitor progress in the History tab.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeConfirmDialog} disabled={deploying}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDeploy}
            disabled={deploying}
            startIcon={<Rocket />}
          >
            {deploying ? "Starting..." : "Start Deployment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
