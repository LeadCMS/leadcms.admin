import { styled } from "@mui/material/styles";
import { Avatar } from "@mui/material";
import { Theme as MuiTheme } from "@mui/material/styles";

export const UserEditContainer = styled("div")`
  flex-grow: 1;
  padding: 2rem 0;
  max-width: 900px;
  margin: 0 auto;
`;

export const StyledAvatar = styled(Avatar)`
  &:hover {
    background-color: ${({ theme }: { theme: MuiTheme }) => theme.palette.primary.light + "22"};
    cursor: pointer;
  }
`;

export const YourStyledComponent = styled("div")(({ theme }) => ({
  color: theme.palette.primary.main,
}));
