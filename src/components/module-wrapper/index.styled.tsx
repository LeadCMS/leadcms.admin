import { CircularProgress, styled } from "@mui/material";

export const ActionsContainer = styled("div")`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

export const LeftContainer = styled("div")`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(0)};
`;

export const RightContainer = styled("div")`
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  flex: 1 1 0%;
  justify-content: flex-end;
  max-width: 100%;
  margin-left: ${({ theme }) => theme.spacing(0)};
  padding-left: ${({ theme }) => theme.spacing(0)};
`;

export const ExtraActionsContainer = styled("div")`
  display: flex;
  flex-flow: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const AddButtonContainer = styled("div")`
  margin-left: ${({ theme }) => theme.spacing(5)};
`;

export const ModuleContentContainer = styled("div")`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 500px; /* Increased to ensure proper centering */
`;

export const ScrollContainer = styled("div")`
  overflow-y: auto;
  flex: 1;
  padding-bottom: 40px;
`;

export const FormContainer = styled("div")`
  margin: 0 auto;
  width: 100%;
`;

export const FixedActionBar = styled("div", {
  shouldForwardProp: (prop) => prop !== "sidebarCollapsed",
})<{ sidebarCollapsed?: boolean }>(
  ({ theme, sidebarCollapsed }) => `
  position: fixed;
  bottom: 0;
  right: 0;
  left: ${sidebarCollapsed ? "65px" : "260px"};
  background: ${theme.palette.background.paper};
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing(3)};
  padding: ${theme.spacing(3)};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
  transition: left 0.3s ease;
  @media (max-width: ${theme.breakpoints.values.md}px) {
    left: 0;
    justify-content: center;
  }

  .sidebar-hidden & {
    left: 0;
  }
`
);

export const LoadingIndicatorContainer = styled("div")`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.palette.grey[300]};
  opacity: 0.2;
  z-index: 998; /* Higher z-index to ensure proper layering */
  min-height: calc(100vh - 144px);
`;

export const CenteredCircularProgress = styled(CircularProgress)`
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999; /* Higher z-index to ensure it's on top */
  color: ${({ theme }) => theme.palette.primary.main};

  /* Ensure consistent size and visibility */
  &.MuiCircularProgress-root {
    width: 40px !important;
    height: 40px !important;
    pointer-events: none; /* Ensure no interaction conflicts */
  }

  /* Ensure it's always visible on top */
  &.MuiCircularProgress-svg {
    display: block;
  }
`;

export const SavingIndicatorContainer = styled("div")``;
