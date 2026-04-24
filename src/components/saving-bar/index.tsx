/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import { Save } from "lucide-react";

const SavingBarBegin = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div {...props} ref={ref}>
      <Grid container spacing={3} sm="auto" xs="auto" justifyContent={"flex-end"}>
        <Grid size={{ xs: "auto" }}>
          <CircularProgress size={14} />
        </Grid>
        <Grid size={{ xs: "auto" }}>
          <Typography>Saving draft locally...</Typography>
        </Grid>
      </Grid>
    </div>
  );
});

const SavingBarEnd = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div {...props} ref={ref}>
      <Grid container spacing={3} sm="auto" xs="auto">
        <Grid size={{ xs: "auto" }}>
          <Save />
        </Grid>
        <Grid size={{ xs: "auto" }}>
          <Typography>Draft saved locally</Typography>
        </Grid>
      </Grid>
    </div>
  );
});

export const SavingBar = () => {
  const [state, setState] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setState(true);
    }, 2000);
  }, []);
  return (
    <Box minWidth={200}>
      <Grid container justifyContent={"flex-end"}>
        <Grid size={{ xs: "auto" }} sx={{ position: "absolute" }}>
          <Fade in={state}>
            <SavingBarEnd />
          </Fade>
        </Grid>
        <Grid size={{ xs: "auto" }} sx={{ position: "absolute" }}>
          <Fade in={!state}>
            <SavingBarBegin />
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};
