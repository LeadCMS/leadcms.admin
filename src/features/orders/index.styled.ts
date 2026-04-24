import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";

export const CardContainer = styled(Card)`
  margin-left: ${({ theme }) => theme.spacing(20)};
  margin-right: ${({ theme }) => theme.spacing(20)};
`;
