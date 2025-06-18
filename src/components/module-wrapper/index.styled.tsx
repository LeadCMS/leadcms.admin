import { CircularProgress, styled } from "@mui/material";

export const ActionsContainer = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ModuleNameContainer = styled("div")`
  font-weight: 600;
  font-size: 1.5rem;
  margin-right: 16px;
`;

export const ActionsRight = styled("div")`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

export const LeftContainer = styled("div")`
  display: flex;
  align-items: center;
`;

export const RightContainer = styled("div")`
  display: flex;
  align-items: center;
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

export const FixedActionBar = styled("div")`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 260px; /* Match the sidebar width */
  background: ${({ theme }) => theme.palette.background.paper};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    left: 0;
    justify-content: center;
  }

  .sidebar-hidden & {
    left: 0;
  }
`;

export const LoadingIndicatorContainer = styled("div")`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.palette.grey[300]};
  opacity: 0.2;
  z-index: 98;
`;

export const CenteredCircularProgress = styled(CircularProgress)`
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;
`;

export const SavingIndicatorContainer = styled("div")``;
