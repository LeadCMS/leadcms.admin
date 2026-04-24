import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Skeleton from "@mui/material/Skeleton";
import InputAdornment from "@mui/material/InputAdornment";
import Grid from "@mui/material/Grid";
import {
  Play,
  RefreshCw,
  Clock,
  CheckCircle,
  X,
  MoreVertical,
  Search,
  CalendarDays,
  Database,
  Mail,
  Trash2,
  Languages,
  TrendingUp,
  Building2,
  Globe,
  Images,
  ToggleLeft,
  ToggleRight,
  FileText,
  ChartColumnIncreasing,
} from "lucide-react";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { parseApiError, showApiError } from "@utils/api-error-parser";
import { AlertCircle } from "lucide-react";
import type { TaskDetailsDto, TaskExecutionLogDetailsDto } from "lib/network/swagger-client";
import { getTaskMetadata, getTaskCategory, describeCron, formatDuration } from "../utils";
import { getCategoryColor } from "../utils";
import type { TaskCategory } from "../types";

const categoryIcons: Record<TaskCategory, React.ReactNode> = {
  "data-sync": <Database />,
  maintenance: <Building2 />,
  reporting: <FileText />,
  enrichment: <ChartColumnIncreasing />,
  email: <Mail />,
  cleanup: <Trash2 />,
  other: <Languages />,
};

const taskIcons: Record<string, React.ReactNode> = {
  MediaMetaUpdateTask: <Images />,
};

export const TasksList = () => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskDetailsDto[]>([]);
  const [executionLogs, setExecutionLogs] = useState<TaskExecutionLogDetailsDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState(0);
  const [executingTask, setExecutingTask] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuTask, setSelectedMenuTask] = useState<string>("");
  const [taskNameFilter, setTaskNameFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "start" | "stop" | "execute";
    taskName: string;
  }>({ open: false, action: "start", taskName: "" });

  useEffect(() => {
    loadTasks();
    loadExecutionLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await client.api.tasksList();
      setTasks(response.data || []);
    } catch (error) {
      const apiError = parseApiError(error, "Failed to load tasks");
      setLoadError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExecutionLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await client.api.tasksLogsList();
      setExecutionLogs(response.data || []);
    } catch (error) {
      const apiError = parseApiError(error, "Failed to load execution logs");
      if (!loadError) setLoadError(apiError.message);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleEnableTask = async (taskName: string) => {
    try {
      setConfirmDialog({ open: false, action: "start", taskName: "" });
      await client.api.tasksStartDetail(taskName);
      await loadTasks();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to enable task");
    }
  };

  const handleDisableTask = async (taskName: string) => {
    try {
      setConfirmDialog({ open: false, action: "stop", taskName: "" });
      await client.api.tasksStopDetail(taskName);
      await loadTasks();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to disable task");
    }
  };

  const handleExecuteTask = async (taskName: string) => {
    try {
      setConfirmDialog({ open: false, action: "execute", taskName: "" });
      setExecutingTask(taskName);
      await client.api.tasksExecuteDetail(taskName);
      setExecutingTask(null);
      // Refresh logs after execution
      await loadExecutionLogs();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to execute task");
      setExecutingTask(null);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Refresh logs when switching to execution history tab
    if (newValue === 1) {
      loadExecutionLogs();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskName: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedMenuTask(taskName);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMenuTask("");
  };

  const handleViewLogs = () => {
    setActiveTab(1);
    setTaskNameFilter(selectedMenuTask);
    handleMenuClose();
  };

  const filteredTasks = [...tasks]
    .filter((task) => {
      const metadata = getTaskMetadata(task.name || "");
      const matchesSearch =
        task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        metadata?.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        metadata?.description.toLowerCase().includes(searchQuery.toLowerCase());

      const category = getTaskCategory(task.name || "");
      const matchesCategory = categoryFilter === "all" || category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "running" && task.isRunning) ||
        (statusFilter === "stopped" && !task.isRunning);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => Number(Boolean(b.isRunning)) - Number(Boolean(a.isRunning)));

  const filteredLogs = executionLogs.filter((log) => {
    const metadata = getTaskMetadata(log.taskName || "");
    const matchesSearch =
      log.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metadata?.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTaskName = taskNameFilter === "all" || log.taskName === taskNameFilter;
    return matchesSearch && matchesTaskName;
  });

  const runningCount = tasks.filter((t) => t.isRunning).length;
  const stoppedCount = tasks.filter((t) => !t.isRunning).length;
  const recentSuccessCount = executionLogs.filter(
    (l) => l.status?.toLowerCase() === "success" || l.status?.toLowerCase() === "completed"
  ).length;
  const recentPendingCount = executionLogs.filter(
    (l) => l.status?.toLowerCase() === "pending"
  ).length;

  if (loading) {
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
            Error loading tasks
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
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Tasks
              </Typography>
              <Typography variant="h4">{tasks.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Scheduled background jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Running
              </Typography>
              <Typography variant="h4" color="success.main">
                {runningCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active scheduled tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Disabled
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stoppedCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Paused or disabled tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Recent Executions
              </Typography>
              <Typography variant="h4">
                <Box component="span" sx={{ color: "success.main" }}>
                  {recentSuccessCount}
                </Box>
                <Box component="span" sx={{ color: "text.secondary", mx: 1 }}>
                  /
                </Box>
                <Box component="span" sx={{ color: "warning.main" }}>
                  {recentPendingCount}
                </Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed / Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Filters */}
      <Paper sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Tasks" />
            <Tab label="Execution History" />
          </Tabs>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              size="small"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery("")} aria-label="Clear">
                      <X fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ minWidth: 200 }}
            />
            {activeTab === 0 && (
              <>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="data-sync">Data Sync</MenuItem>
                    <MenuItem value="enrichment">Enrichment</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="reporting">Reporting</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="cleanup">Cleanup</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="running">Enabled</MenuItem>
                    <MenuItem value="stopped">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {activeTab === 1 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Task Name</InputLabel>
                <Select
                  value={taskNameFilter}
                  label="Task Name"
                  onChange={(e) => setTaskNameFilter(e.target.value)}
                >
                  <MenuItem value="all">All Tasks</MenuItem>
                  {tasks.map((task) => {
                    const metadata = getTaskMetadata(task.name || "");
                    return (
                      <MenuItem key={task.name} value={task.name}>
                        {metadata?.displayName || task.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Tasks Table */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Retry</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => {
                const taskName = task.name || "";
                const metadata = getTaskMetadata(taskName);
                const category = getTaskCategory(taskName);
                const isExecuting = executingTask === task.name;
                const taskIcon = taskIcons[taskName] || categoryIcons[category];

                return (
                  <TableRow key={task.name}>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {taskIcon}
                          <Typography variant="body2" fontWeight={500}>
                            {metadata?.displayName || task.name}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {metadata?.description || task.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getCategoryColor(category) as "default" | "primary" | "secondary"}
                        icon={categoryIcons[category] as React.ReactElement}
                        label={category.replace("-", " ")}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Clock fontSize="small" color="action" />
                        <Typography variant="body2">
                          {describeCron(task.cronSchedule || "")}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={`${task.retryCount} retries with ${task.retryInterval}s interval`}
                      >
                        <Typography variant="body2">
                          {task.retryCount}x / {task.retryInterval}s
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {task.isRunning ? (
                        <Chip
                          size="small"
                          color="success"
                          icon={<CheckCircle />}
                          label="Enabled"
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="default"
                          icon={<X />}
                          label="Disabled"
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Tooltip title="Execute now">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                action: "execute",
                                taskName: task.name || "",
                              })
                            }
                            disabled={isExecuting}
                          >
                            <Play fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {task.isRunning ? (
                          <Tooltip title="Disable task">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  action: "stop",
                                  taskName: task.name || "",
                                })
                              }
                            >
                              <ToggleRight fontSize="small" color="success.main" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Enable task">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  action: "start",
                                  taskName: task.name || "",
                                })
                              }
                            >
                              <ToggleLeft fontSize="small" color="action.disabled" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, task.name || "")}
                        >
                          <MoreVertical fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Execution History Table */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Triggered By</TableCell>
                <TableCell>Result</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Skeleton variant="rectangular" height={200} />
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No execution logs found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const metadata = getTaskMetadata(log.taskName || "");

                  const statusLower = log.status?.toLowerCase() || "";
                  const isSuccess = statusLower === "success" || statusLower === "completed";
                  const isFailed = statusLower === "failed" || statusLower === "error";
                  const isRunning = statusLower === "running" || statusLower === "inprogress";
                  const isPending = statusLower === "pending";

                  // Check if actualExecutionTime is a valid date (not default 0001-01-01)
                  const actualTime = log.actualExecutionTime
                    ? new Date(log.actualExecutionTime)
                    : null;
                  const isValidActualTime = actualTime && actualTime.getFullYear() > 1900;

                  const startTime = isValidActualTime
                    ? log.actualExecutionTime
                    : log.scheduledExecutionTime;

                  // Use duration from API if it has a meaningful value, otherwise calculate
                  const hasDuration =
                    log.duration?.totalMilliseconds && log.duration.totalMilliseconds > 0;

                  let duration: { totalMilliseconds?: number } | number | null = null;

                  if (hasDuration && log.duration) {
                    duration = log.duration;
                  } else if (log.scheduledExecutionTime && log.actualExecutionTime) {
                    const scheduledTime = new Date(log.scheduledExecutionTime);
                    const actualTimeCalc = new Date(log.actualExecutionTime);

                    if (scheduledTime.getFullYear() > 1900 && actualTimeCalc.getFullYear() > 1900) {
                      duration = Math.abs(scheduledTime.getTime() - actualTimeCalc.getTime());
                    }
                  }

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {metadata?.displayName || log.taskName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {isSuccess && (
                          <Chip
                            size="small"
                            color="success"
                            icon={<CheckCircle />}
                            label="Success"
                          />
                        )}
                        {isFailed && (
                          <Chip
                            size="small"
                            color="error"
                            icon={<X />}
                            label="Failed"
                          />
                        )}
                        {isRunning && (
                          <Chip
                            size="small"
                            color="info"
                            icon={<RefreshCw />}
                            label="Running"
                          />
                        )}
                        {isPending && (
                          <Chip
                            size="small"
                            color="warning"
                            icon={<Clock />}
                            label="Pending"
                          />
                        )}
                        {!isSuccess && !isFailed && !isRunning && !isPending && (
                          <Chip size="small" variant="outlined" label={log.status || "Unknown"} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {startTime ? new Date(startTime).toLocaleString() : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDuration(duration)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          icon={
                            log.triggeredBy === "Scheduled" ? (
                              <CalendarDays />
                            ) : (
                              <Play />
                            )
                          }
                          label={log.triggeredBy === "Scheduled" ? "Schedule" : "Manual"}
                        />
                      </TableCell>
                      <TableCell>
                        {log.result ? (
                          <Tooltip title={log.result}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {log.result}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleViewLogs}>
          <FileText fontSize="small" style={{ marginRight: 8 }} />
          View Logs
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      >
        <DialogTitle>
          {confirmDialog.action === "start" && "Enable Task"}
          {confirmDialog.action === "stop" && "Disable Task"}
          {confirmDialog.action === "execute" && "Execute Task"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === "start" && (
              <>
                Are you sure you want to enable the scheduled execution of{" "}
                <strong>
                  {getTaskMetadata(confirmDialog.taskName)?.displayName || confirmDialog.taskName}
                </strong>
                ?
              </>
            )}
            {confirmDialog.action === "stop" && (
              <>
                Are you sure you want to disable the scheduled execution of{" "}
                <strong>
                  {getTaskMetadata(confirmDialog.taskName)?.displayName || confirmDialog.taskName}
                </strong>
                ? The task will not run on its schedule until enabled again.
              </>
            )}
            {confirmDialog.action === "execute" && (
              <>
                Are you sure you want to execute{" "}
                <strong>
                  {getTaskMetadata(confirmDialog.taskName)?.displayName || confirmDialog.taskName}
                </strong>{" "}
                immediately? This will run the task outside of its normal schedule.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.action === "start") {
                handleEnableTask(confirmDialog.taskName);
              } else if (confirmDialog.action === "stop") {
                handleDisableTask(confirmDialog.taskName);
              } else {
                handleExecuteTask(confirmDialog.taskName);
              }
            }}
            color={confirmDialog.action === "stop" ? "error" : "primary"}
            variant="contained"
          >
            {confirmDialog.action === "start" && "Enable Task"}
            {confirmDialog.action === "stop" && "Disable Task"}
            {confirmDialog.action === "execute" && "Execute Now"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
