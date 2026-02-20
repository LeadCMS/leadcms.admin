import React, { useCallback, useEffect, useRef } from "react";
import grapesjs, { Editor } from "grapesjs";
import GjsEditor from "@grapesjs/react";
import gjsMjml from "grapesjs-mjml";
import "grapesjs/dist/css/grapes.min.css";
import { Box } from "@mui/material";

export interface GrapesEmailEditorProps {
  value: string;
  onChange: (mjml: string) => void;
  disabled?: boolean;
  height?: string;
}

const mjmlPluginWithOpts = (editor: Editor) => {
  gjsMjml(editor, {
    resetBlocks: true,
    resetStyleManager: true,
    resetDevices: true,
  });
};

const DEFAULT_MJML = [
  "<mjml>",
  "  <mj-body>",
  "    <mj-section>",
  "      <mj-column>",
  "        <mj-text>Start editing here</mj-text>",
  "      </mj-column>",
  "    </mj-section>",
  "  </mj-body>",
  "</mjml>",
].join("\n");

/**
 * Extract MJML source from GrapesJS editor using grapesjs-mjml
 * plugin's `mjml-code` command.
 */
function getEditorMjml(editor: Editor): string {
  try {
    const mjml = editor.runCommand("mjml-code");
    if (typeof mjml === "string" && mjml.trim()) {
      return mjml;
    }
  } catch {
    // command not available yet
  }
  return "";
}

export const GrapesEmailEditor: React.FC<GrapesEmailEditorProps> = ({
  value,
  onChange,
  disabled = false,
  height = "calc(100vh - 300px)",
}) => {
  const editorRef = useRef<Editor | null>(null);
  const suppressUpdateRef = useRef(false);
  const lastExternalValue = useRef(value);

  const onEditorReady = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      const content = value && value.trim() ? value : DEFAULT_MJML;
      suppressUpdateRef.current = true;
      editor.setComponents(content);
      suppressUpdateRef.current = false;

      if (disabled) {
        editor.getModel().set("draftMode", true);
      }

      const emitChange = () => {
        if (suppressUpdateRef.current) return;
        const mjml = getEditorMjml(editor);
        if (mjml) {
          onChange(mjml);
        }
      };

      editor.on("update", emitChange);
      editor.on("component:update", emitChange);
    },
    [disabled, onChange, value]
  );

  useEffect(() => {
    if (editorRef.current && value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      suppressUpdateRef.current = true;
      editorRef.current.setComponents(value || DEFAULT_MJML);
      suppressUpdateRef.current = false;
    }
  }, [value]);

  return (
    <Box
      sx={{
        width: "100%",
        height,
        overflow: "hidden",
        ".gjs-one-bg": { background: "transparent" },
        ".gjs-two-color": { color: "inherit" },
      }}
    >
      <GjsEditor
        grapesjs={grapesjs}
        options={{
          height: "100%",
          storageManager: false,
          undoManager: { trackSelection: false },
        }}
        plugins={[mjmlPluginWithOpts]}
        onReady={onEditorReady}
      />
    </Box>
  );
};
