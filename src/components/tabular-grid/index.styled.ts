import { styled } from "@mui/material";
import { LocalContainerProps } from "types";
import { TabularGrid } from "./index";

const TabularGridContainer = styled(TabularGrid)<LocalContainerProps>`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  height: max-content;
  width: 100%;

  &.grid-c {
    align-content: center;
    justify-items: center;
  }

  &.grid-e {
    align-content: flex-end;
    justify-items: flex-end;
  }

  &.grid-ac-jl {
    align-content: center;
    justify-items: flex-start;
  }

  &.grid-ac-jr {
    align-content: center;
    justify-items: flex-end;
  }
`;

export { TabularGridContainer };
