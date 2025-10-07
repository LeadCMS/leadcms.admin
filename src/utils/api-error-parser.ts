/**
 * Structured API error information
 */
export interface ParsedApiError {
  message: string;
  details: string[];
  status?: number;
  title?: string;
}

/**
 * API error structure from the backend
 */
interface ApiErrorResponse {
  status?: number;
  message?: string;
  data?: {
    errors?: Record<string, string[]>;
    title?: string;
    type?: string;
  };
  error?: {
    status?: number;
    title?: string;
    message?: string;
    errors?: Record<string, string[]>;
    data?: {
      errors?: Record<string, string[]>;
      title?: string;
      type?: string;
    };
  };
}

/**
 * Parse API errors into a structured format with message and details
 * Handles various error response structures from the backend
 *
 * @param error - The error object from the API
 * @param defaultMessage - Default message if no error message is found
 * @returns Parsed error with message and details array
 */
export function parseApiError(
  error: unknown,
  defaultMessage = "An error occurred. Please try again."
): ParsedApiError {
  const apiError = error as ApiErrorResponse;

  let errorMessage = defaultMessage;
  const errorDetails: string[] = [];

  // The API error structure can be: { error: { status, errors, title } } or flat
  const actualError = (apiError.error || apiError) as typeof apiError.error;
  const validationErrors = actualError?.errors || actualError?.data?.errors;

  const status = apiError.status || actualError?.status;
  const title = actualError?.title;

  // Handle network errors
  if (status === 0) {
    errorMessage = "Network error: Please check your internet connection";
  }
  // Handle 422 validation errors
  else if (status === 422 && validationErrors) {
    const allErrors: string[] = [];

    Object.entries(validationErrors).forEach(([field, fieldErrors]) => {
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach((errorMsg) => {
          allErrors.push(`${field}: ${errorMsg}`);
        });
      }
    });

    errorMessage = actualError?.title || "Validation failed";
    errorDetails.push(...allErrors);
  }
  // Handle other API errors
  else if (actualError?.title || actualError?.message || apiError.message) {
    errorMessage = actualError?.title || actualError?.message || apiError.message || errorMessage;
    if (actualError?.title && actualError.message) {
      errorDetails.push(actualError.message);
    }
  }

  return {
    message: errorMessage,
    details: errorDetails,
    status,
    title,
  };
}

/**
 * Format validation errors for display
 * Converts field-level errors into readable messages
 *
 * @param errors - Record of field names to error arrays
 * @returns Array of formatted error messages
 */
export function formatValidationErrors(errors: Record<string, string[]>): string[] {
  const formatted: string[] = [];

  Object.entries(errors).forEach(([field, fieldErrors]) => {
    if (Array.isArray(fieldErrors)) {
      fieldErrors.forEach((errorMsg) => {
        // Remove redundant field name from message if it starts with it
        const cleanMsg = errorMsg.startsWith(`${field}:`) ? errorMsg : `${field}: ${errorMsg}`;
        formatted.push(cleanMsg);
      });
    }
  });

  return formatted;
}
