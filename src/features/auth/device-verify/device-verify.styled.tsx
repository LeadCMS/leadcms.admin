import styled from "@emotion/styled";
import { Box, Button, Typography } from "@mui/material";

export const VerifyContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
`;

export const StyledForm = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 400px;
  padding: 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
  text-align: center;
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
  margin-bottom: 2rem;
`;

export const UserCodeDisplay = styled(Typography)`
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #2196f3;
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

export const SuccessButton = styled(Button)`
  background-color: #4caf50;
  color: white;
  font-weight: 500;

  &:hover {
    background-color: #45a049;
  }
`;

export const ErrorButton = styled(Button)`
  background-color: #f44336;
  color: white;
  font-weight: 500;

  &:hover {
    background-color: #d32f2f;
  }
`;