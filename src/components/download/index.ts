export const downloadFile = (data: string, contentType?: string, fileName?: string) => {
  // Create a Blob with the data
  const blob = new Blob([data], { type: contentType ?? "text/csv" });

  // Create a Blob URL and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName ?? "export.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function downloadExportFile(blob: Blob, format: string, filename = "export"): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
