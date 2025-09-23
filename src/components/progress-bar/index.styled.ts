import { styled } from "@mui/material";
import { StyledProps } from "types";
import { Progress } from "./index";
import * as GSB from "@utils/general-style-builder";

const ProgressBar = styled(Progress)<StyledProps>`

  &.progress-tile-container {
    ${GSB.DPflex("column", "center", "center", "max-content", "100%")}
    padding: 5px 0px 25px;
    margin: 2px;

    .progress-container {
      ${GSB.DPgrid(["repeat(2,auto)"], ["repeat(2,auto)"], "100%", "95%", "15px")}
        border-radius: 8px;
        padding: 15px 0px 25px;
        justify-self: center;
        align-self: center;
      }

      .progress-label {
        ${GSB.DPflex("row", "center", "space-between", "max-content", "100%")}
        padding: 0px 0px 20px;
        grid-area: 1/1/3/3;
        
        .label {
          color: ${({ theme }) => theme.palette.customSegments.ProgressContainer["85"].background};
          font-size: 16px;
          font-weight: 500;
        }
        
        .value {
          font-size: 16px;
          font-weight: 500;
        }
      }

      .progress-bar {
        ${GSB.DPflex("row", "center", "space-between", "12px", "100%")}
        color: ${({ theme }) => theme.palette.customSegments.ProgressContainer["85"].background};
        border-radius: 20px;
        overflow: hidden;
        grid-area: 2/1/3/3;
        
        .percentage-rating {
          ${GSB.DPblock("inline-block", "100%", "auto")}
          border-radius: 20px;
          position: relative;
          z-index: 3;
        }

        .negated-rating {
          display: none;
        }
      }
    }
  }
`;

export { ProgressBar };
