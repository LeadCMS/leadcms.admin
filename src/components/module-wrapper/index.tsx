import { ModuleContainer } from "@components/module";
import { PropsWithChildren, ReactNode } from "react";
import React from "react";
import {
  ActionsContainer,
  CenteredCircularProgress,
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
import { ResponsiveActions } from "@components/responsive-actions";

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
  const rightActions = [
    ...flattenChildren(extraActionsContainerChildren),
    addButtonContainerChildren,
  ].filter(React.isValidElement);

  return (
    <ModuleContainer>
      {(leftContainerChildren || extraActionsContainerChildren || addButtonContainerChildren) && (
        <ActionsContainer>
          {leftContainerChildren && <LeftContainer>{leftContainerChildren}</LeftContainer>}
          {(extraActionsContainerChildren || addButtonContainerChildren) && (
            <RightContainer>
              <ResponsiveActions actions={rightActions} gap={3} />
            </RightContainer>
          )}
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
            <CenteredCircularProgress size={40} thickness={4} />
          </>
        )}
      </ModuleContentContainer>
    </ModuleContainer>
  );
};

function flattenChildren(children: React.ReactNode): React.ReactElement[] {
  const result: React.ReactElement[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === React.Fragment) {
      result.push(...flattenChildren(child.props.children));
    } else if (React.isValidElement(child)) {
      result.push(child);
    }
  });
  return result;
}
