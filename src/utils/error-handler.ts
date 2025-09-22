import { FormikHelpers } from "formik";
import { NotificationsService } from "@hooks";

export interface ValidationError {
  [fieldName: string]: string[];
}

export interface ErrorResponse {
  status?: number;
  data?: {
    error?: {
      title?: string;
      errors?: ValidationError;
    };
    message?: string;
    errors?: ValidationError;
  };
}

export interface FormikErrorHandlerOptions<T> {
  formik?: FormikHelpers<T>;
  notificationsService: NotificationsService;
  fieldMapping?: Record<string, string>; // Maps server field names to form field names
  customErrorMessage?: string;
  showGenericError?: boolean;
}

/**
 * Generic error handler that processes API errors and handles validation errors
 * @param error - The error object from the API
 * @param options - Configuration options for error handling
 * @returns Whether the error was handled (true) or should be re-thrown (false)
 */
export async function handleFormError<T>(
  error: unknown,
  options: FormikErrorHandlerOptions<T>
): Promise<boolean> {
  const { notificationsService, customErrorMessage, showGenericError = true } = options;

  // Handle Response objects (from fetch API)
  if (error instanceof Response) {
    return await handleResponseError(error, options);
  }

  // Handle structured error objects
  const httpError = error as ErrorResponse;

  if (httpError?.status === 422 || httpError?.status === 400) {
    return handleValidationError(httpError, options);
  }

  // Show generic error if requested
  if (showGenericError) {
    notificationsService.error(customErrorMessage || "An error occurred. Please try again.");
  }

  return false; // Error not fully handled, caller should decide
}

/**
 * Handles Response objects (from fetch API) that contain validation errors
 */
async function handleResponseError<T>(
  response: Response,
  options: FormikErrorHandlerOptions<T>
): Promise<boolean> {
  const { notificationsService, customErrorMessage } = options;

  if (response.status === 422) {
    try {
      const errorData = await response.json();
      const validationErrors = errorData?.errors;

      if (validationErrors) {
        setFormValidationErrors(validationErrors, options);
        notificationsService.error(
          customErrorMessage || "Validation errors occurred. Please check the form."
        );
        return true;
      }
    } catch (parseError) {
      console.error("Failed to parse validation error response:", parseError);
    }
  }

  // Show generic error for non-validation errors or if parsing fails
  notificationsService.error(customErrorMessage || "An error occurred. Please try again.");
  return true;
}

/**
 * Handles structured error objects with validation errors
 */
function handleValidationError<T>(
  httpError: ErrorResponse,
  options: FormikErrorHandlerOptions<T>
): boolean {
  const { notificationsService, customErrorMessage } = options;

  // Extract validation errors from different possible locations
  const validationErrors = httpError.data?.error?.errors || httpError.data?.errors;

  if (validationErrors) {
    setFormValidationErrors(validationErrors, options);

    notificationsService.error(
      customErrorMessage || "Validation errors occurred. Please check the form."
    );
    return true;
  }

  return false;
}

/**
 * Sets validation errors on the formik form
 */
function setFormValidationErrors<T>(
  validationErrors: ValidationError,
  options: FormikErrorHandlerOptions<T>
): void {
  const { formik, fieldMapping = {} } = options;

  if (!formik) return;

  Object.entries(validationErrors).forEach(([serverFieldName, errors]) => {
    // Map server field name to form field name
    const formFieldName = fieldMapping[serverFieldName] || serverFieldName.toLowerCase();

    if (errors && errors.length > 0) {
      formik.setFieldError(formFieldName, errors.join(", "));
      formik.setFieldTouched(formFieldName, true);
    }
  });
}

/**
 * Specialized error handler for draft save operations
 */
export async function handleDraftSaveError<T>(
  error: unknown,
  options: Omit<FormikErrorHandlerOptions<T>, "customErrorMessage">
): Promise<void> {
  const handled = await handleFormError(error, {
    ...options,
    customErrorMessage: "Draft save failed due to validation errors. Please check the form.",
    showGenericError: false, // We'll handle the generic case ourselves
  });

  if (!handled) {
    // Show generic error for non-validation errors
    options.notificationsService.error("Failed to save draft. Please try again.");
  }
}

/**
 * Enhanced version of the submit error handler with better validation error handling
 */
export async function handleSubmitError<T>(
  error: unknown,
  formikHelpers: FormikHelpers<T>,
  options: Omit<FormikErrorHandlerOptions<T>, "formik">
): Promise<void> {
  const handled = await handleFormError(error, {
    ...options,
    formik: formikHelpers,
    showGenericError: false, // Let the caller decide on generic errors
  });

  if (await handled) {
    // Trigger validation to ensure errors are displayed
    await formikHelpers.validateForm();
  }

  // Always re-throw the error so toast handler can process it
  throw error;
}
