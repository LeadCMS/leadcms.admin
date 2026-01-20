"use client";
import { Suspense } from "react";
import { useRouteParams } from "typesafe-routes";
import { CoreModule, coreModuleRoute, defaultModuleRoute } from "lib/router";
import { ModuleWrapperProvider } from "@providers/module-wrapper-provider";
import { Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallbackPage } from "@components/error-boundary-fallback-page";
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
