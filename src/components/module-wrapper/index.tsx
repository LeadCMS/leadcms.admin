import {
  ModuleContainer,
} from "@components/module";
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
  ScrollContainer,
} from "./index.styled";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { BreadcrumbLink } from "../../types";

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
  leftContainerChildren,
  extraActionsContainerChildren,
  addButtonContainerChildren,
  actionButtons,
  isForm = false,
  children,
}: ModuleWrapperProps) => {
  const { isBusy } = useModuleWrapperContext();

  return (
    <ModuleContainer>
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
