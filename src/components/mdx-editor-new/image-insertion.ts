import { EditorView } from "@codemirror/view";

/**
 * Result of analysing what surrounds the caret when inserting an image.
 *
 * - `replaceRange` — the [from, to] slice of the source document that should
 *   be replaced with the new URL (or full markdown if `kind === "none"`).
 * - `kind` — why that range was chosen; used by callers to decide whether to
 *   emit a URL only or a full markdown image.
 */
export type InsertionContext =
  | {
      kind: "quote" | "parens-empty" | "url-in-parens";
      from: number;
      to: number;
    }
  | { kind: "none"; from: number; to: number };

/**
 * Analyse the source-mode document around `pos` to decide how an image URL
 * should be inserted.
 *
 * Heuristics (line-scoped, purposely simple):
 *  1. Caret is between a pair of matching quotes (`"..."` or `'...'`) on the
 *     current line → replace the quoted content. Covers JSX attributes such
 *     as `<Image src="…" />` and the optional markdown title.
 *  2. Caret is between a matching pair of parens `(...)` on the current line
 *     (markdown link/image target). If the content starts with a URL-like
 *     token optionally followed by a `"title"`, replace just the URL token;
 *     otherwise replace the whole parenthesised content.
 *  3. Otherwise return `none` — caller should insert a full image markdown.
 */
export function analyzeInsertionContext(doc: string, pos: number): InsertionContext {
  const lineStart = doc.lastIndexOf("\n", pos - 1) + 1;
  const nextNewline = doc.indexOf("\n", pos);
  const lineEnd = nextNewline === -1 ? doc.length : nextNewline;
  const line = doc.slice(lineStart, lineEnd);
  const col = pos - lineStart;

  const quote = findEnclosingQuote(line, col);
  if (quote) {
    return { kind: "quote", from: lineStart + quote.from, to: lineStart + quote.to };
  }

  const parens = findEnclosingParens(line, col);
  if (parens) {
    const content = line.slice(parens.from, parens.to);
    const leading = content.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = content.slice(leading);
    // `URL`, `URL "title"`, `URL 'title'`
    const urlMatch = trimmed.match(/^(\S+)/);
    if (urlMatch) {
      const urlFrom = parens.from + leading;
      const urlTo = urlFrom + urlMatch[1].length;
      return { kind: "url-in-parens", from: lineStart + urlFrom, to: lineStart + urlTo };
    }
    return { kind: "parens-empty", from: lineStart + parens.from, to: lineStart + parens.to };
  }

  return { kind: "none", from: pos, to: pos };
}

/**
 * Find the innermost pair of matching quotes on a single line that encloses
 * `col`. Recognises `"` and `'`. Returns the [from, to) of the content
 * between the quotes, exclusive of the quotes themselves.
 */
function findEnclosingQuote(line: string, col: number): { from: number; to: number } | null {
  for (const q of ['"', "'"]) {
    // Scan left for an unescaped, unmatched opening quote.
    let depth = 0;
    let openIdx = -1;
    for (let i = col - 1; i >= 0; i--) {
      if (line[i] === q && line[i - 1] !== "\\") {
        if (depth === 0) {
          openIdx = i;
          break;
        }
        depth--;
      }
    }
    if (openIdx === -1) continue;

    // Scan right for the matching close quote.
    let closeIdx = -1;
    for (let i = col; i < line.length; i++) {
      if (line[i] === q && line[i - 1] !== "\\") {
        closeIdx = i;
        break;
      }
    }
    if (closeIdx === -1) continue;

    return { from: openIdx + 1, to: closeIdx };
  }
  return null;
}

/**
 * Find the innermost pair of matching parentheses on a single line that
 * encloses `col`. Balances `(` / `)` counts. Ignores parens inside quotes so
 * that titles like `("image.png "Alt (large)")` still match the outer pair.
 */
function findEnclosingParens(line: string, col: number): { from: number; to: number } | null {
  const inQuote = computeQuoteMask(line);

  let depth = 0;
  let openIdx = -1;
  for (let i = col - 1; i >= 0; i--) {
    if (inQuote[i]) continue;
    if (line[i] === ")") depth++;
    else if (line[i] === "(") {
      if (depth === 0) {
        openIdx = i;
        break;
      }
      depth--;
    }
  }
  if (openIdx === -1) return null;

  let depthR = 0;
  let closeIdx = -1;
  for (let i = col; i < line.length; i++) {
    if (inQuote[i]) continue;
    if (line[i] === "(") depthR++;
    else if (line[i] === ")") {
      if (depthR === 0) {
        closeIdx = i;
        break;
      }
      depthR--;
    }
  }
  if (closeIdx === -1) return null;

  return { from: openIdx + 1, to: closeIdx };
}

/** Build a boolean mask marking characters that are inside a quoted span. */
function computeQuoteMask(line: string): boolean[] {
  const mask = new Array<boolean>(line.length).fill(false);
  let inQuote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuote) {
      mask[i] = true;
      if (c === inQuote && line[i - 1] !== "\\") inQuote = null;
    } else if (c === '"' || c === "'") {
      inQuote = c;
      mask[i] = true;
    }
  }
  return mask;
}

/**
 * Locate the CodeMirror `EditorView` for the active source/diff mode inside
 * the given container. Returns `null` when the editor is in rich-text mode
 * (CodeMirror root is hidden or absent).
 */
export function getActiveCodeMirrorView(container: HTMLElement | null): EditorView | null {
  if (!container) return null;
  const roots = container.querySelectorAll<HTMLElement>(".cm-editor");
  for (const root of Array.from(roots)) {
    if (root.offsetParent === null) continue; // hidden
    const view = EditorView.findFromDOM(root);
    if (view) return view;
  }
  return null;
}

/**
 * Apply a context-aware image insertion on a CodeMirror view.
 *
 * @returns `true` when the view handled the insertion (the caller should not
 *          run a fallback), `false` when no view was supplied.
 */
export function insertImageIntoCodeMirror(
  view: EditorView | null,
  url: string,
  altText: string
): boolean {
  if (!view) return false;

  const pos = view.state.selection.main.head;
  const doc = view.state.doc.toString();
  const ctx = analyzeInsertionContext(doc, pos);

  let insertText: string;
  let from: number;
  let to: number;
  let newCaret: number;

  if (ctx.kind === "none") {
    // Insert full markdown image at caret. Add a leading newline only when
    // the current line already has non-whitespace content before the caret.
    const lineStart = doc.lastIndexOf("\n", pos - 1) + 1;
    const prefix = doc.slice(lineStart, pos);
    const needsLeadingNewline = prefix.trim().length > 0;
    const needsTrailingNewline = pos < doc.length && doc[pos] !== "\n";
    insertText = `${needsLeadingNewline ? "\n" : ""}![${altText}](${url})${
      needsTrailingNewline ? "\n" : ""
    }`;
    from = pos;
    to = pos;
    newCaret = pos + insertText.length;
  } else {
    insertText = url;
    from = ctx.from;
    to = ctx.to;
    newCaret = from + insertText.length;
  }

  view.dispatch({
    changes: { from, to, insert: insertText },
    selection: { anchor: newCaret },
  });
  view.focus();
  return true;
}
