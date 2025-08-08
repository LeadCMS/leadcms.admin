import { CardContent, Grid, Typography } from "@mui/material";
import { Fragment, ReactNode } from "react";
import { CardContainer, ViewListItemText, ViewRowGrid } from "./index.styled";

type dataViewProps = {
  header: string;
  rows: { label: string; value: unknown }[] | undefined;
};

export const DataView = ({ header, rows }: dataViewProps) => {
  const renderValue = (value: unknown): ReactNode => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string" && value.trim() === "") return "-";
    return value as ReactNode;
  };
  return (
    <CardContainer>
      <CardContent>
        <Grid size={{ xs: 12, sm: 12 }} sx={{ width: { xs: "100%", sm: "100%" } }}>
          <Typography gutterBottom variant="h6" component="div">
            {header}
          </Typography>
        </Grid>
        {rows &&
          rows.map(({ label, value }, index) => (
            <Fragment key={index}>
              <ViewRowGrid container marginBottom={2}>
                <ViewListItemText primary={label} secondary={renderValue(value)} />
              </ViewRowGrid>
            </Fragment>
          ))}
      </CardContent>
    </CardContainer>
  );
};

export const DataViewNoLabel = ({ header, rows }: dataViewProps) => {
  const renderValue = (value: unknown): ReactNode => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "string" && value.trim() === "") return "-";
    return value as ReactNode;
  };
  return (
    <CardContainer>
      <CardContent>
        <Grid size={{ xs: 12, sm: 12 }} sx={{ width: { xs: "100%", sm: "100%" } }}>
          <Typography gutterBottom variant="h6" component="div">
            {header}
          </Typography>
        </Grid>
        {rows &&
          rows.map(({ value }, index) => (
            <Fragment key={index}>
              <Typography variant="body2">{renderValue(value)}</Typography>
            </Fragment>
          ))}
      </CardContent>
    </CardContainer>
  );
};
