import { FormikHelpers } from "formik";
import { NotificationsService } from "@hooks";
import { networkErrorToStringArray } from "./general-helper";
import { handleFormError, ErrorResponse } from "./error-handler";

export async function execSubmitWithToast<T>(
  values: T,
  helpers: FormikHelpers<T>,
  submitFunc: (values: T, helpers: FormikHelpers<T>) => Promise<void>,
  notificationsService: NotificationsService,
  showErrorModalFunc: (value: string[]) => void,
  entityName: string,
  options?: {
    fieldMapping?: Record<string, string>;
    customValidationErrorMessage?: string;
  }
): Promise<void> {
  const nameWithCapFirstLetter =
    entityName.charAt(0).toUpperCase() + entityName.slice(1).toLowerCase();
  const nameWithMinFirstLetter = entityName.toLowerCase();

  notificationsService.promise(submitFunc(values, helpers), {
    pending: `Saving ${nameWithMinFirstLetter}...`,
    success: `${nameWithCapFirstLetter} saved successfully`,
    error: (error: unknown) => {
      // Cast error to the expected structure for type safety
      const httpError = error as ErrorResponse;

      // Try to handle validation errors first using the generic error handler
      const handleValidationErrors = async () => {
        try {
          await handleFormError(error, {
            formik: helpers,
            notificationsService,
            fieldMapping: options?.fieldMapping || {},
            customErrorMessage: options?.customValidationErrorMessage,
            showGenericError: false, // We'll handle generic errors below
          });
          return true; // Validation errors were handled
        } catch {
          return false; // Not validation errors or couldn't handle them
        }
      };

      // Check if this is a validation error that we can handle
      if (httpError?.status === 422 || httpError?.status === 400) {
        handleValidationErrors();
        // Still show the error modal for details
      }

      // Prepare error details for the modal and toast
      const errMessage = `Unable to save ${entityName}. An error occurred.`;
      const errDetails: string[] = [];

      if (httpError?.data?.error?.title) {
        errDetails.push(httpError.data.error.title);
      }
      if (httpError?.data?.message) {
        errDetails.push(httpError.data.message);
      }
      if (httpError?.data?.error?.errors) {
        errDetails.push(...networkErrorToStringArray(httpError.data.error.errors));
      }

      return {
        title: errMessage,
        onClick:
          errDetails.length > 0
            ? () => {
                showErrorModalFunc(errDetails);
              }
            : undefined,
      };
    },
  });
}
