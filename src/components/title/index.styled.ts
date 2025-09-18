import { styled } from "@mui/material";
import { StyledProps } from "types";
import { Title } from "./index";
import * as GSB from "@utils/general-style-builder";

const TitleContainer = styled(Title)<StyledProps>`
  &.title-bar {
    ${GSB.DPflex("row", "center", "flex-start", "max-content", "100%")}
    color: ${({ theme }) => theme.palette.customSegments.TitleContainer.primary};
  }

  &.footer-title-bar {
    ${GSB.DPflex("row", "center", "center", "20px", "100%")}
    font-size: 14px;
    margin-top: 50px;

    span {
      ${GSB.DPblock()}

      svg {
        ${GSB.DPblock("inline-block", "12px", "12px")}
        transform: translateY(1px);
      }
    }
  }
`;

export { TitleContainer };
