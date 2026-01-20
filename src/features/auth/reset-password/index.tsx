import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestContext } from "@providers/request-provider";
import { LoginContainer, StyledForm, Logo, LogoRow } from "./index.styled";

const passwordRequirements = [
  {
    label: "Minimum 8 characters",
    test: (pw: string) => pw.length >= 8,
  },
  {
    label: "At least one uppercase letter",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: "At least one lowercase letter",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    label: "At least one number",
    test: (pw: string) => /\d/.test(pw),
  },
  {
    label: "At least one special character",
    test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  },
];

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must have at least one uppercase letter")
      .regex(/[a-z]/, "Must have at least one lowercase letter")
      .regex(/\d/, "Must have at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must have at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof schema>;

function getQueryParam(param: string) {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  return url.searchParams.get(param);
}

export const ResetPassword = () => {
  const { client } = useRequestContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [passwordValue, setPasswordValue] = useState("");

  const userId = getQueryParam("userId");
  const token = getQueryParam("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (form: ResetPasswordForm) => {
    if (!userId || !token) {
      setResetError("Invalid reset link. Please check your email and try again.");
      return;
    }
    setLoading(true);
    setResetError(null);
    try {
      const response = await client.api.identityResetPasswordCreate({
        userId,
        token,
        newPassword: form.password,
      });

      if (response && response.ok) {
        window.location.href = "/auth/login";
      } else {
        setResetError("Failed to reset password. Please try again.");
      }
    } catch (err) {
      setResetError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = passwordRequirements.map((req) => req.test(passwordValue));

  return (
    <LoginContainer>
      <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
        <LogoRow>
          <Logo src="/images/logo.svg" alt="LeadCMS Logo" />
          <Typography variant="h5" align="center" sx={{ m: 0 }}>
            Reset Password
          </Typography>
        </LogoRow>
        <TextField
          label="New Password"
          fullWidth
          type={showPassword ? "text" : "password"}
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          InputProps={{
            endAdornment: (
              <Box
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  pr: 1,
                }}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Box>
            ),
          }}
          sx={{ mt: 6, mb: 4 }}
        />

        <TextField
          label="Confirm Password"
          fullWidth
          type={showConfirm ? "text" : "password"}
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputProps={{
            endAdornment: (
              <Box
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  pr: 1,
                }}
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </Box>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mb: 2 }}>
          <List dense>
            {passwordRequirements.map((req, idx) => (
              <ListItem key={req.label} sx={{ p: 0, pl: 1 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {passwordChecks[idx] ? (
                    <Check color="green" size={15} />
                  ) : (
                    <X color="grey" size={15} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={req.label}
                  primaryTypographyProps={{
                    fontSize: "0.8rem",
                    color: passwordChecks[idx] ? "green" : "grey",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        {resetError && (
          <Typography variant="body2" color="error" align="center" sx={{ mt: 1 }}>
            {resetError}
          </Typography>
        )}
        <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ mt: 1 }}>
          {loading ? <CircularProgress color="inherit" size={22} /> : "Reset Password"}
        </Button>
      </StyledForm>
    </LoginContainer>
  );
};
