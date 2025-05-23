import { ListItem, styled } from "@mui/material";
import ListItemText from "@mui/material/ListItemText";

export const UserNameListItem = styled(ListItem)(({ theme }) => ({
  alignItems: "center",
  paddingLeft: 0,
  paddingRight: 0,
  borderRadius: theme.shape.borderRadius,
  transition: "background 0.2s",
  "&:hover": {
    background: theme.palette.action.hover,
  },
}));

export const UserNameListItemText = styled(ListItemText)`
  margin-left: 0.75rem;
  .MuiListItemText-primary {
    font-size: ${({ theme }) => theme.typography.body1.fontSize};
    font-weight: 600;
  }
  .MuiListItemText-secondary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;
