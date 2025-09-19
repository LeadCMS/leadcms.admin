import { styled, Theme } from "@mui/material";
import { StyledProps } from "types";
import { Card, Container, CustomTerminal, User } from "./index";
import * as GSB from "@utils/general-style-builder";

const UserContainerUnhoveredRadius = "100px";

const MainContainer = styled(Container)<StyledProps>`
  ${GSB.OverwriteDefaults(false)}
  ${GSB.DPblock("block", "max-content", "100%")}

  &.about-section-container {
    ${GSB.DPflex("column", "center", "center", "max-content", "100%")}

    overflow: hidden;
    max-width: 100%;

    .title-bar {
    }

    .banner-container {
    }

    .alert-indicator {
    }

    .system-details-container {
    }

    .system-details-container.no-update-indicator {
    }

    .product-stack-segment {
    }

    .resources-title-bar {
    }

    .resources-container {
    }

    .contributors-title-bar {
    }

    .contributors-container {
    }

    .footer-title-bar {
    }

    @media (max-width: ${({ theme }) => theme.mediaQueryPoints.laptop}) {
      grid-template-columns: 100%;

      .banner-container {
        grid-area: 1/1/2/2;
      }

      .alert-container {
        grid-area: 2/1/3/2;
        justify-self: center;
        transform: translateX(0px);
        margin: 0%;
      }

      .system-details-container {
        grid-area: 3/1/4/3;
        margin: 20px 0px;
      }

      .product-stack-segment {
        grid-area: 4/1/6/2;
        transform: scale(0.85);
      }

      .resources-container {
        max-width: auto;
        margin-bottom: 36px;
      }
    }

    @media (max-width: ${({ theme }) => theme.mediaQueryPoints.desktop}) {
      .contributors-container {
        ${GSB.DPflex("column", "center", "center", "max-content", "100%")}
      }
    }

    @media (max-width: ${({ theme }) => theme.mediaQueryPoints.desktopXL}) {
      .system-details-container {
        flex-direction: column;

        .system-details-card {
          min-height: max-content;
          margin: 10px 2px;
        }

        &:first-child {
          margin-bottom: 5px;
        }

        &:last-child {
          margin-top: 5px;
        }
      }
    }

    @media (min-width: ${({ theme }) => theme.mediaQueryPoints.laptop}) {
      .contributors-container {
        ${GSB.DPflex("row", "center", "center", "max-content", "100%")}
      }
    }

    @media (min-width: ${({ theme }) => theme.mediaQueryPoints.desktop}) {
      .resources-title-bar,
      .contributors-title-bar {
        margin-left: 15%;
      }

      .resources-container {
        padding-left: 4%;
      }

      .contributors-container {
        max-width: ${({ theme }) => theme.mediaQueryPoints.desktop};
        justify-self: center;
        flex-wrap: wrap;
      }
    }

    @media (min-width: ${({ theme }) => theme.mediaQueryPoints.desktopXL}) {
      grid-template-columns: 40% 60%;

      .banner-container {
        width: 85%;
      }

      .system-details-card {
        transform: scale(0.95);
        min-height: 385px !important;
      }
    }
  }
`;

const SubContainer = styled(Container)<StyledProps>`
  &.banner-container {
    ${GSB.DPgrid(["1fr"], [""], "max-content", "100%")}
    grid-template-rows: max-content max-content;

    .logo-container {
      ${GSB.DPflex("column", "center", "flex-start", "max-content", "100%")}
      margin: 2px 1px;
      font-family: ${({ theme }) => theme.typography.fontFamily};

      img {
        max-width: 100px;
      }

      .brand-name {
        color: ${({ theme }) => theme.palette.text.primary};
        font-weight: 700;
        font-size: 30px;
      }

      .brand-moto {
        color: ${({ theme }) => theme.palette.text.disabled};
        font-size: 20px;
        font-weight: 400;
      }
    }

    .badge-container {
      ${GSB.DPflex("row", "center", "center", "max-content", "80%")}
      flex-wrap: wrap;
      justify-self: center;
      padding: 10px 5px;

      .badge {
        ${GSB.DPflex("row", "center", "center", "max-content", "max-content")}
        padding: 3px 12px;
        border-radius: 25px;
        margin: 10px 7px;
        letter-spacing: 0.8px;
        font-weight: 600;
        font-family: ${({ theme }) => theme.typography.fontFamily};
      }

      .banner-transparent-green {
        background: ${({ theme }) => theme.palette.customAlerts.complete.base};
        border: 1.5px solid ${({ theme }) => theme.palette.customAlerts.complete.defaultText};
        color: ${({ theme }) => theme.palette.customAlerts.complete.defaultText};
      }

      .banner-transparent-blue {
        background: ${({ theme }) => theme.palette.customAlerts.normal.base};
        border: 1.5px solid ${({ theme }) => theme.palette.customAlerts.normal.defaultText};
        color: ${({ theme }) => theme.palette.info.dark};
      }

      .banner-transparent-red {
        background: ${({ theme }) => theme.palette.customAlerts.danger.base};
        border: 1.5px solid ${({ theme }) => theme.palette.customAlerts.danger.defaultText};
        color: ${({ theme }) => theme.palette.customAlerts.danger.defaultText};
      }

      .banner-transparent-orange {
        background: ${({ theme }) => theme.palette.customAlerts.attention.base};
        border: 1.5px solid ${({ theme }) => theme.palette.customAlerts.attention.defaultText};
        color: ${({ theme }) => theme.palette.customAlerts.attention.defaultText};
      }
    }
  }

  &.alert-container {
    ${GSB.DPflex("column", "center", "center", "100%", "100%")}
    margin: 15px 0px;
    max-width: ${({ theme }) => theme.mediaQueryPoints.tablet};

    .alert-panel {
      ${GSB.DPflex("column", "center", "flex-start", "max-content", "95%")}
      padding: 10px 20px 10px 15px;
      background: none;
      min-width: calc(${({ theme }) => theme.mediaQueryPoints.mobileS} - 24px);
      color: ${({ theme }) => theme.palette.customAlerts.normal.captionText};

      .MuiAlert-icon {
        display: none;
      }

      .MuiAlert-message {
        ${GSB.DPblock("block", "max-content", "100%")}
        background: ${({ theme }) => theme.palette.customAlerts.normal.base};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.normal.dark};
        color: ${({ theme }) => theme.palette.info.dark} !important;
        border-radius: 8px;
        padding: 15px 40px 25px;

        .alert-title {
          ${GSB.DPblock("block", "max-content", "100%")}
          text-align: start;
          font-size: 14px;
          transform: translate(-25px, -5px);
          margin-bottom: 5px;
          font-weight: 400;

          svg {
            ${GSB.DPblock("inline-block", "18px", "18px")}
            transform: translateY(2px);
            margin-right: 8px;
            color: ${({ theme }) => theme.palette.text.secondary};
          }
        }
      }

      &.complete > .MuiAlert-message {
        background: ${({ theme }) => theme.palette.customAlerts.complete.base};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.complete.dark};
        color: ${({ theme }) => theme.palette.customAlerts.complete.defaultText} !important;
      }

      &.danger > .MuiAlert-message {
        background: ${({ theme }) => theme.palette.customAlerts.danger.base};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.danger.dark};
        color: ${({ theme }) => theme.palette.customAlerts.danger.defaultText} !important;
      }

      &.attention > .MuiAlert-message {
        background: ${({ theme }) => theme.palette.customAlerts.attention.base};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.attention.dark};
        color: ${({ theme }) => theme.palette.customAlerts.attention.defaultText} !important;
      }

      .terminal-container {
        ${GSB.BoxShadow(
          "1px",
          "1px",
          "3px",
          "1px",
          (theme) => theme.palette.customSegments.CardContainer.primaryHover
        )}
        background: ${({ theme }) =>
          theme.palette.customSegments.TabularGridContainer.captionText} !important;

        .directory,
        .directory > svg {
          color: ${({ theme }) =>
            theme.palette.customSegments.TabularGridContainer.primary} !important;
        }
      }
    }
  }

  &.system-details-container {
    ${GSB.DPflex("row", "center", "center", "max-content", "100%")}
    margin: 30px 0px;

    .system-details-card {
      min-height: 280px;
    }
  }

  &.resources-container {
    ${GSB.DPflex("row", "center", "center", "max-content", "100%")}
    max-width: calc(${({ theme }) => theme.mediaQueryPoints.tablet} - 200px);
    padding: 20px 0px 45px;
  }

  &.contributors-container {
    ${GSB.DPgrid(["repeat(1,80%)"], ["auto"], "max-content", "100%", "10px", "center", "center")}
    padding: 12px 14px;
  }
`;

const TileContainer = styled(Container)<StyledProps>`
  ${GSB.DPflex("column", "center", "center", "max-content", "100%")}

  &.resource-container {
    ${GSB.DPblock("inline-block", "75px", "75px")}
    min-height: 180px;
    min-width: 180px;
    background: ${({ theme }) => theme.palette.background.default};
    border-radius: 8px;
    ${GSB.HoverOver("pointer", "250ms", "ease-out", "ease-in")}
    margin: 0px 5px 5px;
    ${GSB.BoxShadow(
      "0.5px",
      "0.5px",
      "2px",
      "0.5px",
      (theme) => theme.palette.customSegments.CardContainer.primaryHover
    )}

    .resource-link {
      ${GSB.DPflex("column", "center", "center", "100%", "100%")}
      text-decoration: none;

      .icon {
        ${GSB.DPflex("column", "center", "center", "48px", "48px")}
        padding: 10px;
        border-radius: 50%;
        background: ${({ theme }) => theme.palette.customSegments.TileContainer.primaryHover};

        svg {
          ${GSB.DPblock("inline-block", "36px", "36px")}
          color: ${({ theme }) => theme.palette.customSegments.TitleContainer.primary};
        }
      }

      .domain {
        ${GSB.DPblock("block", "max-content", "100%")}
        text-align: center;
        text-decoration: none;
        margin-top: 10px;
        font-weight: 500;
        letter-spacing: 1px;
        font-family: ${({ theme }) => theme.typography.fontFamily};
        color: ${({ theme }) => theme.palette.customSegments.TitleContainer.secondary};
      }
    }

    &:hover {
      background: ${({ theme }) => theme.palette.customSegments.TileContainer.default};
    }
  }
`;

const GridContainer = styled(Container)<StyledProps>``;

const CardContainer = styled(Card)<StyledProps>`
  &.system-details-card {
    ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "100%")}
    padding: 15px 18px;
    min-width: calc(${({ theme }) => theme.mediaQueryPoints.mobileM} - 100px);
    max-width: calc(${({ theme }) => theme.mediaQueryPoints.tablet} - 200px);
    margin: 2px 1px;
    border-radius: 5px;
    ${GSB.BoxShadow(
      "1px",
      "1px",
      "5px",
      "1px",
      (theme) => theme.palette.customSegments.CardContainer.primaryHover
    )}
    ${GSB.HoverOver("pointer", "250ms", "ease-out", "ease-in")}

    &:hover {
      background: ${({ theme }) => theme.palette.customSegments.CardContainer.primaryalt};
      ${GSB.BoxShadow(
        "0px",
        "2px",
        "5px",
        "5px",
        (theme) => theme.palette.customSegments.CardContainer.default
      )}
    }

    .card-details {
      ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "100%")}
      min-width: 100%;

      .sums {
        ${GSB.DPblock("block", "max-content", "100%")}
        border-bottom: 1px solid ${({ theme }) =>
          theme.palette.customSegments.CardContainer.primaryHover};
        padding: 7px 10px;

        .sum {
          ${GSB.DPflex("row", "center", "space-between", "max-content", "100%")}

          font-family: ${({ theme }) => theme.typography.fontFamily};
          line-height: ${({ theme }) => theme.typography.subtitle1.lineHeight} !important;
          padding: 6px 0px;

          .label {
            color: ${({ theme }) => theme.palette.customSegments.CardContainer.secondaryHover};
            letter-spacing: 1px;
          }

          .value {
            color: ${({ theme }) => theme.palette.primary.dark};
          }
        }
      }
    }

    .card-header {
      ${GSB.DPgrid(["35%", "65%"], ["repeat(2,max-content)"], "max-content", "100%")}
      min-width: 100%;

      .title {
        grid-area: 1/1/2/2;
        font-size: 18px;
        font-weight: 400;
        color: ${({ theme }) => theme.palette.customSegments.CardContainer.captionText};
        font-family: ${({ theme }) => theme.typography.fontFamily};

        svg {
          margin-right: 5px;
          transform: translateY(1px);
          color: ${({ theme }) => theme.palette.primary.main};
        }
      }

      .descrp {
        grid-area: 2/1/3/3;
        ${GSB.DPblock("inline-block", "max-content", "100%")}
        margin-top: 5px;
        font-family: ${({ theme }) => theme.typography.fontFamily};
        color: ${({ theme }) => theme.palette.customSegments.CardContainer.secondaryHover};
        padding: 5px 10px;
        font-size: 16px;
      }

      .tags {
        ${GSB.DPflex("row", "center", "flex-end", "100%", "100%")}
        grid-area: 1/2/2/3;
        font-size: 12px;
        transform: treanslateX(1px);
        font-size: 12px;

        .tag {
          ${GSB.DPblock()}
          padding: 3px 10px;
          border-radius: 20px;
          margin-right: 5px;

          &:last-child {
            margin-right: 0%;
          }
        }

        .tag.primary {
          background: ${({ theme }) => theme.palette.info.main};
          color: ${({ theme }) => theme.palette.info.contrastText};
        }

        .tag.secondary {
          background: ${({ theme }) => theme.palette.customAlerts.normal.base};
          color: ${({ theme }) => theme.palette.primary.main};
          border: 0.5px solid ${({ theme }) => theme.palette.customAlerts.normal.captionText};
        }
      }
    }

    .card-body > .sums > .sum > .value {
      font-weight: 500;
    }

    .card-footer {
      .dependency-sums {
        border-bottom: none;
        padding: 7px;

        .sum {
          ${GSB.DPflex("row", "center", "space-between", "100%", "100%")}
          font-size: 14px;

          .label {
            color: ${({ theme }) => theme.palette.primary.dark};
          }

          .value {
            color: ${({ theme }) => theme.palette.customSegments.CardContainer.secondaryHover};
            font-family: monospace;
          }
        }
      }
    }
  }
`;

const TerminalContainer = styled(CustomTerminal)<StyledProps>`
  &.terminal-container {
    ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "100%")}
    padding: 8px 10px;
    margin: 8px 0px 2px;
    border-radius: 8px;
    background: ${({ theme }) => theme.palette.customSegments.TabularGridContainer.default};

    .directory {
      font-style: oblique;
      font-size: 16px;
      margin-bottom: 5px;
      transform: translateY(-5px);
      color: ${({ theme }) => theme.palette.terminal.black} !important;
      opacity: 90%;

      svg {
        transform: translateY(5px);
      }
    }

    .terminal-box {
      ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "100%")}
      background: ${({ theme }) => theme.palette.terminal.background};
      border-radius: 5px;
      overflow-y: scroll;
      max-height: 280px;
      padding: 5px;

      .comment,
      .command {
        ${GSB.DPblock("inline-block", "max-content", "100%")}
      }

      .comment {
        color: ${({ theme }) => theme.palette.terminal.cyan};
        text-indent: 7px;
        font-style: oblique;
        margin-bottom: 2px;
      }

      .command {
        color: ${({ theme }) => theme.palette.terminal.yellow};
        text-indent: 5px;
        margin-bottom: 2px;
      }

      .code-block {
        ${GSB.DPblock("inline-block", "max-content", "max-content")}
        padding-top: 5px;

        &:first-child {
          padding-top: 0%;
        }

        .command {
          margin-bottom: 5px;
        }
      }

      .preset {
        color: ${({ theme }) => theme.palette.terminal.green};
        text-indent: 5px;
        margin-bottom: 2px;
      }
    }
  }
`;

const UserContainer = styled(User)<StyledProps>`
  &.user-card {
    ${GSB.DPgrid(["auto"], ["repeat(3,max-content)"], "max-content", "320px")}
    max-width: 280px;
    position: relative;
    text-decoration: none;
    margin: 2px 10px 30px 10px;
    transform: translateY(25px);
    ${GSB.HoverOver("pointer", "250ms", "ease-out", "ease-in")}

    .card-top {
      ${GSB.DPflex("column", "center", "center", "100%", "100%")}
      z-index: 2;
      transition: 250ms ease-out;

      img {
        ${GSB.DPblock("auto", "80px")}
        border-radius: 50%;
        border: 2px solid ${({ theme }) => theme.palette.customSegments.UserContainer.default};
      }

      .userrole {
        grid-area: 1/3/2/6;
        color: ${({ theme }) => theme.palette.customSegments.TitleContainer.captionText};
        text-indent: 12px;
      }

      .username {
        grid-area: 1/3/3/6;
        color: ${({ theme }) => theme.palette.customSegments.TitleContainer.tertiary};
        text-indent: 14px;
        font-size: 18px;
        font-weight: 500;
        margin-top: 10px;
      }
    }

    .card-bottom,
    .card-top > .expander {
      display: none;
    }
  }
`;

export {
  MainContainer,
  SubContainer,
  TileContainer,
  GridContainer,
  TerminalContainer,
  CardContainer,
  UserContainer,
};
