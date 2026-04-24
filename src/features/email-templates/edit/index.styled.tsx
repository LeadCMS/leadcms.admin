import { styled } from "@mui/material/styles";

export const EmailTemplateEditContainer = styled("div")`
  flex-grow: 1;
  width: 100%;
  height: 100%;
  max-width: 100%;
  min-height: calc(100vh - 144px);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  padding: 0;
`;

export const EmailTemplateDeleteContainer = styled("div")`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;
