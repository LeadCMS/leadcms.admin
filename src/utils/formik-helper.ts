import { FormikHelpers } from "formik";
import { NotificationsService } from "@hooks";
import { toPromiseError } from "./api-error-parser";
import { handleFormError } from "./error-handler";

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
      // Try to handle validation errors and set formik field errors
      handleFormError(error, {
        formik: helpers,
        notificationsService,
        fieldMapping: options?.fieldMapping || {},
        customErrorMessage: options?.customValidationErrorMessage,
        showGenericError: false,
      });

      return toPromiseError(
        error,
        showErrorModalFunc,
        `Unable to save ${entityName}. An error occurred.`
      );
    },
  });
}
