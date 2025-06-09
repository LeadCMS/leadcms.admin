import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { AppBarStyled, AppBarToolbar } from "./index.styled";
import { DropdownMenu } from "./dropdown-menu";
import { BreadCrumbNavigation } from "@components/breadcrumbs";
import { Menu } from "lucide-react";
import { useSidebar } from "@providers/sidebar-provider";

interface AppHeaderProps {
  breadcrumbs: { linkText: string; toRoute: string }[];
  currentBreadcrumb: string;
}

export const AppHeader = ({ breadcrumbs, currentBreadcrumb }: AppHeaderProps) => {
  const { toggleMobile } = useSidebar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBarStyled>
      <AppBarToolbar>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobile}
              sx={{
                mr: 0,
                ml: 2,
                background: "none",
                border: "none",
                borderRadius: 0,
                color: theme.palette.text.primary,
                padding: 0.5,
                "&:hover": {
                  background: "none"
                }
              }}
            >
              <Menu />
            </IconButton>
          )}
        </Box>
        <Box sx={{ 
          flex: 1, 
          mx: { xs: 1, sm: 3 }, 
          minWidth: 0,
          overflow: "hidden"
        }}>
          <BreadCrumbNavigation links={breadcrumbs} current={currentBreadcrumb} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DropdownMenu />
        </Box>
      </AppBarToolbar>
    </AppBarStyled>
  );
};
