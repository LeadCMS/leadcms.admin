import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import {
  ArrowLeft,
  Play,
  RefreshCw,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Loader,
  Terminal,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import type { DeploymentDetailsDto, DeploymentStepDto } from "../types";
import { formatDuration, formatDate, getStatusColor, getStatusLabel } from "../utils";

const getStepIcon = (status: string | undefined) => {
  switch (status) {
    case "Completed":
      return <CheckCircle color="success" />;
    case "Failed":
      return <AlertCircle color="error" />;
    case "InProgress":
      return <Clock color="info" />;
    case "Pending":
      return <Loader color="warning" />;
    case "Cancelled":
      return <X color="disabled" />;
    default:
      return <Clock />;
  }
};

const isHttpUrl = (value: string | null | undefined) =>
  Boolean(value && (value.startsWith("http://") || value.startsWith("https://")));

export const DeploymentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { client } = useRequestContext();
  const navigate = useNavigate();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();

  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [deployment, setDeployment] = useState<DeploymentDetailsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDeployment = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await client.api.deploymentsDetail(id);
      setDeployment(response.data || null);
    } catch (err) {
      console.error("Failed to load deployment:", err);
      setError("Failed to load deployment details");
    } finally {
      setLoading(false);
    }
  }, [client.api, id]);

  useEffect(() => {
    loadDeployment();
  }, [loadDeployment]);

  const handleRetry = async () => {
    if (!deployment?.targetId) return;

    const retryPromise = async () => {
      setRetrying(true);
      try {
        await client.api.deploymentsTriggerCreate({
          targetIds: [deployment.targetId as string],
          triggerAll: false,
        });
        await loadDeployment();
      } finally {
        setRetrying(false);
      }
    };

    await notificationsService.promise(retryPromise(), {
      pending: "Retrying deployment...",
      success: "Deployment retry triggered",
      error: (err) => {
        const errMessage = "Failed to retry deployment";
        const errDetails: string[] = [];
        const errorWithMessage = err as { message?: string } | undefined;
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

  const handleBack = () => {
    navigate("/deployments?tab=1");
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton width={200} height={32} />
            <Skeleton width={150} height={20} />
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !deployment) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <AlertCircle fontSize="large" color="error" style={{ marginBottom: 2 }} />
          <Typography variant="h6" gutterBottom>
            {error || "Deployment not found"}
          </Typography>
          <Button variant="contained" startIcon={<ArrowLeft />} onClick={handleBack} sx={{ mt: 2 }}>
            Back to Deployments
          </Button>
        </Paper>
      </Box>
    );
  }

  const steps = deployment.steps || [];
  const logs = deployment.logs || [];
  const activeStepIndex = steps.findIndex(
    (step) => step.status === "InProgress" || step.status === "Pending"
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={handleBack}>
            <ArrowLeft />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {deployment.targetName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Deployment Details
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw />}
            onClick={loadDeployment}
            disabled={loading}
          >
            Refresh
          </Button>
          {deployment.status === "Failed" && (
            <Button
              variant="contained"
              startIcon={<Play />}
              onClick={handleRetry}
              disabled={retrying}
            >
              Retry
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Status
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Chip
            label={getStatusLabel(deployment.status)}
            color={getStatusColor(deployment.status)}
            icon={
              deployment.status === "Completed" ? (
                <CheckCircle />
              ) : deployment.status === "Failed" ? (
                <AlertCircle />
              ) : deployment.status === "InProgress" ? (
                <Clock />
              ) : deployment.status === "Pending" ? (
                <Loader />
              ) : (
                <X />
              )
            }
            sx={{ fontSize: "1rem", py: 2.5, px: 1 }}
          />
        </Box>

        {deployment.errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={500}>
              Error: {deployment.errorMessage}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Deployment Id
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {deployment.id || "-"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Target Id
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {deployment.targetId || "-"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Target
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {deployment.targetName}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Resource
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {isHttpUrl(deployment.resource) ? (
                <Link
                  href={deployment.resource || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  {deployment.resource}
                </Link>
              ) : (
                deployment.resource || "-"
              )}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Duration
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDuration(deployment.duration)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Started At
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(deployment.startedAt)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Completed At
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(deployment.completedAt)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Triggered By
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {deployment.triggeredByName || "System"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Steps Timeline */}
      {steps.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Deployment Steps
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Progress through the deployment pipeline
          </Typography>

          <Stepper
            orientation="vertical"
            activeStep={activeStepIndex >= 0 ? activeStepIndex : steps.length}
          >
            {steps.map((step: DeploymentStepDto, index: number) => (
              <Step key={index} completed={step.status === "Completed"} expanded>
                <StepLabel
                  icon={getStepIcon(step.status)}
                  error={step.status === "Failed"}
                  optional={
                    <Typography variant="caption" color="text.secondary">
                      {step.startedAt && formatDate(step.startedAt)}
                      {step.duration && ` • ${formatDuration(step.duration)}`}
                    </Typography>
                  }
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1" fontWeight={500}>
                      {step.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={getStatusLabel(step.status)}
                      color={getStatusColor(step.status)}
                    />
                  </Box>
                </StepLabel>
                <StepContent>
                  <Box sx={{ py: 1 }}>
                    {step.completedAt && (
                      <Typography variant="body2" color="text.secondary">
                        Completed: {formatDate(step.completedAt)}
                      </Typography>
                    )}
                    {(step.url || step.logsUrl) && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          mt: 1,
                        }}
                      >
                        {step.url && (
                          <Link
                            href={step.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                          >
                            Open Step
                          </Link>
                        )}
                        {step.logsUrl && (
                          <Link
                            href={step.logsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                          >
                            View Logs
                          </Link>
                        )}
                      </Box>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Terminal />
            <Typography variant="h6">Deployment Logs</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Detailed logs from the deployment process
          </Typography>

          <Box
            sx={{
              bgcolor: "grey.900",
              color: "grey.100",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {logs.map((log, index) => (
              <Box key={index} sx={{ py: 0.5 }}>
                <Typography
                  component="span"
                  sx={{ fontFamily: "inherit", fontSize: "inherit", whiteSpace: "pre-wrap" }}
                >
                  {log}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};
