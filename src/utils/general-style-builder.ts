import { Theme } from "@mui/material/styles";

export const OverwriteDefaults = (
  acceptThemeProvider: boolean,
  appendToROOT?: boolean,
  padding?: string,
  margin?: string,
  subEntries?: string[]
) => {
  const pddAlt =
    acceptThemeProvider && !padding ? ({ theme }: { theme: Theme }) => theme.spacing(6) : padding;
  const mrgAlt =
    acceptThemeProvider && !margin ? ({ theme }: { theme: Theme }) => theme.spacing(0.075) : margin;

  return `
    ${appendToROOT ? ":root, " : ""}  
    *${subEntries && subEntries?.length > 0 ? ", " + subEntries.join(", ") : ""} {
      padding: ${pddAlt || "0%"};
      margin: ${mrgAlt || "0%"};
      box-sizing: border-box;
    }
  `;
};

export const DPflex = (
  direction?: string,
  alignment?: string,
  justification?: string,
  height?: string,
  width?: string
) => {
  return `
    display: flex;
    flex-direction: ${direction || "row"};
    align-items: ${alignment || "flex-start"};
    justify-content: ${justification || "flex-start"};
    height: ${height || "max-content"};
    width: ${width || "max-content"};
  `;
};

export const DPblock = (mode?: string, height?: string, width?: string) => {
  return `
    display: ${mode || "inline-block"};
    height: ${height || "max-content"};
    width: ${width || "max-content"};
  `;
};

export const DPgrid = (
  cols: string[],
  rows: string[],
  height?: string,
  width?: string,
  gap?: string,
  alignment?: string,
  justification?: string
) => {
  return `
    display: grid;
    ${cols ? `grid-template-columns: ${cols.join(" ")};` : ""}
    ${rows ? `grid-template-rows: ${rows.join(" ")};` : ""}
    ${alignment ? `align-content: ${alignment};` : ""}
    ${justification ? `justify-items: ${justification};` : ""}
    ${gap ? `grid-gap: ${gap};` : ""}
    height: ${height || "max-content"};
    width: ${width || "max-content"};
  `;
};

export const BoxShadow =
  (
    x: string,
    y: string,
    blur: string,
    spread: string,
    getColor: (theme: Theme) => string,
    inset?: boolean
  ) =>
  ({ theme }: { theme: Theme }) => {
    const color = getColor(theme);

    const shadowValue = `${inset ? "inset " : ""}${x} ${y} ${blur} ${spread} ${color}`;

    return `
    -webkit-box-shadow: ${shadowValue};
    -moz-box-shadow: ${shadowValue};
    -ms-box-shadow: ${shadowValue};
    box-shadow: ${shadowValue};
  `;
  };

export const HoverOver = (
  cursorPoint: string,
  periodStart: string,
  translationEnd: string,
  translationStart: string,
  actionList?: string[],
  periodEnd?: string
) => {
  return `
    transition: ${periodStart || "150ms"} ${translationEnd || "ease-out"};
    
    &:hover${actionList && actionList?.length > 0 ? ", " + actionList.join(", &:") : ""} {
      cursor: ${cursorPoint};
      transition: ${periodEnd || periodStart || "200ms"} ${translationStart || "ease-in"};
    }
  `;
};
