import React from "react";
import { Grid, Paper, Typography, CircularProgress } from "@mui/material";
import { useRequestContext } from "@providers/request-provider";

interface StatTileProps {
  label: string;
  fetchCount: () => Promise<number>;
}

const StatTile: React.FC<StatTileProps> = ({ label, fetchCount }) => {
  const [count, setCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchCount()
      .then((value) => {
        if (isMounted) {
          setCount(value);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [fetchCount]);

  return (
    <Paper style={{ padding: 24, textAlign: "center", minHeight: 140 }}>
      <Typography variant="h6">{label}</Typography>
      {loading ? (
        <CircularProgress size={32} />
      ) : error ? (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      ) : (
        <Typography variant="h4">{count}</Typography>
      )}
    </Paper>
  );
};

const Dashboard: React.FC = () => {
  const { client } = useRequestContext();

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 2 }}>
        <StatTile
          label="Users"
          fetchCount={() => client.api.usersList().then((res) => res.data.length)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <StatTile
          label="Accounts"
          fetchCount={() => client.api.accountsList().then((res) => res.data.length)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <StatTile
          label="Contacts"
          fetchCount={() => client.api.contactsList().then((res) => res.data.length)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <StatTile
          label="Orders"
          fetchCount={() => client.api.ordersList().then((res) => res.data.length)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <StatTile
          label="Pages"
          fetchCount={() => client.api.contentList().then((res) => res.data.length)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <StatTile
          label="Comments"
          fetchCount={() => client.api.commentsList().then((res) => res.data.length)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <StatTile
          label="Links"
          fetchCount={() => client.api.linksList().then((res) => res.data.length)}
        />
      </Grid>
    </Grid>
  );
};

export { Dashboard };
export { DashboardModule } from "./dashboard-module";
