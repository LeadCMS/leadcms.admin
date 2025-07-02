import { styled } from "@mui/material";

export const DataTableContainer = styled("div")`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 400px;

  .MuiDataGrid-root {
    border: none;
    width: 100%;
  }

  .MuiDataGrid-cell {
    outline: none !important;
  }

  .MuiDataGrid-columnHeaders {
    justify-content: space-between;
    width: 100%;
  }

  .MuiCheckbox-root {
    padding: 2px;
  }
  .MuiCheckbox-root .MuiSvgIcon-root {
    font-size: 16px;
  }
`;

export const ActionButtonContainer = styled("div")`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
`;
