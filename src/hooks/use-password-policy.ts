import { useState, useEffect } from "react";
import { useRequestContext } from "@providers/request-provider";
import { SettingDetailsDto } from "@lib/network/swagger-client";

export interface PasswordPolicySettings {
  requireDigit: boolean;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNonAlphanumeric: boolean;
  requiredLength: number;
  requiredUniqueChars: number;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  requirements: {
    length: { met: boolean; required: number };
    uniqueChars: { met: boolean; required: number };
    digit: { met: boolean; required: boolean };
    uppercase: { met: boolean; required: boolean };
    lowercase: { met: boolean; required: boolean };
    nonAlphanumeric: { met: boolean; required: boolean };
  };
}

const DEFAULT_POLICY: PasswordPolicySettings = {
  requireDigit: true,
  requireUppercase: true,
  requireLowercase: true,
  requireNonAlphanumeric: true,
  requiredLength: 8,
  requiredUniqueChars: 1,
};

export const usePasswordPolicy = () => {
  const { client } = useRequestContext();
  const [policy, setPolicy] = useState<PasswordPolicySettings>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await client.api.settingsSystemList();
        const settings = response.data;

        if (settings) {
          const newPolicy: PasswordPolicySettings = { ...DEFAULT_POLICY };

          settings.forEach((setting: SettingDetailsDto) => {
            switch (setting.key) {
              case "Identity.RequireDigit":
                newPolicy.requireDigit = setting.value === "true";
                break;
              case "Identity.RequireUppercase":
                newPolicy.requireUppercase = setting.value === "true";
                break;
              case "Identity.RequireLowercase":
                newPolicy.requireLowercase = setting.value === "true";
                break;
              case "Identity.RequireNonAlphanumeric":
                newPolicy.requireNonAlphanumeric = setting.value === "true";
                break;
              case "Identity.RequiredLength":
                newPolicy.requiredLength = parseInt(setting.value || "8", 10);
                break;
              case "Identity.RequiredUniqueChars":
                newPolicy.requiredUniqueChars = parseInt(setting.value || "1", 10);
                break;
            }
          });

          setPolicy(newPolicy);
        }
      } catch (err) {
        setError("Failed to load password policy settings");
        console.error("Password policy loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPolicy();
  }, [client]);

  const validatePassword = (password: string): PasswordValidationResult => {
    const errors: string[] = [];
    const uniqueChars = new Set(password).size;

    const requirements = {
      length: {
        met: password.length >= policy.requiredLength,
        required: policy.requiredLength,
      },
      uniqueChars: {
        met: uniqueChars >= policy.requiredUniqueChars,
        required: policy.requiredUniqueChars,
      },
      digit: {
        met: policy.requireDigit ? /\d/.test(password) : true,
        required: policy.requireDigit,
      },
      uppercase: {
        met: policy.requireUppercase ? /[A-Z]/.test(password) : true,
        required: policy.requireUppercase,
      },
      lowercase: {
        met: policy.requireLowercase ? /[a-z]/.test(password) : true,
        required: policy.requireLowercase,
      },
      nonAlphanumeric: {
        met: policy.requireNonAlphanumeric ? /[^a-zA-Z0-9]/.test(password) : true,
        required: policy.requireNonAlphanumeric,
      },
    };

    // Generate error messages
    if (!requirements.length.met) {
      errors.push(`Password must be at least ${policy.requiredLength} characters long`);
    }
    if (!requirements.uniqueChars.met) {
      errors.push(`Password must contain at least ${policy.requiredUniqueChars} unique characters`);
    }
    if (!requirements.digit.met) {
      errors.push("Password must contain at least one digit (0-9)");
    }
    if (!requirements.uppercase.met) {
      errors.push("Password must contain at least one uppercase letter (A-Z)");
    }
    if (!requirements.lowercase.met) {
      errors.push("Password must contain at least one lowercase letter (a-z)");
    }
    if (!requirements.nonAlphanumeric.met) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
      requirements,
    };
  };

  const getPasswordHelperText = (): string => {
    const parts: string[] = [];

    parts.push(`minimum ${policy.requiredLength} characters`);

    if (policy.requiredUniqueChars > 1) {
      parts.push(`${policy.requiredUniqueChars} unique characters`);
    }

    const requirements: string[] = [];
    if (policy.requireDigit) requirements.push("digit");
    if (policy.requireUppercase) requirements.push("uppercase");
    if (policy.requireLowercase) requirements.push("lowercase");
    if (policy.requireNonAlphanumeric) requirements.push("special character");

    if (requirements.length > 0) {
      parts.push(requirements.join(", "));
    }

    return `Enter a password (${parts.join(", ")})`;
  };

  return {
    policy,
    loading,
    error,
    validatePassword,
    getPasswordHelperText,
  };
};
