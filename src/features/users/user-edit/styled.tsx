import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";

export const UserEditContainer = styled("div")`
  flex-grow: 1;
`;

export const StyledAvatar = styled(Avatar)`
  &:hover {
    background-color: ${({ theme }: { theme: Theme }) => theme.palette.primary.light};
    cursor: pointer;
  }
`;

export const YourStyledComponent = styled("div")(({ theme }) => ({
  color: theme.palette.primary.main,
}));
