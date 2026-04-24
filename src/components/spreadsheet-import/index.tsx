import { CircularProgress } from "@mui/material";
import { Fragment, lazy, Suspense, useState } from "react";
import { Result } from "react-spreadsheet-import/types/types";
import { StyledBackdrop } from "./index.styled";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { showApiError } from "@utils/api-error-parser";
import { getImportFields } from "utils/import-file-helper";

const ReactSpreadsheetImport = lazy(() =>
  import("react-spreadsheet-import").then((m) => ({ default: m.ReactSpreadsheetImport }))
);

interface csvImportPorps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileData: any) => void;
  object: any;
  endRoute: string;
}

export const CsvImport = ({ isOpen, onClose, onUpload, object, endRoute }: csvImportPorps) => {
  const handleNavigation = useCoreModuleNavigation();
  const { notificationsService } = useNotificationsService();
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (data: Result<string>) => {
    try {
      if (data.validData.length === 0) {
        throw new Error("No valid data selected.");
      }
      setIsUploading(true);
      await onUpload(data);
      handleSuccess();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Error when importing data.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSuccess = () => {
    notificationsService.success("Data import completed.");
    handleNavigation(endRoute);
  };

  return (
    <Fragment key={"spreadsheet-import"}>
      <Suspense fallback={null}>
        <ReactSpreadsheetImport
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          fields={getImportFields(object)}
        />
      </Suspense>
      <StyledBackdrop open={isUploading}>
        <CircularProgress color="inherit" />
      </StyledBackdrop>
    </Fragment>
  );
};
