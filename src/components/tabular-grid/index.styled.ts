import { styled, Theme } from "@mui/material";
import { StyledProps } from "types";
import { TabularGrid } from "./index";
import * as GSB from "@utils/general-style-builder";

// ["minmax(34%,max-content)","repeat(3,minmax(22%,max-content))"],

const selectedCornerRadius = "18px";
const serviceTagSingleEdgeCornerRadius = "12px";
const selectedTabBtnPsdElmBsize = "28px";

const getTabBtnInversePsdCorner = (
  size: string,
  color: string,
  position: string,
  zIDX: number,
  top?: string,
  left?: string,
  bottom?: string,
  right?: string,
  trfTrnslt?: string
) => `
  transition: 350ms ease-in;
  content: "";
  width: ${size};
  height: ${size};
  position: absolute;
  z-index: ${zIDX};
  ${top ? `top: ${top};` : ""}
  ${left ? `left: ${left};` : ""}
  ${bottom ? `bottom: ${bottom};` : ""}
  ${right ? `right: ${right};` : ""}
  ${trfTrnslt ? `transform: ${trfTrnslt};` : ""}
  background: radial-gradient(
    ${position}, 
    transparent 0px, 
    transparent ${size}, 
    ${color} ${size}
  );
`;

const getTabBtnInversePsdCornerWithTHEME =
  (
    size: string,
    getColor: (theme: Theme) => string,
    position: string,
    zIDX: number,
    top?: string,
    left?: string,
    bottom?: string,
    right?: string,
    trfTrnslt?: string
  ) =>
  ({ theme }: { theme: Theme }) => {
    const color = getColor(theme);

    return getTabBtnInversePsdCorner(
      size,
      color,
      position,
      zIDX,
      top,
      left,
      bottom,
      right,
      trfTrnslt
    );
  };

const getPsdElms =
  (getColor: string | ((theme: Theme) => string), dropPsdAFTER?: boolean) =>
  ({ theme }: { theme: Theme }) => {
    const color = typeof getColor === "function" ? getColor(theme) : getColor;
    const psdBEFORE = getTabBtnInversePsdCorner(
      `${selectedTabBtnPsdElmBsize}`,
      color,
      "circle at top left",
      4,
      undefined,
      "0%",
      "0%",
      undefined,
      "translate(-100%,0%)"
    );
    const psdAFTER = !dropPsdAFTER
      ? getTabBtnInversePsdCorner(
          `${selectedTabBtnPsdElmBsize}`,
          color,
          "circle at top right",
          5,
          "0%",
          undefined,
          undefined,
          "0%",
          "translate(0%,0%)"
        )
      : "";

    //temp 'false' for the condition
    return `
    &::before {
      ${psdBEFORE}
    }
  `;

    return `
    &::before {
      ${psdBEFORE}
    }
    
    ${
      !dropPsdAFTER
        ? `&::after {
      ${psdAFTER}
    }`
        : ""
    }
  `;
  };

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
      background: ${({ theme }) => theme.palette.customSegments.CardContainer.primary};
      border-radius: 26px;
      max-width: calc(${({ theme }) => theme.mediaQueryPoints.tablet} + 33px);

      h2 {
        ${GSB.DPblock("inline-block", "max-content", "100%")}
        padding: 0px 2px 2px 12px;
        grid-area: 1/1/3/2;
        color: ${({ theme }) => theme.palette.primary.main};
      }

      .tab-controller {
        ${GSB.DPflex("row", "center", "flex-end", "48px", "max-content")}
        grid-area: 1/2/2/5;
        justify-self: flex-end;
        transform: translateX(-2px);

        .tab-controller-btns {
          ${GSB.DPflex("row", "center", "space-between", "100%", "90%")}
          justify-self: flex-end;
          padding-left: 28px;
          overflow: hidden;
          border-top-right-radius: ${selectedCornerRadius};
          border-top-left-radius: ${selectedCornerRadius};

          .tab {
            ${GSB.DPflex("row", "center", "center", "100%", "calc(100% - 2px)")}
            font-size: 14px;
            font-family: inherit !important;
            text-transform: uppercase;
            letter-spacing: 2px;
            padding: 5px 35px 5px 20px;
            text-align: center;
            min-width: max-content;
            border: none;
            border-top-left-radius: ${selectedCornerRadius};
            background: ${({ theme }) =>
              theme.palette.customSegments.TabularGridContainer.secondaryAlt};
            ${GSB.HoverOver("pointer", "350ms", "ease-out", "ease-in")}
            transform: translateX(-15px);
            position: relative;
            z-index: 2;

            &:hover {
              background: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.secondaryHoverAlt};
              font-weight: 500;

              &::before,
              &::after {
                transition: 1000ms ease-in;
              }

              ${getPsdElms(
                (theme) => theme.palette.customSegments.TabularGridContainer.secondaryHoverAlt
              )}
            }

            &:first-child {
              border-top-left-radius: ${selectedCornerRadius};
              background: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.primaryAlt};
              transform: translateX(-0px);
              z-index: 1;

              &:hover {
                background: ${({ theme }) =>
                  theme.palette.customSegments.TabularGridContainer.primaryHoverAlt};

                ${getPsdElms(
                  (theme) => theme.palette.customSegments.TabularGridContainer.primaryHoverAlt
                )}
              }
            }

            &:last-child {
              border-top-right-radius: ${selectedCornerRadius};
              background: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.tertiaryAlt};
              padding: 5px 32px 5px 20px;
              transform: translateX(-35px);
              z-index: 3;

              &:hover {
                background: ${({ theme }) =>
                  theme.palette.customSegments.TabularGridContainer.tertiaryHoverAlt};

                ${getPsdElms(
                  (theme) => theme.palette.customSegments.TabularGridContainer.tertiaryHoverAlt,
                  true
                )}
              }
            }
          }

          .tab.active {
            transition: 350ms ease-in-out;
            border-top-left-radius: ${selectedCornerRadius};
            font-weight: 500;

            &:before {
              ${getTabBtnInversePsdCornerWithTHEME(
                `${selectedTabBtnPsdElmBsize}`,
                (theme) => theme.palette.customSegments.TabularGridContainer.secondaryAlt,
                "circle at top left",
                5,
                undefined,
                "0%",
                "0%",
                undefined,
                "translate(-100%,0%)"
              )}
            }

            &:hover {
              &:before {
                ${getTabBtnInversePsdCornerWithTHEME(
                  `${selectedTabBtnPsdElmBsize}`,
                  (theme) => theme.palette.customSegments.TabularGridContainer.secondaryHoverAlt,
                  "circle at top left",
                  5,
                  undefined,
                  "0%",
                  "0%",
                  undefined,
                  "translate(-100%,0%)"
                )}
              }
            }

            &:first-child {
              background: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.primaryAlt};

              ${getPsdElms((theme) => theme.palette.customSegments.TabularGridContainer.primaryAlt)}

              &:hover {
                background: ${({ theme }) =>
                  theme.palette.customSegments.TabularGridContainer.primaryHoverAlt};

                ${getPsdElms(
                  (theme) => theme.palette.customSegments.TabularGridContainer.primaryHoverAlt
                )}
              }
            }

            &:last-child {
              background: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.tertiaryAlt};

              ${getPsdElms(
                (theme) => theme.palette.customSegments.TabularGridContainer.tertiaryAlt
              )}

              &:hover {
                background: ${({ theme }) =>
                  theme.palette.customSegments.TabularGridContainer.tertiaryHoverAlt};

                ${getPsdElms(
                  (theme) => theme.palette.customSegments.TabularGridContainer.tertiaryHoverAlt,
                  true
                )}
              }
            }
          }

          .tab.pre-neighbour > &:after {
            ${getTabBtnInversePsdCornerWithTHEME(
              `${selectedCornerRadius}`,
              (theme) => theme.palette.customSegments.TabularGridContainer.primaryAlt,
              "circle at top right",
              5,
              "0%",
              undefined,
              undefined,
              "0%",
              "translate(0%,0%)"
            )}
          }

          .tab.post-neighbour.psd-after-effects {
            border-bottom-left-radius: ${selectedCornerRadius};
            border-top-left-radius: 0%;

            &:hover {
              border-bottom-left-radius: 0px;
            }

            &:after {
              ${getTabBtnInversePsdCornerWithTHEME(
                `calc(${selectedCornerRadius} + 2px)`,
                (theme) => theme.palette.customSegments.TabularGridContainer.secondaryAlt,
                "circle at bottom left",
                5,
                undefined,
                "-14%",
                undefined,
                "0%",
                "translate(0%,-70%)"
              )}
            }
          }

          .tab.last.post-neighbour.psd-after-effects {
            border-top-left-radius: 0%;

            &:after {
              ${getTabBtnInversePsdCornerWithTHEME(
                `calc(${selectedCornerRadius} + 2px)`,
                (theme) => theme.palette.customSegments.TabularGridContainer.tertiaryAlt,
                "circle at bottom left",
                5,
                undefined,
                "-11.5%",
                undefined,
                "0%",
                "translate(0%,-65%)"
              )}
            }
          }
        }
      }

      .tab-content {
        grid-area: 2/1/3/5;
        border-radius: 16px;
        border-top-right-radius: 0px;
        max-width: ${({ theme }) => theme.mediaQueryPoints.tablet};
      }

      .status-tab-expand {
        ${GSB.DPgrid(["repeat(2,50%)"], ["repeat(2,auto)"], "100%")}
        padding: 25px 25px 25px 18px;
        width: 100%;
        background: ${({ theme }) => theme.palette.customSegments.TabularGridContainer.primaryAlt};

        .progress-tile-container {
          grid-area: 1/1/2/3;
        }

        .detail-container {
          ${GSB.DPgrid(["repeat(2,50%)"], ["repeat(2,auto)"], "100%", "100%", "10px")}
          grid-area: 2/1/3/3;

          .service {
            ${GSB.DPgrid(["repeat(3,auto)"], ["repeat(3,auto)"], "100%", "calc(100% - 10px)")}
            padding: 15px;
            border-radius: 5px;
            background: ${({ theme }) => theme.palette.customSegments.TabularGridContainer.default};
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

            svg {
              ${GSB.DPblock("inline-block", "max-content", "36px")}
              grid-area: 1/1/3/3;
              color: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.captionText};
            }

            .details {
              ${GSB.DPflex("column", "center", "flex-start", "100%", "100%")}
              grid-area: 1/1/4/4;

              .name {
                ${GSB.DPflex("row", "flex-start", "flex-end", "100%", "100%")}
                font-size: 22px;
                font-weight: 600;
                padding: 0px 5px 5px;
                color: ${({ theme }) =>
                  theme.palette.customSegments.TabularGridContainer.captionText};
              }

              .descrp {
                font-size: 16px;
                color: ${({ theme }) =>
                  theme.palette.customSegments.TabularGridContainer.foreground};
              }
            }
          }
        }
      }

      .database-tab-expand {
        ${GSB.DPflex("row", "flex-start", "flex-end", "100%", "100%")}
        padding: 25px 25px 15px 18px;
        background: ${({ theme }) =>
          theme.palette.customSegments.TabularGridContainer.secondaryAlt};

        .list {
          ${GSB.DPflex("row", "flex-start", "flex-start", "100%", "100%")}
          flex-wrap: wrap;

          .database-meta-info {
            ${GSB.DPflex("row", "flex-start", "flex-start", "max-content", "max-content")}
            margin: 5px 5px 15px;
            border-radius: 10px;
            overflow: hidden;

            span {
              padding: 12px 16px;
              background: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.primaryAlt};
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            strong {
              padding: 12px 16px;
              color: ${({ theme }) => theme.palette.customSegments.GridContainer.contrastText};
              background: ${({ theme }) =>
                theme.palette.customSegments.TabularGridContainer.defaultAlt};
            }
          }
        }
      }

      .deployement-tab-expand {
        ${GSB.DPgrid(["35%", "65%"], ["repeat(2,auto)"], "100%", "100%")}
        padding: 25px 25px 20px 25px;
        background: ${({ theme }) => theme.palette.customSegments.TabularGridContainer.tertiaryAlt};

        .list {
          ${GSB.DPflex("row", "flex-start", "flex-start", "100%", "100%")}
          flex-wrap: wrap;

          p {
            ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "100%")}
            margin-bottom: 5px;

            strong {
              ${GSB.DPblock("inline-block", "max-content", "100%")}
              text-indent: 20px;
            }
          }
        }

        .development-terminal-container {
          grid-area: 1/2/2/3;

          .sub-title {
            text-indent: 30px;
            padding-bottom: 15px;
          }
        }
      }
    }
  }
`;

export { TabularGridContainer };
