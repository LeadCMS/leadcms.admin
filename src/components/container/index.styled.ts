import { styled, Theme } from "@mui/material";
import { StyledProps } from "types";
import { Card, Container, Terminal, User } from "./index";
import * as GSB from "@utils/general-style-builder";

const UserContainerUnhoveredRadius = "100px";

const MainContainer = styled(Container)<StyledProps>`
  ${GSB.OverwriteDefaults(false)}
  ${GSB.DPblock("block", "max-content", "100%")}

  &.about-section-container {
    ${GSB.DPgrid(["35%", "65%"], ["auto"], "max-content", "100%", "10px")}
    grid-template-columns: minmax(320px, ${({ theme }) =>
      theme.mediaQueryPoints.laptop}) max-content;
    overflow: hidden;
    max-width: 100%;

    .title-bar {
      grid-column: 1/3;
    }

    .banner-container {
      grid-area: 1/2/2/3;
    }

    .alert-indicator {
      grid-area: 1/1/2/2;
    }

    .system-details-container {
      grid-area: 2/1/4/3;
    }

    .system-details-container.no-update-indicator {
      grid-area: 3/1/4/3;
    }

    .product-stack-segment {
      grid-area: 6/2/8/3;
    }

    .resources-title-bar {
      grid-area: 6/1/7/2;
    }

    .resources-container {
      grid-area: 7/1/8/2;
    }

    .contributors-title-bar {
      grid-area: 9/1/10/2;
    }

    .contributors-container {
      grid-area: 10/1/11/3;
    }

    .footer-title-bar {
      grid-row: 11/12;
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

      .resources-container {
        justify-self: flex-end;
      }

      .system-details-card {
        position: relative;

        &:first-child {
          z-index: 2;
          transform: translateX(45%);
          opacity: 60%;
        }

        &:nth-child(2) {
          z-index: 4;
          transform: scale(1.12);
        }

        &:last-child {
          z-index: 3;
          transform: translateX(-45%);
          opacity: 60%;
        }
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
      
      img {
        max-width: 300px;
      }
      
      .brand-name {
        color: ${({ theme }) => theme.palette.primary.main};
        font-weight: 700;
        font-size: 30px;
        font-family: "inter";
      }

      .brand-moto {
        color: ${({ theme }) => theme.palette.primary.dark};
        font-weight: 500;
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
        font-weight: 500;
      }
      
      .banner-transparent-green {
        background: ${({ theme }) => theme.palette.customAlerts.complete.dark};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.complete.captionText};
        color: ${({ theme }) => theme.palette.customAlerts.complete.dark};
        text-shadow: 1px 1px 0px ${({ theme }) => theme.palette.customAlerts.complete.dark};
      }
      
      .banner-transparent-blue {
        background: ${({ theme }) => theme.palette.customAlerts.normal.dark};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.normal.captionText};
        color: ${({ theme }) => theme.palette.customAlerts.normal.dark};
        text-shadow: 1px 1px 0px ${({ theme }) => theme.palette.customAlerts.normal.dark};
      }
      
      .banner-transparent-red {
        background: ${({ theme }) => theme.palette.customAlerts.danger.dark};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.danger.captionText};
        color: ${({ theme }) => theme.palette.customAlerts.danger.dark};
        text-shadow: 1px 1px 0px ${({ theme }) => theme.palette.customAlerts.danger.dark};
      }
      
      .banner-transparent-orange {
        background: ${({ theme }) => theme.palette.customAlerts.attention.dark};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.attention.captionText};
        color: ${({ theme }) => theme.palette.customAlerts.attention.dark};
        text-shadow: 1px 1px 0px ${({ theme }) => theme.palette.customAlerts.attention.dark};
      }

      .badge {
        text-shadow: none !important;
      }
    }
  }

  &.banner-container.no-update-indicator {
    grid-area: 1/1/3/3;
  }

  &.alert-container {
    ${GSB.DPflex("column", "center", "center", "100%", "100%")}
    margin-bottom: 15px;
    grid-area: 1/1/2/2;
    max-width: ${({ theme }) => theme.mediaQueryPoints.tablet};
    margin-right: 5%; 
    justify-self: flex-end;
    transform: translate(35%,10%);
    
    .alert-panel {
      ${GSB.DPflex("column", "center", "flex-start", "max-content", "85%")}
      padding: 15px;
      background: none;
      min-width: calc(${({ theme }) => theme.mediaQueryPoints.mobileS} - 24px);
      color: ${({ theme }) => theme.palette.customAlerts.normal.captionText};
      
      .MuiAlert-icon {
        display: none;
      }
      
      .MuiAlert-message {
        ${GSB.DPblock("block", "max-content", "100%")}
        background: ${({ theme }) => theme.palette.customAlerts.normal.light};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.normal.dark};
        border-radius: 8px;
        padding: 12px 15px;

        .alert-title {
          ${GSB.DPblock("block", "max-content", "100%")}
          text-align: center;
          font-size: 16px;
          transform: translateY(-2px);
          margin-bottom: 10px;

          svg {
            transform: translateY(4px);
          }
        }
      }

      &.complete > .MuiAlert-message {
        background: ${({ theme }) => theme.palette.customAlerts.complete.light};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.complete.dark};
        color: ${({ theme }) => theme.palette.customAlerts.complete.captionText};
      }

      &.danger > .MuiAlert-message {
        background: ${({ theme }) => theme.palette.customAlerts.danger.light};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.danger.dark};
        color: ${({ theme }) => theme.palette.customAlerts.danger.captionText};
      }

      &.attention > .MuiAlert-message {
        background: ${({ theme }) => theme.palette.customAlerts.attention.light};
        border: 1px solid ${({ theme }) => theme.palette.customAlerts.attention.dark};
        color: ${({ theme }) => theme.palette.customAlerts.attention.captionText};
      }
    }
  }

  &.system-details-container {
    ${GSB.DPflex("row", "center", "center", "max-content", "100%")}
    margin: 50px 0px;

    .system-details-card {
      min-height: 280px;
    }
  }

  &.resources-container {
    ${GSB.DPgrid(["repeat(2,48%)"], ["auto"], "max-content", "100%", "10px", "center", "center")}
    max-width: calc(${({ theme }) => theme.mediaQueryPoints.tablet} - 200px);
    padding-left: 4%
    margin-bottom: 10px;
  }

  &.contributors-container {
    ${GSB.DPgrid(["repeat(1,80%)"], ["auto"], "max-content", "100%", "10px", "center", "center")}
    padding: 12px 14px;
  }
`;

const TileContainer = styled(Container)<StyledProps>`
  ${GSB.DPflex("column", "center", "center", "max-content", "100%")}

  &.resource-container {
    ${GSB.DPblock("inline-block", "80%", "80%")}
    min-height: 180px;
    min-width: 180px;
    background: ${({ theme }) => theme.palette.customSegments.TileContainer.primary};
    border-radius: 8px;
    ${GSB.HoverOver("pointer", "250ms", "ease-out", "ease-in")}
    margin-bottom: 5px;

    &:hover {
      background: ${({ theme }) => theme.palette.customSegments.TileContainer.primaryHover};
    }

    &:nth-child(odd) {
      justify-self: flex-end;
      transform: translateX(20px);
    }

    .resource-link {
      ${GSB.DPflex("column", "center", "center", "100%", "100%")}
      text-decoration: none;

      .icon {
        ${GSB.DPblock()}

        svg {
          ${GSB.DPblock("inline-block", "50px", "50px")}
          color: ${({ theme }) => theme.palette.customSegments.TitleContainer.primary};
        }
      }

      .domain {
        ${GSB.DPblock("block", "max-content", "100%")}
        text-align: center;
        text-decoration: none;
        color: ${({ theme }) => theme.palette.customSegments.TitleContainer.secondary};
      }
    }
  }
`;

const GridContainer = styled(Container)<StyledProps>`
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

const CardContainer = styled(Card)<StyledProps>`
  &.system-details-card {
    ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "100%")}
    padding: 12px 14px;
    min-width: 350px;
    max-width: 480px;
    background: ${({ theme }) => theme.palette.customSegments.CardContainer.primary};
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
        "10px",
        (theme) => theme.palette.customSegments.CardContainer.primaryHover
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
          font-size: 12px;

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
        font-size: 16px;
        color: ${({ theme }) => theme.palette.customSegments.CardContainer.captionText};

        svg {
          margin-right: 5px;
          transform: translateY(1px);
          color: ${({ theme }) => theme.palette.primary.main};
        }
      }

      .descrp {
        grid-area: 2/1/3/3;
        ${GSB.DPblock("inline-block", "max-content", "100%")}
        margin: 5px 0px;
        color: ${({ theme }) => theme.palette.customSegments.CardContainer.secondaryHover};
        border-bottom: 1px solid
          ${({ theme }) => theme.palette.customSegments.CardContainer.primaryHover};
        padding-bottom: 5px;
      }

      .tags {
        ${GSB.DPflex("row", "center", "flex-end", "100%", "100%")}
        grid-area: 1/2/2/3;
        font-size: 12px;
        transform: treanslateX(1px);

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
          background: ${({ theme }) => theme.palette.info.contrastText};
          color: ${({ theme }) => theme.palette.info.dark};
          border-left: 0.5px solid ${({ theme }) => theme.palette.info.main};
          border-bottom: 0.5px solid ${({ theme }) => theme.palette.info.main};
        }
      }
    }

    .card-footer {
      .dependency-sums {
        border-bottom: none;
        padding: 7px;

        .sum {
          ${GSB.DPflex("row", "center", "space-between", "100%", "100%")}
          padding: 1px 0px;

          .value {
            font-weight: 600;
          }
        }
      }
    }
  }
`;

const TerminalContainer = styled(Terminal)<StyledProps>`
  &.terminal-container {
    ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "100%")}
    background: ${({ theme }) => theme.palette.terminal.background};
    padding: 8px 10px;
    border-radius: 5px;
    margin: 8px 0px 2px;

    .directory {
      color: ${({ theme }) => theme.palette.terminal.foreground};
      font-style: oblique;
      font-size: 10px;
      margin-bottom: 5px;
    }

    .terminal-box {
      ${GSB.DPflex("column", "flex-start", "flex-start", "max-content", "100%")}
      max-height: 280px;
      overflow-y: scroll;
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
        ${GSB.DPblock("inline-block", "max-content", "100%")}
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
    ${GSB.DPgrid(
      ["20px", "repeat(4,calc(260px / 4))"],
      ["20px", "repeat(3,max-content)"],
      "max-content",
      "320px"
    )}
    max-width: 280px;
    position: relative;
    text-decoration: none;
    margin: 2px 10px 30px 10px;
    transform: translateY(25px);
    ${GSB.HoverOver("pointer", "250ms", "ease-out", "ease-in")}
    
    .card-top {
      ${GSB.DPgrid(
        ["20px", "repeat(4,calc(260px / 4))"],
        ["20px", "repeat(2,max-content)"],
        "max-content",
        "inherit"
      )}
      max-width: 250px;
      max-height: 50px;
      background: ${({ theme }) => theme.palette.customSegments.TitleContainer.captionText};
      grid-area: 2/2/6/6;
      border-radius: ${UserContainerUnhoveredRadius};
      border-bottom-left-radius: calc(${UserContainerUnhoveredRadius} / 0.1);
      border-top-right-radius: calc(${UserContainerUnhoveredRadius} / 0.1);
      ${GSB.BoxShadow(
        "1px",
        "1px",
        "5px",
        "1px",
        (theme) => theme.palette.customSegments.CardContainer.primaryHover
      )}
      position: relative;
      z-index: 2;
      transition: 250ms ease-out;

      img {
        ${GSB.DPblock("auto", "80px")}
        border-radius: 50%;
        border: 10px solid ${({ theme }) => theme.palette.customSegments.UserContainer.default};
        transform: translate(12px,-40px);
        justify-self: flex-start;
        align-self: flex-start;
        grid-area: 1/1/4/4;
      }

      .userrole {
        grid-area: 1/3/2/6;
        transform: translateY(-32px);
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

      .expander {
        ${GSB.DPflex("column", "center", "center", "30px", "30px")}
        border: 5px solid ${({ theme }) => theme.palette.customSegments.UserContainer.default};
        background: ${({ theme }) => theme.palette.customSegments.TitleContainer.captionText};
        border-radius: 50%;
        font-weight: 600;
        grid-area: 2/5/3/6;
        transform: translate(-7px,15px);
        padding: 5px;
        trasition: 450ms ease-out;
      }
    }

    .card-bottom {
      ${GSB.DPblock("inline-block", "0%", "250px")}
      opacity: 0%;
      transform: translateY(-150px);
      background: ${({ theme }) => theme.palette.customSegments.UserContainer.primaryHover};
      grid-area: 3/2/6/6;
      padding: 60px 15px 10px;
      border-top-left-radius: 10px;
      border-top-right-radius: calc(${UserContainerUnhoveredRadius} / 2);
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
      position: absolute;
      z-index: 1;

      .details {
        margin: 0%;
        font-size: 12px;
      }
    }

    &:hover {

      .card-top {
        background: ${({ theme }) => theme.palette.customSegments.UserContainer.secondaryHover};
        ${GSB.BoxShadow(
          "-1px",
          "-1px",
          "2px",
          "1px",
          (theme) => theme.palette.customSegments.CardContainer.primaryHover
        )}
        trasition: 250ms ease-in;

        img {
          border: 10px solid ${({ theme }) => theme.palette.customSegments.UserContainer.tertiary};
        }

        .userrole {
          color: ${({ theme }) => theme.palette.customSegments.UserContainer.primary};
          font-family: inherit;
        }
        
        .username {
          color: ${({ theme }) => theme.palette.customSegments.TitleContainer.contrastText};
        }
      }
    }
  }

  &.user-card.described:hover {

      .card-top {
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        trasition: 250ms ease-in;

        .expander {
          transform: translate(-7px,15px) rotate(180deg);
          background: ${({ theme }) => theme.palette.customSegments.UserContainer.secondaryHover};
          border: 5px solid ${({ theme }) => theme.palette.customSegments.UserContainer.tertiary};
          color: ${({ theme }) => theme.palette.customSegments.TitleContainer.contrastText};
          ${GSB.BoxShadow(
            "1px",
            "-0.5px",
            "0.5px",
            "1px",
            (theme) => theme.palette.customSegments.UserContainer.secondaryHover
          )}
          transition: 250ms ease-in;
        }
      }

      .card-bottom {
        transition: 300ms ease-in;
        position: relative;
        height: max-content !important;
        max-width: inherit;
        opacity: 100%;
        transform: translateY(0px);
        ${GSB.BoxShadow(
          "1px",
          "1px",
          "5px",
          "1px",
          (theme) => theme.palette.customSegments.CardContainer.primaryHover
        )}
      }
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
