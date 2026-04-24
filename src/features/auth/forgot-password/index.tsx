import { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { LoginContainer, StyledForm, Logo, LogoRow } from "./index.styled";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestContext } from "@providers/request-provider";
import { ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export const ForgotPassword = () => {
  const { client } = useRequestContext();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (form: ForgotPasswordForm) => {
    setLoading(true);
    setError(null);
    try {
      await client.api.identityForgotPasswordCreate({ email: form.email, language: "en" });
      setSent(true);
    } catch (err: any) {
      setError("Failed to send password reset link. Please try again.");
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
            Forgot your password?
          </Typography>
        </LogoRow>
        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
          Enter your email so that we can send you a password reset link.
        </Typography>
        <TextField
          label="Email"
          fullWidth
          type="email"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={sent}
        />
        {error && (
          <Typography variant="body2" color="error" align="center" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        {sent && (
          <Typography variant="body2" color="primary" align="center" sx={{ mt: 1 }}>
            We have sent a password reset link to your email.
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={loading || sent}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress color="inherit" size={24} /> : "Send Email"}
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={() => (window.location.href = "/auth/login")}
          sx={{
            mt: 1,
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
          startIcon={<ArrowLeft size={15} />}
        >
          Back to Login
        </Button>
      </StyledForm>
    </LoginContainer>
  );
};
