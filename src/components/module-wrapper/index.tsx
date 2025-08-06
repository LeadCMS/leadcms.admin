import { ModuleContainer } from "@components/module";
import { PropsWithChildren, ReactNode } from "react";
import {
  ActionsContainer,
  ModuleNameContainer,
  ActionsRight,
  AddButtonContainer,
  CenteredCircularProgress,
  ExtraActionsContainer,
  FixedActionBar,
  FormContainer,
  LeftContainer,
  LoadingIndicatorContainer,
  ModuleContentContainer,
  RightContainer,
  ScrollContainer,
} from "./index.styled";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { BreadcrumbLink } from "../../types";
import { getModuleNameFromUrl } from "utils/general-helper";

export interface ModuleWrapperProps extends PropsWithChildren {
  key?: string;
  breadcrumbs: BreadcrumbLink[];
  currentBreadcrumb: string;
  leftContainerChildren?: ReactNode | undefined;
  extraActionsContainerChildren?: ReactNode | undefined;
  addButtonContainerChildren?: ReactNode | undefined;
  actionButtons?: ReactNode | undefined;
  isForm?: boolean;
}

export const ModuleWrapper = ({
  leftContainerChildren,
  extraActionsContainerChildren,
  addButtonContainerChildren,
  actionButtons,
  isForm = false,
  children,
}: ModuleWrapperProps) => {
  const { isBusy } = useModuleWrapperContext();
  const moduleName = getModuleNameFromUrl();

  return (
    <ModuleContainer>
      {(leftContainerChildren || extraActionsContainerChildren || addButtonContainerChildren) && (
        <ActionsContainer>
        <ModuleNameContainer>{moduleName}</ModuleNameContainer>
          <ActionsRight>
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
         </ActionsRight>
        </ActionsContainer>
      )}
      <ModuleContentContainer>
        <ScrollContainer id="scrollTarget">
          {isForm ? <FormContainer>{children}</FormContainer> : children}
        </ScrollContainer>
        {actionButtons && <FixedActionBar>{actionButtons}</FixedActionBar>}
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
