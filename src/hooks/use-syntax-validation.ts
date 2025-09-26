import { useState, useEffect, useMemo, useCallback } from "react";
import { validateContentSyntax, SyntaxValidationResult } from "@utils/syntax-validators";

interface UseSyntaxValidationOptions {
  content: string;
  format: string;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseSyntaxValidationResult extends SyntaxValidationResult {
  isValidating: boolean;
}

/**
 * Hook to validate content syntax with debounced validation
 * Handles both sync and async validation (for MDX)
 */
export const useSyntaxValidation = ({
  content,
  format,
  enabled = true,
  debounceMs = 300,
}: UseSyntaxValidationOptions): UseSyntaxValidationResult => {
  const [validationResult, setValidationResult] = useState<SyntaxValidationResult>({
    isValid: true,
  });
  const [isValidating, setIsValidating] = useState(false);

  const validateContent = useCallback(async () => {
    if (!enabled || !content.trim()) {
      setValidationResult({ isValid: true });
      setIsValidating(false);
      return;
    }

    setIsValidating(true);

    try {
      const result = validateContentSyntax(content, format);

      // Handle both sync and async validation results
      if (result instanceof Promise) {
        const asyncResult = await result;
        setValidationResult(asyncResult);
      } else {
        setValidationResult(result);
      }
    } catch (error) {
      // Fallback error handling
      setValidationResult({
        isValid: false,
        error: {
          message: "Validation failed",
          type: format.toLowerCase() as "json" | "yaml" | "mdx",
        },
      });
    } finally {
      setIsValidating(false);
    }
  }, [content, format, enabled]);

  // Debounced validation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateContent();
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      setIsValidating(false);
    };
  }, [validateContent, debounceMs]);

  return useMemo(
    () => ({
      ...validationResult,
      isValidating,
    }),
    [validationResult, isValidating]
  );
};

/**
 * Hook to validate content syntax and prevent form submission when invalid
 */
export const useSyntaxValidationFormik = ({
  content,
  format,
  enabled = true,
}: Omit<UseSyntaxValidationOptions, "debounceMs">) => {
  const validation = useSyntaxValidation({ content, format, enabled, debounceMs: 100 });

  return {
    ...validation,
    // Generate a Formik-compatible error message
    error: validation.isValid ? undefined : validation.error?.message || "Syntax error",
    // Helper to check if should prevent save
    shouldPreventSave: !validation.isValid && !validation.isValidating,
  };
};
