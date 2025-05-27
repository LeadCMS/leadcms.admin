import { ModuleWrapper } from "@components/module-wrapper";
import { Card, CardContent, CircularProgress, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useRequestContext } from "@providers/request-provider";
import { useEffect, useState } from "react";

export const AboutModule = () => {
  const { client } = useRequestContext();
  const [backendVersion, setBackendVersion] = useState<string | null>(null);
  useEffect(() => {
    const getVersion = async () => {
      const { data } = await client.api.versionList();
      setBackendVersion(data.version || "Unknown");
    };
    getVersion();
  });
  return (
    <ModuleWrapper breadcrumbs={[]} currentBreadcrumb={"About"}>
      <Grid container gap={5}>
        <Grid size={{ xs: "auto" }}>
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography>Frontend Version: {process.env.VERSION}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: "auto" }}>
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography>
                Backend version:
                {backendVersion ? (
                  backendVersion
                ) : (
                  <CircularProgress size={"0.8rem"} sx={{ marginLeft: "2rem" }} />
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ModuleWrapper>
  );
};
