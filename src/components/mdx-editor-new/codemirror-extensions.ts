import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { ConfigDto } from "@lib/network/swagger-client";
import { isCodeEditorLineNumbersEnabled } from "@utils/config-helpers";

/**
 * Creates an extension that hides line numbers using CSS
 */
const hideLineNumbers = (): Extension => {
  return EditorView.theme({
    ".cm-lineNumbers": {
      display: "none !important",
      width: "0 !important",
    },
    ".cm-gutters": {
      display: "none !important",
      width: "0 !important",
    },
    // Also target the specific gutter for line numbers
    ".cm-gutter.cm-lineNumbers": {
      display: "none !important",
      width: "0 !important",
    },
  });
};

/**
 * Build CodeMirror extensions for source mode with conditional line numbers
 * Uses CSS to hide line numbers when disabled in configuration
 */
export const buildSourceModeExtensions = (config: ConfigDto | null): Extension[] => {
  return isCodeEditorLineNumbersEnabled(config) ? [] : [hideLineNumbers()];
};

/**
 * Build CodeMirror extensions for code block editors with conditional line numbers
 * Uses CSS to hide line numbers when disabled in configuration
 */
export const buildCodeBlockExtensions = (
  config: ConfigDto | null,
  additionalExtensions: Extension[] = []
): Extension[] => {
  const extensions = [...additionalExtensions];

  if (!isCodeEditorLineNumbersEnabled(config)) {
    extensions.push(hideLineNumbers());
  }

  return extensions;
};
