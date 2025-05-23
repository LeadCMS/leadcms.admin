import { useMsal } from "@azure/msal-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Button, Typography, TextField, IconButton, InputAdornment} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { LoginDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { LoginContainer, StyledForm, Logo, MicrosoftButton, OrText, } from "./index.styled";
import { useAuthState } from "@providers/auth-provider";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const Login = () => {

  const { setLocalToken } = useAuthState();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [showPassword, setShowPassword] = useState(false);
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);

  const handleMicrosoftLogin = () => {
    instance.loginRedirect({
      scopes: ["User.Read"],
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (form: LoginDto) => {
    setLoading(true);
    try {
      const response = await client.api.identityLoginCreate(form);
      
      if (!response || !response.ok) {
        notificationsService.error("Login failed");
        return;
      }
      const responseJson = await response.json();
      localStorage.setItem("token", responseJson.token);
      setLocalToken(responseJson.token);
      const from = new URLSearchParams(window.location.search).get("from") ?? "/";
      window.location.replace(from);
      notificationsService.success("Login successful");
    } catch (err: any) {
      notificationsService.error("Login failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <LoginContainer>
      <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
        <Logo src="/images/logo.svg" alt="LeadCMS Logo" />
        <Typography variant="h5" align="center">Login to LeadCMS</Typography>
        <TextField
          label="Email"
          fullWidth
          type="email"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Password"
          fullWidth
          type={showPassword ? "text" : "password"}
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(prev => !prev)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <OrText>Or</OrText>
        <MicrosoftButton onClick={handleMicrosoftLogin} fullWidth startIcon={
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft Logo"
            width="20"
            height="20"
          />
        }>
          Continue with Microsoft
        </MicrosoftButton>
      </StyledForm>
    </LoginContainer>
  );
};
