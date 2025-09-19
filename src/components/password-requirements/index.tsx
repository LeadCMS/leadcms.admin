import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Skeleton,
} from "@mui/material";
import { CheckCircle, XCircle } from "lucide-react";
import { PasswordValidationResult, PasswordPolicySettings } from "../../hooks/use-password-policy";

interface PasswordRequirementsProps {
  validation: PasswordValidationResult | null;
  policy: PasswordPolicySettings | null;
  loading?: boolean;
  showRequirementsWhenEmpty?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  validation,
  policy,
  loading = false,
  showRequirementsWhenEmpty = true,
}) => {
  if (!validation && !showRequirementsWhenEmpty) {
    return null;
  }

  // Show skeleton while loading
  if (loading || !policy) {
    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Password Requirements:
        </Typography>
        <List dense sx={{ pt: 0 }}>
          {[1, 2, 3].map((index) => (
            <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 24 }}>
                <Skeleton variant="circular" width={16} height={16} />
              </ListItemIcon>
              <ListItemText primary={<Skeleton variant="text" width="80%" height={16} />} />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }

  const requirements = validation?.requirements || {
    length: { met: false, required: policy.requiredLength },
    uniqueChars: { met: false, required: policy.requiredUniqueChars },
    digit: { met: false, required: policy.requireDigit },
    uppercase: { met: false, required: policy.requireUppercase },
    lowercase: { met: false, required: policy.requireLowercase },
    nonAlphanumeric: { met: false, required: policy.requireNonAlphanumeric },
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Password Requirements:
      </Typography>
      <List dense sx={{ pt: 0 }}>
        <ListItem sx={{ py: 0.25, px: 0 }}>
          <ListItemIcon sx={{ minWidth: 24 }}>
            {requirements.length.met ? (
              <CheckCircle size={16} color="#4caf50" />
            ) : (
              <XCircle size={16} color="#f44336" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={`At least ${requirements.length.required} characters`}
            primaryTypographyProps={{
              variant: "caption",
              color: requirements.length.met ? "success.main" : "error.main",
            }}
          />
        </ListItem>

        {requirements.uniqueChars.required > 1 && (
          <ListItem sx={{ py: 0.25, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 24 }}>
              {requirements.uniqueChars.met ? (
                <CheckCircle size={16} color="#4caf50" />
              ) : (
                <XCircle size={16} color="#f44336" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={`At least ${requirements.uniqueChars.required} unique characters`}
              primaryTypographyProps={{
                variant: "caption",
                color: requirements.uniqueChars.met ? "success.main" : "error.main",
              }}
            />
          </ListItem>
        )}

        {requirements.digit.required && (
          <ListItem sx={{ py: 0.25, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 24 }}>
              {requirements.digit.met ? (
                <CheckCircle size={16} color="#4caf50" />
              ) : (
                <XCircle size={16} color="#f44336" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="At least one digit (0-9)"
              primaryTypographyProps={{
                variant: "caption",
                color: requirements.digit.met ? "success.main" : "error.main",
              }}
            />
          </ListItem>
        )}

        {requirements.uppercase.required && (
          <ListItem sx={{ py: 0.25, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 24 }}>
              {requirements.uppercase.met ? (
                <CheckCircle size={16} color="#4caf50" />
              ) : (
                <XCircle size={16} color="#f44336" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="At least one uppercase letter (A-Z)"
              primaryTypographyProps={{
                variant: "caption",
                color: requirements.uppercase.met ? "success.main" : "error.main",
              }}
            />
          </ListItem>
        )}

        {requirements.lowercase.required && (
          <ListItem sx={{ py: 0.25, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 24 }}>
              {requirements.lowercase.met ? (
                <CheckCircle size={16} color="#4caf50" />
              ) : (
                <XCircle size={16} color="#f44336" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="At least one lowercase letter (a-z)"
              primaryTypographyProps={{
                variant: "caption",
                color: requirements.lowercase.met ? "success.main" : "error.main",
              }}
            />
          </ListItem>
        )}

        {requirements.nonAlphanumeric.required && (
          <ListItem sx={{ py: 0.25, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 24 }}>
              {requirements.nonAlphanumeric.met ? (
                <CheckCircle size={16} color="#4caf50" />
              ) : (
                <XCircle size={16} color="#f44336" />
              )}
            </ListItemIcon>
            <ListItemText
              primary="At least one special character"
              primaryTypographyProps={{
                variant: "caption",
                color: requirements.nonAlphanumeric.met ? "success.main" : "error.main",
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};
