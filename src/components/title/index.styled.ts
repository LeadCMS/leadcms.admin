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
    ${GSB.DPflex("row", "center", "center", "max-content", "100%")}

    .footer-panel {
      ${GSB.DPflex("row", "center", "space-between", "max-content", "90%")}
      min-width: max-content;
      font-size: 16px;
      margin-top: 50px;
      padding: 20px 25px;
      border-radius: 15px;
      background: ${({ theme }) => theme.palette.customSegments.TileContainer.primary};

      .context {
        ${GSB.DPblock()}

        svg {
          ${GSB.DPblock("inline-block", "12px", "12px")}
          transform: translateY(1px);
        }
      }

      .from {
        font-family: ${({ theme }) => theme.typography.fontFamily} !important;

        svg {
          ${GSB.DPblock("inline-block", "18px", "18px")}
          transform: translateY(3px);
        }
      }

      .sub-actions {
        ${GSB.DPflex("row", "center", "space-between", "max-content", "max-content")}

        .sub-act-btn {
          ${GSB.DPblock("inline-block", "max-content", "max-content")}
          border-radius: 3px;
          padding: 10px 15px;
          margin: 1px 2px;
          border: none;
          ${GSB.HoverOver("pointer", "250ms", "ease-out", "ease-in")}

          svg {
            ${GSB.DPblock("inline-block", "16px", "16px")}
            transform: translateY(2px);
          }
        }

        .sub-act-btn.support {
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;
          background: ${({ theme }) => theme.palette.customAlerts.normal.base};
          color: ${({ theme }) => theme.palette.customAlerts.normal.defaultText};

          &:hover {
            transform: scale(1.05);
            background: ${({ theme }) => theme.palette.customSegments.UserContainer.tertiary};
            color: ${({ theme }) => theme.palette.background.default};
            margin-right: 5px;
          }
        }

        .sub-act-btn.review {
          border-top-right-radius: 10px;
          border-bottom-right-radius: 10px;
          background: ${({ theme }) => theme.palette.customAlerts.normal.defaultText};
          color: ${({ theme }) => theme.palette.background.default};

          &:hover {
            transform: scale(1.05);
            background: ${({ theme }) => theme.palette.customSegments.UserContainer.contrastText};
            ${GSB.BoxShadow(
              "0px",
              "2px",
              "5px",
              "5px",
              (theme) => theme.palette.customSegments.CardContainer.default
            )}
            margin-left: 5px;
          }
        }
      }
    }
  }
`;

export { TitleContainer };
