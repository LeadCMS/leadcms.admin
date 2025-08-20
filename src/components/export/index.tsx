import { useEffect, useRef } from "react";
import { downloadExportFile, downloadFile } from "components/download";
import { useNotificationsService } from "@hooks";
import { ExportParams } from "types";

interface ExportPorps {
  exportAsync: (accept: string) => Promise<string>;
  closeExport: () => void;
  fileName: string;
}

export const CsvExport = ({ exportAsync, closeExport, fileName }: ExportPorps) => {
  const didExportRef = useRef(false);
  const { notificationsService } = useNotificationsService();

  useEffect(() => {
    if (!didExportRef.current) {
      const exportFile = async () => {
        try {
          const response = await exportAsync("text/csv");
          downloadFile(response, "text/csv", `${fileName}.csv`);
          closeExport();
        } catch (error) {
          notificationsService.error("Server error occurred.");
        }
      };
      exportFile();
      didExportRef.current = true;
    }
  }, []);

  return <></>;
};

export async function genericExportHandler(
  params: ExportParams,
  exportApiCall: (finalQueryString: string, accept: string) => Promise<Response>,
  moduleName: string
): Promise<void> {
  try {
    const { finalQueryString, accept } = buildExportQueryString(params);
    const response = await exportApiCall(finalQueryString, accept);
    const blob = await response.blob();
    downloadExportFile(blob, params.format, moduleName);
  } catch (error) {
    console.error(error);
  }
}

export function buildExportQueryString({
  scope,
  format,
  cols,
  selectedRows,
  whereFilterQuery,
  basicFilterQuery,
  searchTerm,
}: ExportParams): {
  finalQueryString: string;
  accept: string;
} {
  const fieldQuery = cols.map((c) => `filter[field][${c}]=true`).join("&");

  let finalQueryString = "";

  if (scope === "filtered" && whereFilterQuery && whereFilterQuery.startsWith("&")) {
    if (searchTerm && searchTerm.trim() !== "") {
      finalQueryString += `${searchTerm}`;
    }

    finalQueryString += "&" + fieldQuery;

    finalQueryString += whereFilterQuery;
    if (basicFilterQuery) {
      finalQueryString += "&" + basicFilterQuery.replace(/^&/, "");
    }
  } else {
    let queryParts: string[] = [];

    if (scope === "all") {
      queryParts = [fieldQuery, ...(basicFilterQuery ? [basicFilterQuery] : [])];
    } else if (scope === "filtered") {
      queryParts = [
        ...(searchTerm && searchTerm.trim() !== "" ? [searchTerm] : []),
        fieldQuery,
        ...(whereFilterQuery ? [whereFilterQuery] : []),
        ...(basicFilterQuery ? [basicFilterQuery] : []),
      ];
    } else if (scope === "selected") {
      const idsQuery = selectedRows.length ? `filter[ids]=${selectedRows.join(",")}` : "";

      queryParts = [
        fieldQuery,
        ...(idsQuery ? [idsQuery] : []),
        ...(basicFilterQuery ? [basicFilterQuery] : []),
      ];
    }

    finalQueryString = "&" + queryParts.filter(Boolean).join("&");
  }
  const accept = format === "csv" ? "text/csv" : format === "json" ? "text/json" : "*/*";

  return {
    finalQueryString,
    accept,
  };
}
