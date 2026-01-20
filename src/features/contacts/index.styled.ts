import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

export const ActionsContainer = styled("div")`
  display: flex;
  justify-content: space-between;
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
  margin-left: ${({ theme }) => theme.spacing(10)};
`;

export const CardContainer = styled(Card)`
  margin-left: ${({ theme }) => theme.spacing(20)};
  margin-right: ${({ theme }) => theme.spacing(20)};
`;

export const ContactsTableContainer = styled(Paper)`
  flex-grow: 1;
`;

export const ContactNameListItem = styled(ListItem)({
  alignItems: "center",
  paddingLeft: "0",
  disablePadding: true,
  height: "100%",
  display: "flex",
});

export const ContactNameListItemText = styled(ListItemText)`
  .MuiListItemText-primary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
    font-weight: 500;
    margin-bottom: 2px;
  }
  .MuiListItemText-secondary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  }
`;

export const ContactNameListItemTextLarge = styled(ListItemText)`
  .MuiListItemText-primary {
    font-size: ${({ theme }) => theme.typography.h5};
    font-weight: 500;
  }
  .MuiListItemText-secondary {
    font-size: ${({ theme }) => theme.typography.body2.fontSize};
  }
`;

export const ContactHref = styled("a")`
  text-decoration: none;
  color: inherit;
`;

export const ContactRowGrid = styled(Grid)({
  minHeight: 60,
  alignItems: "center",
});

export const ContactCardHeader = styled(CardHeader)({
  paddingLeft: 0,
});

export const CardWithTopMargin = styled(Card)({
  marginTop: 4,
});

export const ActionButtonContainer = styled("div")`
  display: flex;
  justify-content: flex-end;
`;

export const AvatarContainer = styled(Avatar)`
  width: ${({ theme }) => theme.spacing(20)};
  height: ${({ theme }) => theme.spacing(20)};
  margin-right: ${({ theme }) => theme.spacing(5)};
`;
