import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import ListItemText from "@mui/material/ListItemText";

export const UserNameListItem = styled(ListItem)({
  alignItems: "center",
  paddingLeft: "0",
  disablePadding: true,
});

export const UserNameListItemText = styled(ListItemText)`
  .MuiListItemText-primary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    font-weight: 500;
  }
  .MuiListItemText-secondary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  }
`;
