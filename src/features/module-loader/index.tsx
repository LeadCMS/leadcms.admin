"use client";
import { lazy, Suspense } from "react";
import { useRouteParams } from "typesafe-routes";
import { CoreModule, coreModuleRoute, defaultModuleRoute } from "lib/router";
import { ModuleWrapperProvider } from "@providers/module-wrapper-provider";
import { Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallbackPage } from "@components/error-boundary-fallback-page";

const ContentModule = lazy(() =>
  import("features/content").then((m) => ({ default: m.ContentModule }))
);
const DashboardModule = lazy(() =>
  import("features/dashboard").then((m) => ({ default: m.DashboardModule }))
);
const ContactsModule = lazy(() =>
  import("features/contacts/contacts-module").then((m) => ({ default: m.ContactsModule }))
);
const AccountsModule = lazy(() =>
  import("features/accounts/accounts-module").then((m) => ({ default: m.AccountsModule }))
);
const OrdersModule = lazy(() =>
  import("features/orders/orders-module").then((m) => ({ default: m.OrdersModule }))
);
const DomainsModule = lazy(() =>
  import("features/domains/domains-module").then((m) => ({ default: m.DomainsModule }))
);
const LinksModule = lazy(() => import("@features/links").then((m) => ({ default: m.LinksModule })));
const CommentsModule = lazy(() =>
  import("@features/comments").then((m) => ({ default: m.CommentsModule }))
);
const UnsubscribesModule = lazy(() =>
  import("@features/unsubscribes").then((m) => ({ default: m.UnsubscribesModule }))
);
const UserModule = lazy(() => import("@features/users").then((m) => ({ default: m.UserModule })));
const AboutModule = lazy(() => import("@features/about").then((m) => ({ default: m.AboutModule })));
const SegmentsModule = lazy(() =>
  import("@features/segments/segments-module").then((m) => ({ default: m.SegmentsModule }))
);
const EmailTemplatesModule = lazy(() =>
  import("@features/email-templates").then((m) => ({ default: m.EmailTemplatesModule }))
);
const ActivityLogModule = lazy(() =>
  import("@features/activity-log").then((m) => ({ default: m.ActivityLogModule }))
);
const MediaModule = lazy(() => import("@features/media/media-module"));
const SettingsModule = lazy(() =>
  import("@features/settings/settings-module").then((m) => ({ default: m.SettingsModule }))
);
const TasksModule = lazy(() => import("@features/tasks").then((m) => ({ default: m.TasksModule })));
const DeploymentsModule = lazy(() =>
  import("@features/deployments").then((m) => ({ default: m.DeploymentsModule }))
);
const CampaignsModule = lazy(() =>
  import("@features/campaigns/campaigns-module").then((m) => ({ default: m.CampaignsModule }))
);
const SequencesModule = lazy(() =>
  import("@features/sequences/sequences-module").then((m) => ({ default: m.SequencesModule }))
);

export const ModuleLoader = () => {
  const { moduleName } = useRouteParams(coreModuleRoute);

  return (
    <ModuleWrapperProvider>
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallbackPage} resetKeys={[moduleName]}>
        <Suspense fallback="Loading...">
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
