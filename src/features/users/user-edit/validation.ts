import zod from "zod";
import { PasswordPolicySettings } from "@hooks";

export const createUserEditValidationScheme = (policy?: PasswordPolicySettings) => {
  return zod
    .object({
      displayName: zod.string(),
      email: zod.string().email(),
      userName: zod.string(),
      password: zod.string().optional().nullable(),
      generatePassword: zod.boolean().optional(),
      sendPasswordEmail: zod.boolean().optional(),
      language: zod.string().optional(),
      avatarUrl: zod.string().optional().nullable(),
    })
    .refine(
      (data) => {
        // If generatePassword is true, password validation is skipped
        if (data.generatePassword) {
          return true;
        }

        // If no password provided, validation passes
        if (!data.password || data.password.length === 0) {
          return true;
        }

        // If policy is not available, use basic validation
        if (!policy) {
          return data.password.length >= 8;
        }

        // Validate against policy
        const password = data.password;

        // Check length
        if (password.length < policy.requiredLength) {
          return false;
        }

        // Check unique characters
        const uniqueChars = new Set(password).size;
        if (uniqueChars < policy.requiredUniqueChars) {
          return false;
        }

        // Check digit requirement
        if (policy.requireDigit && !/\d/.test(password)) {
          return false;
        }

        // Check uppercase requirement
        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
          return false;
        }

        // Check lowercase requirement
        if (policy.requireLowercase && !/[a-z]/.test(password)) {
          return false;
        }

        // Check non-alphanumeric requirement
        if (policy.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(password)) {
          return false;
        }

        return true;
      },
      (data) => {
        if (data.generatePassword || !data.password || data.password.length === 0) {
          return { message: "", path: ["password"] };
        }

        if (!policy) {
          return {
            message: "Password must be at least 8 characters long",
            path: ["password"],
          };
        }

        const password = data.password;
        const errors: string[] = [];

        if (password.length < policy.requiredLength) {
          errors.push(`Password must be at least ${policy.requiredLength} characters long`);
        }

        const uniqueChars = new Set(password).size;
        if (uniqueChars < policy.requiredUniqueChars) {
          errors.push(
            `Password must contain at least ${policy.requiredUniqueChars} unique characters`
          );
        }

        if (policy.requireDigit && !/\d/.test(password)) {
          errors.push("Password must contain at least one digit (0-9)");
        }

        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
          errors.push("Password must contain at least one uppercase letter (A-Z)");
        }

        if (policy.requireLowercase && !/[a-z]/.test(password)) {
          errors.push("Password must contain at least one lowercase letter (a-z)");
        }

        if (policy.requireNonAlphanumeric && !/[^a-zA-Z0-9]/.test(password)) {
          errors.push("Password must contain at least one special character");
        }

        return {
          message: errors[0] || "Password does not meet requirements",
          path: ["password"],
        };
      }
    );
};

// For backward compatibility
export const UserEditValidationScheme = createUserEditValidationScheme();
