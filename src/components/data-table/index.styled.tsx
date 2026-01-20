import styled from "@emotion/styled";
import Paper from "@mui/material/Paper";

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

  .MuiCheckbox-root .MuiSvgIcon-root {
    font-size: 20px;
    color: #71717a;
  }

  .MuiCheckbox-root.Mui-checked .MuiSvgIcon-root {
    color: #3878ff;
  }

  .MuiDataGrid-columnHeader .MuiCheckbox-root.Mui-checked .MuiSvgIcon-root,
  .MuiDataGrid-columnHeader .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiSvgIcon-root {
    color: #3878ff !important;
  }
`;

export const ActionButtonContainer = styled("div")`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  height: 100%;
`;
