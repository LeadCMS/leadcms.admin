"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CoreModule, defaultModuleRoute, ModuleRouteParams } from "lib/router";
import { ModuleWrapperProvider } from "@providers/module-wrapper-provider";
import { Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallbackPage } from "@components/error-boundary-fallback-page";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Fade from "@mui/material/Fade";
import { ContentModule } from "@features/content/lazy";
import { DashboardModule } from "@features/dashboard/lazy";
import { ContactsModule } from "@features/contacts/lazy";
import { AccountsModule } from "@features/accounts/lazy";
import { OrdersModule } from "@features/orders/lazy";
import { DomainsModule } from "@features/domains/lazy";
import { LinksModule } from "@features/links/lazy";
import { CommentsModule } from "@features/comments/lazy";
import { UnsubscribesModule } from "@features/unsubscribes/lazy";
import { UserModule } from "@features/users/lazy";
import { AboutModule } from "@features/about/lazy";
import { SegmentsModule } from "@features/segments/lazy";
import { EmailTemplatesModule } from "@features/email-templates/lazy";
import { ActivityLogModule } from "@features/activity-log/lazy";
import { MediaModule } from "@features/media/lazy";
import { SettingsModule } from "@features/settings/lazy";
import { TasksModule } from "@features/tasks";
import { DeploymentsModule } from "@features/deployments";
import { CampaignsModule } from "@features/campaigns/campaigns-module";
import { SequencesModule } from "@features/sequences/sequences-module";

const ModuleLoadingFallback = () => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Prevent flash on very fast transitions.
    const timer = window.setTimeout(() => setShowLoader(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        position: "relative",
      }}
    >
      <Fade in={showLoader} timeout={180}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            pointerEvents: "none",
          }}
        >
          <LinearProgress />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              px: 2,
              pt: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export const ModuleLoader = () => {
  const { moduleName } = useParams<ModuleRouteParams>();

  return (
    <ModuleWrapperProvider>
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallbackPage} resetKeys={[moduleName]}>
        <Suspense fallback={<ModuleLoadingFallback />}>
          {moduleName === CoreModule.content && <ContentModule />}
          {moduleName === CoreModule.contacts && <ContactsModule />}
          {moduleName === CoreModule.unsubscribes && <UnsubscribesModule />}
          {moduleName === CoreModule.links && <LinksModule />}
          {moduleName === CoreModule.comments && <CommentsModule />}
          {moduleName === CoreModule.accounts && <AccountsModule />}
          {moduleName === CoreModule.orders && <OrdersModule />}
          {moduleName === CoreModule.domains && <DomainsModule />}
          {moduleName === CoreModule.segments && <SegmentsModule />}
          {moduleName === CoreModule.users && <UserModule />}
          {moduleName === CoreModule.about && <AboutModule />}
          {moduleName === CoreModule.emailTemplates && <EmailTemplatesModule />}
          {moduleName === CoreModule.activityLogs && <ActivityLogModule />}
          {moduleName === CoreModule.dashboard && <DashboardModule />}
          {moduleName === CoreModule.media && <MediaModule />}
          {moduleName === CoreModule.settings && <SettingsModule />}
          {moduleName === CoreModule.tasks && <TasksModule />}
          {moduleName === CoreModule.deployments && <DeploymentsModule />}
          {moduleName === CoreModule.campaigns && <CampaignsModule />}
          {moduleName === CoreModule.sequences && <SequencesModule />}
          {!moduleName && <Navigate to={defaultModuleRoute} replace />}
        </Suspense>
      </ErrorBoundary>
    </ModuleWrapperProvider>
  );
};
