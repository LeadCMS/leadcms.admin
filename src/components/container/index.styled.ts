import { styled } from "@mui/material";
import { LocalContainerProps } from "types";
import { Card, Container, Terminal, User } from "./index";

const MainContainer = styled(Container)<LocalContainerProps>`
  display: block;
  height: max-content;
  min-height: 100%;
  width: 100%;

  &.flx {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
  }

  &.flx-c {
    align-items: center;
    justify-content: center;
  }

  &.flx-e {
    align-items: flex-end;
    justify-content: flex-end;
  }

  &.flx-dir-c {
    flex-direction: column;
  }

  &.flx-dir-r {
    flex-direction: row;
  }

  margin: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(0)};
`;

const SubContainer = styled(Container)<LocalContainerProps>`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  height: max-content;
  min-height: 100%;
  width: 100%;

  &.flx-c {
    align-items: center;
    justify-content: center;
  }

  &.flx-e {
    align-items: flex-end;
    justify-content: flex-end;
  }

  &.flx-dir-c {
    flex-direction: column;
  }

  &.flx-dir-r {
    flex-direction: row;
  }

  margin: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(0)};
`;

const TileContainer = styled(Container)<LocalContainerProps>`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  height: max-content;
  min-height: 100%;
  width: 100%;

  &.flx-c {
    align-items: center;
    justify-content: center;
  }

  &.flx-e {
    align-items: flex-end;
    justify-content: flex-end;
  }

  &.flx-dir-c {
    flex-direction: column;
  }

  &.flx-dir-r {
    flex-direction: row;
  }

  margin: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(0)};
`;

const GridContainer = styled(Container)<LocalContainerProps>`
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

const CardContainer = styled(Card)<LocalContainerProps>``;

const TerminalContainer = styled(Terminal)<LocalContainerProps>``;

const UserContainer = styled(User)<LocalContainerProps>``;

export {
  MainContainer,
  SubContainer,
  TileContainer,
  GridContainer,
  TerminalContainer,
  CardContainer,
  UserContainer,
};
