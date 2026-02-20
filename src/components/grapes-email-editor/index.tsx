import React, { useCallback, useEffect, useRef } from "react";
import grapesjs, { Editor } from "grapesjs";
import GjsEditor from "@grapesjs/react";
import newsletterPreset from "grapesjs-preset-newsletter";
import "grapesjs/dist/css/grapes.min.css";
import { Box } from "@mui/material";

export interface GrapesEmailEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  height?: string;
}

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * Lightweight HTML formatter that preserves structure
 * with proper indentation and line breaks.
 */
function formatHtml(html: string): string {
  if (!html) return html;

  let result = "";
  let indent = 0;
  const tab = "  ";

  // Normalise: collapse runs of whitespace between tags
  const normalized = html.replace(/>\s+</g, "><").replace(/\n/g, "").trim();

  // Split into tokens (tags and text nodes)
  const tokens = normalized.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g);
  if (!tokens) return html;

  for (const token of tokens) {
    // HTML comment
    if (token.startsWith("<!--")) {
      result += `${tab.repeat(indent)}${token}\n`;
      continue;
    }

    // Closing tag
    if (token.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      result += `${tab.repeat(indent)}${token}\n`;
      continue;
    }

    // Opening or self-closing tag
    if (token.startsWith("<")) {
      const selfClosing = token.endsWith("/>");
      const tagMatch = token.match(/^<(\w+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";
      const isVoid = VOID_ELEMENTS.has(tagName);

      result += `${tab.repeat(indent)}${token}\n`;

      if (!selfClosing && !isVoid) {
        indent++;
      }
      continue;
    }

    // Text node — trim and output at current indent
    const text = token.trim();
    if (text) {
      result += `${tab.repeat(indent)}${text}\n`;
    }
  }

  return result.trimEnd() + "\n";
}

/**
 * Get HTML + CSS from GrapesJS preserving the <style> block.
 * This format round-trips correctly through the editor — GrapesJS
 * can parse the <style> block back into its CSS manager on reload.
 */
function getEditorHtml(editor: Editor): string {
  const html = editor.getHtml();
  const css = editor.getCss();
  const raw = css ? `${html}\n<style>\n${css}\n</style>` : html;
  return formatHtml(raw);
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

      if (value) {
        suppressUpdateRef.current = true;
        editor.setComponents(value);
        suppressUpdateRef.current = false;
      }

      if (disabled) {
        editor.getModel().set("draftMode", true);
      }

      editor.on("update", () => {
        if (suppressUpdateRef.current) return;
        onChange(getEditorHtml(editor));
      });

      editor.on("component:update", () => {
        if (suppressUpdateRef.current) return;
        onChange(getEditorHtml(editor));
      });
    },
    [disabled, onChange, value]
  );

  useEffect(() => {
    if (editorRef.current && value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      suppressUpdateRef.current = true;
      editorRef.current.setComponents(value);
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
          canvas: {
            styles: ["https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"],
          },
        }}
        plugins={[newsletterPreset]}
        onReady={onEditorReady}
      />
    </Box>
  );
};
