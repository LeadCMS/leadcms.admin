import CardHeader from "@mui/material/CardHeader";
import { styled } from "@mui/material/styles";

export const DeleteButtonContainer = styled("div")`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const CardHeaderStyled = styled(CardHeader)({
  paddingLeft: 0,
});
