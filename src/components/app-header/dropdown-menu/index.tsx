import React, { useState } from "react";
import {
  Box,
  Menu,
  MenuItem,
  Tooltip,
  IconButton,
  Avatar,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { LogOut } from "lucide-react";
import { useUserInfo } from "@providers/user-provider";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { useAuthState } from "@providers/auth-provider";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material";

export const AccountMenu = styled("ul")`
  width: 32px;
  height: 32px;
  display: flex;
`;

export const DropdownMenu = () => {
  const { logout } = useAuthState();
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  const displayName = (userInfo && userInfo?.details?.displayName) || "Unknown";
  const avatarUrl =
    (userInfo && userInfo?.details?.avatarUrl && buildAbsoluteUrl(userInfo?.details.avatarUrl)) ||
    undefined;

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorElement);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorElement(null);
  };

  const handleProfileClick = () => {
    navigate("/users/me/edit");
  };

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }} src={avatarUrl}>
              {displayName[0]}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorElement}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        sx={{
          // <hr /> tag/s
          "& .MuiDivider-root": {
            margin: "0% !important",
          },
          // main <ul />
          "& .MuiList-root": {
            padding: "0% !important",
          },
          // <li /> tags
          "& .MuiMenuItem-root": {
            // <li /> tags between the first & last
            padding: "8px 16px",

            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
            },
            // first <li />
            "&:first-of-type": {
              padding: "10px 16px 8px",
            },
            // last <li />
            "&:last-of-type": {
              padding: "8px 16px 10px",
            },
          },
        }}
      >
        <MenuItem onClick={handleProfileClick} disabled={userInfo === null}>
          <Avatar
            sx={{ width: 32, height: 32, marginRight: 2.5, marginLeft: -1.5 }}
            src={avatarUrl}
          >
            {displayName[0]}
          </Avatar>
          Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={logout} disabled={userInfo === null}>
          <ListItemIcon>
            <LogOut size={20} />
          </ListItemIcon>
          Logout
        </MenuItem>
        <MenuItem onClick={logout} disabled={userInfo === null}>
          <ListItemIcon>
            <LogOut size={20} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};
