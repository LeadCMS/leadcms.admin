import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";

export const GenericViewDeleteContainer = styled("div")`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const ViewListItemText = styled(ListItemText)`
  .MuiListItemText-primary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    font-weight: 500;
  }
  .MuiListItemText-secondary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  }
`;

export const StyledDivider = styled(Divider)`
  margin-bottom: ${({ theme }) => theme.spacing(7)};
`;
