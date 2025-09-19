import { styled, Theme } from "@mui/material";
import { StyledProps } from "types";
import { TabularGrid } from "./index";
import * as GSB from "@utils/general-style-builder";

// ["minmax(34%,max-content)","repeat(3,minmax(22%,max-content))"],

const selectedCornerRadius = "18px";
const serviceTagSingleEdgeCornerRadius = "12px";
const selectedTabBtnPsdElmBsize = "28px";

const TabularGridContainer = styled(TabularGrid)<StyledProps>`
  &.tabular-segment {
    ${GSB.OverwriteDefaults(false)}
    font-family: ${({ theme }) => theme.typography.fontFamily};
  }

  &.product-stack-segment {
    ${GSB.DPflex("row", "center", "center", "max-content", "100%")}
    grid-column: 1/3;
    overflow: hidden;
    align-self: center;

    .tab-grid {
      ${GSB.DPgrid(["max-content", "auto"], ["auto"], "100%")}
      padding: 15px 15px 18px 16px;
      margin: 25px 0px;
      width: 100%;
      border-radius: 26px;
      max-width: calc(${({ theme }) => theme.mediaQueryPoints.tablet} + 33px);

      .table-name {
        display: none;
      }

      .tab-controller {
        ${GSB.DPflex("row", "center", "space-between", "48px", "100%")}
        grid-area: 1/1/2/5;
        justify-self: center;
        margin-bottom: 20px;
        background: ${({ theme }) => theme.palette.customSegments.TabularGridContainer.default};
        border-radius: 8px;
        padding: 5px 7px;

        .tab-controller-btns {
          ${GSB.DPflex("row", "center", "space-between", "100%", "100%")}

          .tab {
            ${GSB.DPflex("row", "center", "center", "100%", "100%")}
            font-size: 14px;
            font-family: inherit !important;
            padding: 5px 35px 5px 20px;
            text-align: center;
            min-width: max-content;
            border: none;
            ${GSB.HoverOver("pointer", "350ms", "ease-out", "ease-in")}
            position: relative;
            z-index: 2;

            &:hover {
              background: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.primaryHover};
              border-radius: 5px;
              font-weight: 500;
            }

            &:first-child {
              border-top-left-radius: 5px;
              border-bottom-left-radius: 5px;
            }

            &:last-child {
              border-top-right-radius: 5px;
              border-bottom-right-radius: 5px;
            }
          }

          .tab.active {
            background: ${({ theme }) => theme.palette.background.default};
            transition: 350ms ease-in-out;
            border-radius: 5px;
            font-weight: 500;
          }
        }
      }

      .tab-content {
        border-radius: 10px;
        grid-area: 2/1/3/5;
        background: ${({ theme }) => theme.palette.background.default};
        ${GSB.BoxShadow(
          "1px",
          "1px",
          "5px",
          "1px",
          (theme) => theme.palette.customSegments.TabularGridContainer.primaryHover
        )}
        padding: 25px 25px 25px 18px;

        .tab-title {
          grid-area: 1/1/2/3;
          transform: translateY(-10px);
        }

        .tab-descrp {
          grid-area: 2/1/3/3;
          transform: translateY(-5px);
          text-indent: 15px;
        }
      }

      .status-tab-expand {
        ${GSB.DPgrid(["repeat(2,50%)"], ["repeat(2,auto)"], "100%")}
        width: 100%;

        .progress-tile-container {
          grid-area: 3/1/4/3;
        }

        .detail-container {
          ${GSB.DPgrid(["repeat(2,50%)"], ["repeat(2,auto)"], "100%", "100%", "10px")}
          grid-area: 4/1/5/3;

          .service {
            ${GSB.DPgrid(
              ["50px", "repeat(2,auto)"],
              ["repeat(2,auto)"],
              "100%",
              "calc(100% - 10px)"
            )}
            padding: 15px 15px 12px;
            border-radius: 5px;
            background: ${({ theme }) => theme.palette.info.contrastText};
            ${GSB.BoxShadow(
              "1px",
              "1px",
              "5px",
              "1px",
              (theme) => theme.palette.customSegments.TabularGridContainer.primaryHover
            )}

            &:nth-child(odd) {
              justify-self: flex-end;
            }

            &:first-child {
              border-top-left-radius: ${serviceTagSingleEdgeCornerRadius};
            }

            &:nth-child(2) {
              border-top-right-radius: ${serviceTagSingleEdgeCornerRadius};
            }

            &:nth-last-child(2) {
              border-bottom-left-radius: ${serviceTagSingleEdgeCornerRadius};
            }

            &:last-child {
              border-bottom-right-radius: ${serviceTagSingleEdgeCornerRadius};
            }

            .service-icon {
              ${GSB.DPflex("row", "center", "center", "40px", "40px")}
              padding: 7px;
              border-radius: 50%;
              grid-area: 1/1/3/3;
              color: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.captionText};
              align-self: center;

              svg {
                ${GSB.DPblock("inline-block", "max-content", "32px")}
              }
            }

            .srvc_0_progress,
            .srvc_10_progress,
            .srvc_35_progress {
              color: ${({ theme }) => theme.palette.customAlerts.danger.defaultText};
              background: ${({ theme }) => theme.palette.customAlerts.danger.light};
            }

            .srvc_65_progress {
              color: ${({ theme }) => theme.palette.customAlerts.attention.defaultText};
              background: ${({ theme }) => theme.palette.customAlerts.attention.light};
            }

            .srvc_85_progress {
              color: ${({ theme }) => theme.palette.customAlerts.complete.defaultText};
              background: ${({ theme }) => theme.palette.customAlerts.complete.light};
            }

            .details {
              ${GSB.DPflex("column", "flex-start", "flex-start", "100%", "100%")}
              grid-area: 1/2/3/4;

              .name {
                font-size: 16px;
                font-weight: 600;
                padding: 0px 5px 2px;
                color: ${({ theme }) =>
                  theme.palette.customSegments.TabularGridContainer.captionText};
              }

              .descrp {
                font-size: 16px;
                color: ${({ theme }) =>
                  theme.palette.customSegments.TabularGridContainer.foreground};
                text-indent: 3px;
              }
            }
          }
        }
      }

      .database-tab-expand,
      .deployement-tab-expand {
        ${GSB.DPgrid(["repeat(2,50%)"], ["repeat(2,auto)"], "100%")}
        width: 100%;

        .list {
          ${GSB.DPgrid(["repeat(2,50%)"], ["repeat(2,auto)"], "100%", "100%", "10px")}
          grid-area: 4/1/5/3;

          .database-meta-info,
          .deployement-meta-info {
            ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "max-content")}
            margin-left: 15px;
            border-radius: 10px;
            overflow: hidden;

            span {
              padding: 6px 16px 3px;
              color: ${({ theme }) => theme.palette.customSegments.TabularGridContainer.secondary};
            }

            strong {
              padding: 3px 16px 12px;
              color: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.contrastText};
              font-weight: 500;
            }

            &:first-child,
            &:nth-child(2) {
              margin-top: 10px;
            }
          }
        }

        .development-terminal-container {
          ${GSB.DPflex("column-reverse", "flex-start", "flex-start", "max-content", "100%")}
          grid-area: 5/1/6/3;
          padding: 12px;
          justify-self: center;
          align-self: center;
          margin: 15px 0px 0px 3px;
          border-radius: 8px;
          background: ${({ theme }) => theme.palette.customSegments.TabularGridContainer.default};
          ${GSB.BoxShadow(
            "1px",
            "1px",
            "3px",
            "1px",
            (theme) => theme.palette.customSegments.CardContainer.primaryHover
          )}

          .sub-title {
            ${GSB.DPblock("inline-block", "max-content", "max-content")}
            max-width: calc(${({ theme }) => theme.mediaQueryPoints.tablet} - 100px);
            text-indent: 30px;
            padding: 8px 15px;
            font-size: 12px;
            color: ${({ theme }) => theme.palette.customSegments.TabularGridContainer.secondary};
          }
        }
      }
    }
  }
`;

export { TabularGridContainer };
