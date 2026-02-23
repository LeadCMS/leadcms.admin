import { NotificationsService } from "@hooks";

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
 * Shape thrown by wrapApiClient (flat ApiError).
 * Also covers legacy shapes where the error may be nested.
 */
interface ApiErrorLike {
  status?: number;
  title?: string;
  message?: string;
  errors?: Record<string, string[]>;
  // Legacy shapes
  data?: {
    errors?: Record<string, string[]>;
    title?: string;
    message?: string;
    error?: {
      title?: string;
      errors?: Record<string, string[]>;
    };
  };
  error?: {
    status?: number;
    title?: string;
    message?: string;
    errors?: Record<string, string[]>;
  };
  // fetch Response-like
  body?: { detail?: string };
}

/**
 * Extract field-level validation errors into
 * readable "Field: message" strings.
 */
export function formatValidationErrors(errors: Record<string, string[]>): string[] {
  const formatted: string[] = [];
  Object.entries(errors).forEach(([field, msgs]) => {
    if (Array.isArray(msgs)) {
      msgs.forEach((msg) => {
        formatted.push(msg.startsWith(`${field}:`) ? msg : `${field}: ${msg}`);
      });
    }
  });
  return formatted;
}

/**
 * Resolve the validation-errors record from whichever
 * nesting level it lives in.
 */
function resolveErrors(err: ApiErrorLike): Record<string, string[]> | undefined {
  return (
    err.errors || err.error?.errors || err.data?.errors || err.data?.error?.errors || undefined
  );
}

/**
 * Resolve a human-readable title / message from whichever
 * nesting level it lives in.
 */
function resolveMessage(err: ApiErrorLike, fallback: string): string {
  return (
    err.title ||
    err.error?.title ||
    err.data?.error?.title ||
    err.data?.title ||
    err.message ||
    err.error?.message ||
    err.data?.message ||
    err.body?.detail ||
    fallback
  );
}

/**
 * Parse any caught error into a structured object with
 * a user-friendly `message` and optional `details` array.
 *
 * Works with:
 *  - `ApiError` thrown by `wrapApiClient`
 *  - Legacy `{ data: { error: { … } } }` shapes
 *  - Plain `Error` instances
 *  - Strings
 */
export function parseApiError(
  error: unknown,
  defaultMessage = "An error occurred. Please try again."
): ParsedApiError {
  if (!error) {
    return { message: defaultMessage, details: [] };
  }

  if (typeof error === "string") {
    return { message: error, details: [] };
  }

  if (error instanceof Error && !("status" in error)) {
    return { message: error.message, details: [] };
  }

  const err = error as ApiErrorLike;
  const status = err.status || err.error?.status;
  const validationErrors = resolveErrors(err);
  const title = resolveMessage(err, defaultMessage);
  const details: string[] = [];

  if (status === 0) {
    return {
      message: "Network error: Please check your internet connection",
      details: [],
      status: 0,
      title: "Network Error",
    };
  }

  if (validationErrors && Object.keys(validationErrors).length > 0) {
    details.push(...formatValidationErrors(validationErrors));
    // Use a clean title without the appended details that
    // wrapApiClient adds to `message`.
    const cleanTitle =
      err.title ||
      err.error?.title ||
      err.data?.error?.title ||
      err.data?.title ||
      "Validation failed";
    return { message: cleanTitle, details, status, title: cleanTitle };
  }

  return { message: title, details, status, title };
}

/**
 * One-liner error handler for catch blocks.
 *
 * Shows a toast with the error message. When field-level
 * validation details are present the toast is clickable and
 * opens the error-details modal.
 *
 * @example
 * ```ts
 * } catch (error) {
 *   showApiError(
 *     error,
 *     notificationsService,
 *     showErrorModal,
 *     "Failed to save template",
 *   );
 * }
 * ```
 */
export function showApiError(
  error: unknown,
  notificationsService: NotificationsService,
  showErrorModal?: (value: string[]) => void,
  defaultMessage = "An error occurred. Please try again."
): ParsedApiError {
  const parsed = parseApiError(error, defaultMessage);

  if (parsed.details.length > 0 && showErrorModal) {
    const issueWord = parsed.details.length === 1 ? "issue" : "issues";
    const detailsCopy = [parsed.message, ...parsed.details];
    notificationsService.error(
      `${parsed.message} (${parsed.details.length} ${issueWord} — click for details)`,
      { onClick: () => showErrorModal(detailsCopy) }
    );
  } else {
    notificationsService.error(parsed.message);
  }

  return parsed;
}

/**
 * Error callback for `notificationsService.promise()`.
 *
 * Returns an `ErrorData`-compatible object with `title` and an
 * optional `onClick` that opens the error-details modal.
 *
 * @example
 * ```ts
 * notificationsService.promise(apiCall(), {
 *   pending: "Saving...",
 *   success: "Saved",
 *   error: (err) => toPromiseError(
 *     err, showErrorModal, "Unable to save",
 *   ),
 * });
 * ```
 */
export function toPromiseError(
  error: unknown,
  showErrorModal?: (value: string[]) => void,
  defaultMessage = "An error occurred."
): { title: string; onClick?: () => void } {
  const parsed = parseApiError(error, defaultMessage);

  const errDetails: string[] = [];
  if (parsed.title && parsed.title !== parsed.message) {
    errDetails.push(parsed.title);
  }
  errDetails.push(...parsed.details);

  return {
    title: parsed.message,
    onClick: errDetails.length > 0 && showErrorModal ? () => showErrorModal(errDetails) : undefined,
  };
}
