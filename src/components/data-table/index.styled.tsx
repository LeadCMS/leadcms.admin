import styled from "@emotion/styled";
import { Paper } from "@mui/material";

export const DataTableContainer = styled(Paper)`
  flex-grow: 1;

  && .MuiDataGrid-columnHeaders {
    --DataGrid-t-header-background-base: #f8faff;
  }

  && .MuiDataGrid-columnHeader {
    color: #71717a;
  }

  && .MuiDataGrid-row:hover {
    background-color: #fafcff;
  }
`;

export const ActionButtonContainer = styled("div")`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  height: 100%;
`;
