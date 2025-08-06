import { useEffect, useRef } from "react";
import { downloadFile } from "components/download";
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

export function buildExportQueryString({
  scope,
  format,
  cols,
  selectedRows,
  whereFilterQuery,
  basicFilterQuery,
}: ExportParams): {
  finalQueryString: string;
  accept: string;
} {
  const fieldQuery = cols.map((c) => `filter[field][${c}]=true`).join("&");

  let finalQueryString = "";

  if (scope === "filtered" && whereFilterQuery && whereFilterQuery.startsWith("&")) {

    finalQueryString = "&" + fieldQuery;

    finalQueryString += whereFilterQuery;
    if (basicFilterQuery) {
      finalQueryString += "&" + basicFilterQuery.replace(/^&/, "");
    }
  }
  else {
    let queryParts: string[] = [];

    if (scope === "all") {
      queryParts = [fieldQuery, ...(basicFilterQuery ? [basicFilterQuery] : [])];
    } else if (scope === "filtered") {
      queryParts = [
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

