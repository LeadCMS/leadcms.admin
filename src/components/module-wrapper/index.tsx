import {
  ModuleContainer,
  ModuleHeaderContainer,
  ModuleHeaderSubtitleContainer,
} from "@components/module";
import { BreadCrumbNavigation } from "@components/breadcrumbs";
import { PropsWithChildren, ReactNode } from "react";
import {
  ActionsContainer,
  AddButtonContainer,
  CenteredCircularProgress,
  ExtraActionsContainer,
  FixedActionBar,
  FormContainer,
  LeftContainer,
  LoadingIndicatorContainer,
  ModuleContentContainer,
  RightContainer,
  SavingIndicatorContainer,
  ScrollContainer,
} from "./index.styled";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { BreadcrumbLink } from "../../types";
import { Grid } from "@mui/material";

export interface ModuleWrapperProps extends PropsWithChildren {
  key?: string;
  breadcrumbs: BreadcrumbLink[];
  currentBreadcrumb: string;
  leftContainerChildren?: ReactNode | undefined;
  extraActionsContainerChildren?: ReactNode | undefined;
  addButtonContainerChildren?: ReactNode | undefined;
  saveIndicatorElement?: ReactNode | undefined;
  actionButtons?: ReactNode | undefined;
  isForm?: boolean;
}

export const ModuleWrapper = ({
  breadcrumbs,
  currentBreadcrumb,
  leftContainerChildren,
  extraActionsContainerChildren,
  addButtonContainerChildren,
  saveIndicatorElement,
  actionButtons,
  isForm = false,
  children,
}: ModuleWrapperProps) => {
  const { isSaving, isBusy } = useModuleWrapperContext();

  return (
    <ModuleContainer>
      <ModuleHeaderContainer>
        <Grid container direction={"row"} justifyContent={"space-between"} sx={{ pt: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ModuleHeaderSubtitleContainer>
              <BreadCrumbNavigation
                links={breadcrumbs}
                current={currentBreadcrumb}
              ></BreadCrumbNavigation>
            </ModuleHeaderSubtitleContainer>
          </Grid>
          {isSaving && saveIndicatorElement && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <SavingIndicatorContainer>{saveIndicatorElement}</SavingIndicatorContainer>
            </Grid>
          )}
        </Grid>
      </ModuleHeaderContainer>
      {(leftContainerChildren || extraActionsContainerChildren || addButtonContainerChildren) && (
        <ActionsContainer>
          {leftContainerChildren && <LeftContainer>{leftContainerChildren}</LeftContainer>}
          {(extraActionsContainerChildren || addButtonContainerChildren) && (
            <RightContainer>
              {extraActionsContainerChildren && (
                <ExtraActionsContainer>{extraActionsContainerChildren}</ExtraActionsContainer>
              )}
              {addButtonContainerChildren && (
                <AddButtonContainer>{addButtonContainerChildren}</AddButtonContainer>
              )}
            </RightContainer>
          )}
        </ActionsContainer>
      )}
      <ModuleContentContainer>
        <ScrollContainer id="scrollTarget">
          {isForm ? <FormContainer>{children}</FormContainer> : children}
        </ScrollContainer>
        {actionButtons && (
          <FixedActionBar>
            {actionButtons}
          </FixedActionBar>
        )}
        {isBusy && (
          <>
            <LoadingIndicatorContainer />
            <CenteredCircularProgress />
          </>
        )}
      </ModuleContentContainer>
    </ModuleContainer>
  );
};
