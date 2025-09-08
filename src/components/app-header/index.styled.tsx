import { AppBar, Menu, MenuProps, styled, Toolbar } from "@mui/material";

export const AppBarStyled = styled(AppBar)`
  position: sticky;
  top: 0;
  z-index: 1100;
  height: 64px;
  background-color: ${({ theme }) => theme.palette.background.default};
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.palette.mode === "dark" ? theme.palette.secondary.light : theme.palette.divider};
  box-shadow: none;
  display: flex;
  justify-content: center;
`;

export const AccountMenu = styled((props: MenuProps) => <Menu {...props} />)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
    minWidth: 180,
    boxShadow: "rgb(0 0 0 / 20%) 0px 2px 10px",

    "& .MuiDivider-root": {
      margin: "0 !important",
    },
    "& .MuiList-root": {
      padding: "0 !important",
    },
    "& .MuiMenuItem-root": {
      padding: "8px 16px",

      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
      },

      "&:first-of-type": {
        padding: "10px 16px 8px",
      },

      "&:last-of-type": {
        padding: "8px 16px 10px",
      },
    },
  },
}));

export const AppBarToolbar = styled(Toolbar)`
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export const LogoImg = styled("img")`
  width: 32px;
  height: 32px;
  display: flex;
`;

export const LogoContainer = styled("div")`
  display: flex;
  align-items: center;
`;

export const LogoComponent = () => (
  <LogoContainer>
    <LogoImg src="/images/icon-192x192.png" alt="LeadCMS Logo" />
  </LogoContainer>
);
