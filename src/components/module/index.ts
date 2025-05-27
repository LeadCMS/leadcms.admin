import { styled } from "@mui/material";

export const ModuleContainer = styled("div")`
  display: flex;
  flex-flow: column;
  height: 100%;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(5)};
`;

export const ModuleHeaderContainer = styled("div")`
  display: grid;
  row-gap: ${({ theme }) => theme.spacing(2)};
  grid-template-rows: auto auto;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "title action"
    "subtitle action";
`;

export const ModuleHeaderTitleContainer = styled("div")`
  grid-area: title;
  color: ${({ theme: { palette } }) => palette.text.primary};
`;

export const ModuleHeaderSubtitleContainer = styled("div")`
  color: ${({ theme: { palette } }) => palette.text.primary};
  grid-area: subtitle;
`;

export const ModuleHeaderActionContainer = styled("div")`
  grid-area: action;
  display: flex;
  flex-flow: column;
  justify-content: center;
`;
