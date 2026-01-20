import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export const LoginContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
`;

export const StyledForm = styled("form")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 400px;
  padding: 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
`;

export const Logo = styled("img")`
  width: 48px;
  height: 48px;
  margin: 0;
  display: block;
`;

export const LogoRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`;

export const OrText = styled(Typography)`
  text-align: center;
  font-size: 0.9rem;
  color: #888;
`;

export const MicrosoftButton = styled(Button)`
  background-color: #f3f3f3;
  color: #000;
  font-weight: 500;
  text-transform: none;

  &:hover {
    background-color: #e1e1e1;
  }

  img {
    margin-right: 0.5rem;
  }
`;
