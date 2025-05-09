import { Box, Typography } from "@mui/material";
import { rootRoute } from "lib/router";
import { GhostLink } from "components/ghost-link";
import { AppBarStyled, AppBarToolbar, LogoComponent } from "./index.styled";
import { DropdownMenu } from "./dropdown-menu";

export const AppHeader = () => {
  return (
    <AppBarStyled>
      <AppBarToolbar>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LogoComponent />
          <Typography
            component={GhostLink}
            to={rootRoute}
            variant="h6"
            style={{ marginLeft: "20px" }}
          >
            LeadCMS Admin
          </Typography>
        </Box>
        <DropdownMenu />
      </AppBarToolbar>
    </AppBarStyled>
  );
};
