import { useState, useEffect } from "react";
import { Typography, CircularProgress, TextField, Box } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useRequestContext } from "@providers/request-provider";
import { useAuthState } from "@providers/auth-provider";
import { Check, X } from "lucide-react";
import {
  VerifyContainer,
  StyledForm,
  Logo,
  LogoRow,
  UserCodeDisplay,
  SuccessButton,
  ErrorButton,
} from "./device-verify.styled";

type VerificationState = "loading" | "pending" | "success" | "error" | "input";

export const DeviceVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { client } = useRequestContext();
  const { localToken, account } = useAuthState();
  const [verificationState, setVerificationState] = useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userCode, setUserCode] = useState<string>("");
  const [lastTriedCode, setLastTriedCode] = useState<string>("");
  const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);
  const [autoSubmitTimer, setAutoSubmitTimer] = useState<NodeJS.Timeout | null>(null);

  // Get user code from URL parameter
  const userCodeParam = searchParams.get("user_code");

  useEffect(() => {
    // If user is not authenticated, redirect to login with return URL
    if (!localToken && !account) {
      const returnUrl = encodeURIComponent(window.location.href);
      navigate(`/auth/login?returnUrl=${returnUrl}`);
      return;
    }

    // If we have a pre-filled user code, verify it automatically
    if (userCodeParam) {
      setUserCode(userCodeParam);
      handleVerification(userCodeParam);
    } else {
      // Show input form for manual entry
      setVerificationState("input");
    }
  }, [userCodeParam, localToken, account, navigate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
      }
    };
  }, [autoSubmitTimer]);

  const handleVerification = async (code: string) => {
    setVerificationState("loading");
    setErrorMessage("");
    setLastTriedCode(code.toUpperCase()); // Track what code we're trying

    try {
      const response = await client.api.identityDeviceVerifyCreate({
        userCode: code.toUpperCase(),
      });

      if (response.error) {
        throw new Error(response.error.title || "Verification failed");
      }

      setVerificationState("success");

      // Auto-close the window after a delay if it was opened as a popup
      setTimeout(() => {
        if (window.opener) {
          window.close();
        }
      }, 3000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "An error occurred during verification";
      setErrorMessage(errorMsg);
      setVerificationState("error");
    }
  };

  const handleManualVerification = (providedCode?: string) => {
    const codeToUse = providedCode || userCode;
    console.log("📋 handleManualVerification called with code:", JSON.stringify(codeToUse));
    console.log("📏 code length:", codeToUse.length);

    if (codeToUse.trim()) {
      const codeToSend = codeToUse.trim();
      console.log("📤 Sending to API:", JSON.stringify(codeToSend));
      // Keep the dash in the code - API expects it formatted the same as URL parameter
      handleVerification(codeToSend);
    } else {
      console.log("⛔ No code to send - code is empty");
    }
  };

  const handleButtonClick = () => {
    handleManualVerification();
  };

  const handleTryAgain = () => {
    // Clear any pending auto-submit timer
    if (autoSubmitTimer) {
      clearTimeout(autoSubmitTimer);
      setAutoSubmitTimer(null);
    }

    // Clear the error state and user code to start fresh
    setErrorMessage("");
    setUserCode("");
    setLastTriedCode("");
    setIsAutoSubmitting(false);
    setVerificationState("input");
  };

  const formatUserCode = (value: string) => {
    console.log("🏭 formatUserCode input:", JSON.stringify(value));

    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    console.log("🧼 After cleaning:", JSON.stringify(cleaned), "length:", cleaned.length);

    // Limit to 8 characters max
    const truncated = cleaned.slice(0, 8);
    console.log("✂️ After truncating:", JSON.stringify(truncated), "length:", truncated.length);

    // Add dash after 4 characters if length > 4
    if (truncated.length > 4) {
      const result = `${truncated.slice(0, 4)}-${truncated.slice(4)}`;
      console.log("➗ With dash:", JSON.stringify(result));
      return result;
    }

    console.log("📝 No dash needed:", JSON.stringify(truncated));
    return truncated;
  };

  const handleUserCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("🔤 Input value:", JSON.stringify(value));

    const formatted = formatUserCode(value);
    console.log("✨ Formatted:", JSON.stringify(formatted));

    setUserCode(formatted);

    // Clear any existing auto-submit timer
    if (autoSubmitTimer) {
      console.log("⏰ Clearing existing timer");
      clearTimeout(autoSubmitTimer);
      setAutoSubmitTimer(null);
    }

    // Auto-submit only when we have exactly 8 alphanumeric characters (complete code)
    const cleanCode = formatted.replace(/[^A-Z0-9]/g, "");
    console.log("🧹 Clean code:", JSON.stringify(cleanCode), "length:", cleanCode.length);

    if (cleanCode.length === 8) {
      console.log("🎯 8 characters detected - setting timer for auto-submit");
      // Debounce auto-submit to prevent premature submission during typing
      const timer = setTimeout(() => {
        console.log("⚡ Auto-submit timer fired!");
        setIsAutoSubmitting(true);
        setTimeout(() => {
          console.log(
            "📤 Calling handleManualVerification with formatted code:",
            JSON.stringify(formatted)
          );
          handleManualVerification(formatted);
          setIsAutoSubmitting(false);
        }, 100);
      }, 500); // Wait 500ms after user stops typing

      setAutoSubmitTimer(timer);
    } else {
      console.log("❌ Not 8 characters, no auto-submit");
    }
  };

  const handleDeny = async () => {
    if (!userCodeParam) return;

    setVerificationState("loading");

    try {
      await client.api.identityDeviceDenyCreate({
        userCode: userCodeParam.toUpperCase(),
      });

      setVerificationState("error");
      setErrorMessage("Device access has been denied.");

      setTimeout(() => {
        if (window.opener) {
          window.close();
        }
      }, 2000);
    } catch (error) {
      setErrorMessage("Failed to deny device access");
      setVerificationState("error");
    }
  };

  const renderContent = () => {
    switch (verificationState) {
      case "loading":
        return (
          <>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight={500}>
              Verifying device...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your device access.
            </Typography>
          </>
        );

      case "success":
        return (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                mb: 2,
              }}
            >
              <Check size={40} color="white" />
            </Box>
            <Typography variant="h5" fontWeight={600} color="#4caf50" sx={{ mb: 1 }}>
              Success!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Device has been successfully authorized.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can now close this browser window and return to your application.
            </Typography>
            {userCodeParam && <UserCodeDisplay>{userCodeParam}</UserCodeDisplay>}
          </>
        );

      case "error":
        return (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#f44336",
                mb: 2,
              }}
            >
              <X size={40} color="white" />
            </Box>
            <Typography variant="h5" fontWeight={600} color="#f44336" sx={{ mb: 1 }}>
              Verification Failed
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please check the code and try again, or contact support if the problem persists.
            </Typography>
            {lastTriedCode && <UserCodeDisplay>{lastTriedCode}</UserCodeDisplay>}
            <ErrorButton onClick={handleTryAgain} variant="contained" fullWidth>
              Try Again
            </ErrorButton>
          </>
        );

      case "input":
        return (
          <>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
              Authorize Device
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter the code displayed on your device to authorize access:
            </Typography>
            <TextField
              label={isAutoSubmitting ? "Submitting..." : "Device Code"}
              value={userCode}
              onChange={handleUserCodeChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userCode.trim() && !isAutoSubmitting) {
                  handleManualVerification();
                }
              }}
              placeholder="XXXX-XXXX"
              disabled={isAutoSubmitting}
              fullWidth
              sx={{
                mb: 3,
                ...(isAutoSubmitting && {
                  "& .MuiInputBase-root": {
                    backgroundColor: "#f5f5f5",
                  },
                }),
              }}
              slotProps={{
                htmlInput: {
                  style: {
                    textAlign: "center",
                    fontSize: "1.2rem",
                    letterSpacing: "0.1em",
                  },
                  maxLength: 9, // 4 chars + dash + 4 chars
                },
              }}
            />
            <SuccessButton
              onClick={handleButtonClick}
              variant="contained"
              fullWidth
              disabled={!userCode.trim() || isAutoSubmitting}
            >
              {isAutoSubmitting ? "Submitting..." : "Authorize Device"}
            </SuccessButton>
          </>
        );

      case "pending":
        return (
          <>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
              Authorize Device
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Do you want to authorize this device?
            </Typography>
            {userCodeParam && <UserCodeDisplay>{userCodeParam}</UserCodeDisplay>}
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <SuccessButton
                onClick={() => userCodeParam && handleVerification(userCodeParam)}
                variant="contained"
                fullWidth
              >
                Authorize
              </SuccessButton>
              <ErrorButton onClick={handleDeny} variant="contained" fullWidth>
                Deny
              </ErrorButton>
            </Box>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <VerifyContainer>
      <StyledForm>
        <LogoRow>
          <Logo src="/images/logo.svg" alt="LeadCMS Logo" />
          <Typography variant="h6" fontWeight={500}>
            LeadCMS
          </Typography>
        </LogoRow>
        {renderContent()}
      </StyledForm>
    </VerifyContainer>
  );
};
