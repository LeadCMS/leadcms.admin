import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { AppBarStyled, AppBarToolbar } from "./index.styled";
import { DropdownMenu } from "./dropdown-menu";
import { BreadCrumbNavigation } from "@components/breadcrumbs";
import { GlobalLanguageFilter } from "@components/global-language-filter";
import { Menu, Settings } from "lucide-react";
import { useSidebar } from "@providers/sidebar-provider";
import { useNavigate } from "react-router-dom";
import { CoreModule, getCoreModuleRoute } from "@lib/router";

interface AppHeaderProps {
  breadcrumbs: { linkText: string; toRoute: string }[];
  currentBreadcrumb: string;
}

export const AppHeader = ({ breadcrumbs, currentBreadcrumb }: AppHeaderProps) => {
  const { toggleMobile } = useSidebar();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSettingsClick = () => {
    navigate(getCoreModuleRoute(CoreModule.settings));
  };

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
                  background: "none",
                },
              }}
            >
              <Menu />
            </IconButton>
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            mx: { xs: 1, sm: 3 },
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <BreadCrumbNavigation links={breadcrumbs} current={currentBreadcrumb} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <GlobalLanguageFilter />
          <Tooltip title="Settings">
            <IconButton
              onClick={handleSettingsClick}
              size="small"
              sx={{
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Settings size={20} />
            </IconButton>
          </Tooltip>
          <DropdownMenu />
        </Box>
      </AppBarToolbar>
    </AppBarStyled>
  );
};
