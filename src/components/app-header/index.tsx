import { Box, IconButton, Typography } from "@mui/material";
import { AppBarStyled, AppBarToolbar, LogoComponent } from "./index.styled";
import MenuIcon from "@mui/icons-material/Menu";
import { useSidebar } from "@providers/sidebar-provider";
import { DropdownMenu } from "./dropdown-menu";

export const AppHeader = () => {
  const { toggle } = useSidebar();

  return (
    <AppBarStyled>
      <AppBarToolbar>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            onClick={toggle}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <LogoComponent />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              ml: 2, 
              fontWeight: "500", 
              display: { xs: "none", sm: "block" } 
            }}
          >
            LeadCMS Admin
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DropdownMenu />
        </Box>
      </AppBarToolbar>
    </AppBarStyled>
  );
};
