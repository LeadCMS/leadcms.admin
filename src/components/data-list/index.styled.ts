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

export const ContactsTableContainer = styled(Paper)`
  flex-grow: 1;
`;

export const ContactNameListItem = styled(ListItem)({
  alignItems: "center",
  disablePadding: true,
});

export const ContactNameListItemText = styled(ListItemText)({
  ".MuiListItemText-primary": {
    fontSize: "14px",
    fontWeight: 500,
  },
  ".MuiListItemText-secondary": {
    fontSize: "13px",
  },
});

export const ContactRowGrid = styled(Grid)({
  height: 60,
  alignItems: "center",
});

export const ContactCardHeader = styled(CardHeader)({
  paddingLeft: 0,
});

export const DataListContainer = styled("div")`
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};

  .MuiDataGrid-root {
    width: 100%;
    box-sizing: border-box;
  }

  .MuiDataGrid-columnHeaders {
  }

  .MuiDataGrid-columnHeadersInner {
  }

  .MuiDataGrid-footerContainer {
    width: 100%;
  }
`;
