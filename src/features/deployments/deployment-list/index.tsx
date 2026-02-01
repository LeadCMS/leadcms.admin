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
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import type { DeploymentRecordDto, DeploymentStatsDto, DeploymentTargetDto } from "../types";
import {
  formatDuration,
  formatDate,
  getStatusColor,
  getStatusLabel,
  getProviderDisplayName,
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
  const [deploying, setDeploying] = useState(false);

  const [deployments, setDeployments] = useState<DeploymentRecordDto[]>([]);
  const [stats, setStats] = useState<DeploymentStatsDto | null>(null);
  const [targets, setTargets] = useState<DeploymentTargetDto[]>([]);

  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

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
      const response = await client.api.deploymentsList({ limit: DEPLOYMENT_HISTORY_LIMIT });
      setDeployments(response.data || []);
    } catch (error) {
      console.error("Failed to load deployments:", error);
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
      console.error("Failed to load deployment stats:", error);
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
      console.error("Failed to load deployment targets:", error);
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

  const handleDeploySelected = async () => {
    if (selectedTargets.length === 0) return;

    const deployPromise = async () => {
      setDeploying(true);
      try {
        const result = await client.api.deploymentsTriggerCreate({
          targetIds: selectedTargets,
          triggerAll: false,
        });
        setSelectedTargets([]);
        await loadDeployments();
        await loadStats();
        return result;
      } finally {
        setDeploying(false);
      }
    };

    await notificationsService.promise(deployPromise(), {
      pending: "Triggering deployment...",
      success: "Deployment triggered successfully",
      error: (error) => {
        const errMessage = "Failed to trigger deployment";
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
  };

  const handleDeployAll = async () => {
    const deployPromise = async () => {
      setDeploying(true);
      try {
        const result = await client.api.deploymentsTriggerCreate({
          targetIds: null,
          triggerAll: true,
        });
        setSelectedTargets([]);
        await loadDeployments();
        await loadStats();
        return result;
      } finally {
        setDeploying(false);
      }
    };

    await notificationsService.promise(deployPromise(), {
      pending: "Triggering all deployments...",
      success: "All deployments triggered successfully",
      error: (error) => {
        const errMessage = "Failed to trigger deployments";
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
            Manage and monitor your deployment pipelines
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
                    All time deployments
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
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    In Progress
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {statsLoading ? <Skeleton width={60} /> : inProgressCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pendingCount} pending
                  </Typography>
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
            <Tab label="Trigger Deployment" />
            <Tab label="Deployment History" />
            <Tab label="Targets" />
          </Tabs>
        </Box>
      </Paper>

      {/* Trigger Deployment Tab */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Deployments to Trigger
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose one or more deployment targets to execute
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
              <Typography color="text.secondary">No deployment targets configured</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {targets.map((target) => {
                  const isSelected = selectedTargets.includes(target.id || "");
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
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: "50%",
                              bgcolor: isSelected ? "primary.main" : "grey.200",
                              color: isSelected ? "white" : "text.secondary",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CloudUpload fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {target.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {getProviderDisplayName(target.provider)}
                              {target.resource && ` • ${target.resource}`}
                            </Typography>
                          </Box>
                        </Box>
                        {target.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            {target.description}
                          </Typography>
                        )}
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
            <Typography variant="h6">Recent Deployments</Typography>
            <Typography variant="body2" color="text.secondary">
              View the history of all deployments
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
                      <Typography color="text.secondary">No deployments found</Typography>
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
                        <Typography variant="body2" color="text.secondary">
                          {deployment.resource || "-"}
                        </Typography>
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
                        <Typography variant="body2">{formatDate(deployment.startedAt)}</Typography>
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
            <Typography variant="h6">Deployment Targets</Typography>
            <Typography variant="body2" color="text.secondary">
              Configured deployment pipeline targets
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
                      <Typography color="text.secondary">No targets configured</Typography>
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
    </Box>
  );
};
