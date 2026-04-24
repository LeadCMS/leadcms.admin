import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";

export const ViewListItemText = styled(ListItemText)`
  .MuiListItemText-primary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    font-weight: 500;
  }
  .MuiListItemText-secondary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  }
`;

export const ViewRowGrid = styled(Grid)({
  minHeight: 60,
  alignItems: "center",
});

export const CardContainer = styled(Card)`
  height: 100%;
  position: relative;
`;
