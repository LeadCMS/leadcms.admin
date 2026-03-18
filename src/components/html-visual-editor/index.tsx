import React, { useCallback, useEffect, useRef } from "react";
import { Box, IconButton, Divider, Tooltip } from "@mui/material";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react";

export interface HtmlVisualEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  height?: string;
}

/* Protect <%...%> tokens from DOM encoding */
function protectTokens(html: string): string {
  return html.replace(/<%([\s\S]+?)%>/g, (_, v: string) => {
    const safe = v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    const disp = v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return (
      `<span class="tmpl-var" data-tmpl="${safe}"` +
      ` contenteditable="false">&lt;%${disp}%&gt;</span>`
    );
  });
}

/* Restore <%...%> tokens from placeholder spans */
function restoreTokens(html: string): string {
  // eslint-disable-next-line max-len
  const re = /<span\b[^>]*\bdata-tmpl="([^"]*)"[^>]*>[\s\S]*?<\/span>/gi;
  return html.replace(re, (_, v: string) => {
    // eslint-disable-next-line quotes
    const r = v.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    return `<%${r}%>`;
  });
}

/* Add newlines between block-level elements */
function formatHtml(html: string): string {
  const bt =
    "address|article|aside|blockquote|details|dd|div|dl|dt|" +
    "fieldset|figcaption|figure|footer|form|h[1-6]|header|" +
    "hr|li|main|nav|ol|p|pre|section|summary|table|" +
    "tbody|td|tfoot|th|thead|tr|ul";

  let r = html;
  r = r.replace(new RegExp(`(<(?:${bt})[\\s>/])`, "gi"), "\n$1");
  r = r.replace(new RegExp(`(</(?:${bt})>)`, "gi"), "$1\n");
  r = r.replace(/(<br\s*\/?>)/gi, "$1\n");
  r = r.replace(/\n{3,}/g, "\n\n");

  return r
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

const IFRAME_STYLES = [
  "body {",
  "  font-family: -apple-system, BlinkMacSystemFont,",
  "    Segoe UI, Roboto, Helvetica, Arial, sans-serif;",
  "  font-size: 14px;",
  "  line-height: 1.6;",
  "  padding: 16px;",
  "  margin: 0;",
  "  color: #333;",
  "}",
  ".tmpl-var {",
  "  background: #e3f2fd;",
  "  padding: 0 3px;",
  "  border-radius: 2px;",
  "  font-family: monospace;",
  "  white-space: nowrap;",
  "  border: 1px solid #90caf9;",
  "  cursor: default;",
  "  user-select: none;",
  "}",
].join("\n");

const TOOLBAR_H = 40;
const ICO = 16;

export const HtmlVisualEditor: React.FC<HtmlVisualEditorProps> = ({
  value,
  onChange,
  disabled = false,
  height = "calc(100vh - 300px)",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initializedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastValueRef = useRef(value);

  const getDoc = useCallback(() => {
    return iframeRef.current?.contentDocument ?? null;
  }, []);

  const extractAndEmit = useCallback(() => {
    const doc = getDoc();
    if (!doc?.body) return;
    const raw = doc.body.innerHTML;
    const restored = restoreTokens(raw);
    const formatted = formatHtml(restored);
    lastValueRef.current = formatted;
    onChangeRef.current(formatted);
  }, [getDoc]);

  // Initialize the iframe editor
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || initializedRef.current) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    initializedRef.current = true;

    const body = protectTokens(value);
    doc.open();
    doc.write(
      "<!DOCTYPE html><html><head>" +
        `<style>${IFRAME_STYLES}</style>` +
        `</head><body>${body}</body></html>`
    );
    doc.close();

    if (!disabled) {
      doc.designMode = "on";
    }

    const handleInput = () => extractAndEmit();
    doc.addEventListener("input", handleInput);
    return () => {
      doc.removeEventListener("input", handleInput);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    const doc = getDoc();
    if (!doc) return;
    doc.designMode = disabled ? "off" : "on";
  }, [disabled, getDoc]);

  // Sync external value changes (e.g. AI edit)
  useEffect(() => {
    if (!initializedRef.current) return;
    if (value === lastValueRef.current) return;
    lastValueRef.current = value;
    const doc = getDoc();
    if (!doc?.body) return;
    doc.body.innerHTML = protectTokens(value);
  }, [value, getDoc]);

  const exec = useCallback(
    (command: string, arg?: string) => {
      const doc = getDoc();
      if (!doc) return;
      doc.execCommand(command, false, arg);
      iframeRef.current?.contentWindow?.focus();
    },
    [getDoc]
  );

  const handleLink = useCallback(() => {
    // eslint-disable-next-line no-alert
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  }, [exec]);

  return (
    <Box sx={{ height, display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      {!disabled && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            height: TOOLBAR_H,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
            flexShrink: 0,
          }}
        >
          <Tooltip title="Bold">
            <IconButton size="small" onClick={() => exec("bold")}>
              <Bold size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onClick={() => exec("italic")}>
              <Italic size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" onClick={() => exec("underline")}>
              <Underline size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton size="small" onClick={() => exec("strikeThrough")}>
              <Strikethrough size={ICO} />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Heading 1">
            <IconButton size="small" onClick={() => exec("formatBlock", "h1")}>
              <Heading1 size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 2">
            <IconButton size="small" onClick={() => exec("formatBlock", "h2")}>
              <Heading2 size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 3">
            <IconButton size="small" onClick={() => exec("formatBlock", "h3")}>
              <Heading3 size={ICO} />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Bulleted List">
            <IconButton size="small" onClick={() => exec("insertUnorderedList")}>
              <List size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton size="small" onClick={() => exec("insertOrderedList")}>
              <ListOrdered size={ICO} />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Insert Link">
            <IconButton size="small" onClick={handleLink}>
              <Link2 size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Link">
            <IconButton size="small" onClick={() => exec("unlink")}>
              <Unlink size={ICO} />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Undo">
            <IconButton size="small" onClick={() => exec("undo")}>
              <Undo2 size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton size="small" onClick={() => exec("redo")}>
              <Redo2 size={ICO} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Formatting">
            <IconButton size="small" onClick={() => exec("removeFormat")}>
              <RemoveFormatting size={ICO} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Editor iframe */}
      <iframe
        ref={iframeRef}
        title="HTML Visual Editor"
        style={{
          border: "none",
          width: "100%",
          flex: 1,
          background: "white",
        }}
      />
    </Box>
  );
};
