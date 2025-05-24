"use client";
import { Suspense } from "react";
import { useRouteParams } from "typesafe-routes";
import { CoreModule, coreModuleRoute, defaultModuleRoute } from "lib/router";
import { ContentModule } from "features/content";
import { DashboardModule } from "features/dashboard";
import { ContactsModule } from "features/contacts/contacts-module";
import { AccountsModule } from "features/accounts/accounts-module";
import { OrdersModule } from "features/orders/orders-module";
import { DomainsModule } from "features/domains/domains-module";
import { LinksModule } from "@features/links";
import { ModuleWrapperProvider } from "@providers/module-wrapper-provider";
import { CommentsModule } from "@features/comments";
import { UnsubscribesModule } from "@features/unsubscribes";
import { UserModule } from "@features/users";
import { AboutModule } from "@features/about";
import { Navigate } from "react-router-dom";
import { EmailTemplatesModule } from "@features/email-templates";
import { ActivityLogModule } from "@features/activity-log";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBoundaryFallbackPage } from "@components/error-boundary-fallback-page";

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
          {moduleName === CoreModule.users && <UserModule />}
          {moduleName === CoreModule.about && <AboutModule />}
          {moduleName === CoreModule.emailTemplates && <EmailTemplatesModule />}
          {moduleName === CoreModule.activityLogs && <ActivityLogModule />}
          {moduleName === CoreModule.dashboard && <DashboardModule />}
          {!moduleName && <Navigate to={defaultModuleRoute} replace />}
        </Suspense>
      </ErrorBoundary>
    </ModuleWrapperProvider>
  );
};
