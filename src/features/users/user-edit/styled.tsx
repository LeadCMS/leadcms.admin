import { styled } from "@mui/material/styles";
import { Avatar } from "@mui/material";
import { Theme as MuiTheme } from "@mui/material/styles";

export const UserEditContainer = styled("div")`
  flex-grow: 1;
`;

export const StyledAvatar = styled(Avatar)`
  &:hover {
    background-color: ${({ theme }: { theme: MuiTheme }) => theme.palette.primary.light};
    cursor: pointer;
  }
`;

export const YourStyledComponent = styled("div")(({ theme }) => ({
  color: theme.palette.primary.main,
}));
