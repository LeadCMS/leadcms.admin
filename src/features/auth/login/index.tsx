import { useMsal } from "@azure/msal-react";
import { useState, useEffect } from "react";
import {
  Button,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Box,
  CircularProgress,
  Link,
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { LoginDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { LoginContainer, StyledForm, Logo, MicrosoftButton, OrText, LogoRow } from "./index.styled";
import { useAuthState } from "@providers/auth-provider";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConfig } from "@providers/config-provider";

const LoadingConfig = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        gap: 2,
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="h6" fontWeight={500}>
        Loading configuration, please wait...
      </Typography>
    </Box>
  );
};

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const Login = () => {
  const { setLocalToken } = useAuthState();
  const { client } = useRequestContext();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { config, loading } = useConfig();
  const { instance } = useMsal();
  const [loginLoading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => {
        setLoginError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const handleMicrosoftLogin = () => {
    instance.loginRedirect({
      scopes: ["User.Read"],
    });
  };

  if (loading || !config) {
    return <LoadingConfig />;
  }

  const authMethods = config.auth?.methods ?? [];
  const showLocal = authMethods.includes("Local");
  const showAzureAD = authMethods.includes("AzureAD") && config.auth?.msal;

  const onSubmit = async (form: LoginDto) => {
    setLoading(true);
    try {
      const response = await client.api.identityLoginCreate(form);

      if (!response || !response.ok) {
        setLoginError("Login failed. Please try again.");
        return;
      }

      const responseJson = await response.json();
      localStorage.setItem("token", responseJson.token);
      setLocalToken(responseJson.token);
      window.location.replace("/dashboard");
    } catch (err: any) {
      try {
        const errorJson = await err.json();
        setLoginError(errorJson?.title || "Login failed. Please try again.");
        return;
      } catch {
        setLoginError("Login failed. Please try again.");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
        <LogoRow>
          <Logo src="/images/logo.svg" alt="LeadCMS Logo" />
          <Typography variant="h5" align="center" sx={{ m: 0 }}>
            Login to LeadCMS
          </Typography>
        </LogoRow>
        {showLocal && (
          <>
            <TextField
              label="Email"
              fullWidth
              type="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mt: 6, mb: 5 }}
            />
            <TextField
              label="Password"
              fullWidth
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <EyeOff /> : <Eye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mt: 2, mb: 0 }}
            />
            <Box sx={{ textAlign: "right", mb: 2, p: 0, alignSelf: "flex-start", pb: 2, pt: 2 }}>
              <Link
                href="/auth/forgot-password"
                variant="body2"
                underline="none"
                sx={{ fontSize: "0.8rem" }}
              >
                Forgot Password?
              </Link>
            </Box>
            {loginError && (
              <Typography variant="body2" color="error" align="center" sx={{ mt: 1 }}>
                {loginError}
              </Typography>
            )}
            <Button type="submit" variant="contained" disabled={loginLoading} fullWidth>
              {loginLoading ? "Logging in..." : "Login"}
            </Button>
          </>
        )}
        {showLocal && showAzureAD && <OrText>Or</OrText>}
        {showAzureAD && (
          <MicrosoftButton
            onClick={handleMicrosoftLogin}
            fullWidth
            startIcon={
              <img src="/images/Microsoft_logo.svg" alt="Microsoft Logo" width="20" height="20" />
            }
          >
            Continue with Microsoft
          </MicrosoftButton>
        )}
      </StyledForm>
    </LoginContainer>
  );
};
