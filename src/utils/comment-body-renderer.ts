import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "a",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "s",
    "del",
    "code",
    "pre",
    "ul",
    "ol",
    "li",
    "blockquote",
    "h3",
    "h4",
    "h5",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "caption",
    "colgroup",
    "col",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    th: ["colspan", "rowspan", "scope", "align"],
    td: ["colspan", "rowspan", "align"],
    col: ["span"],
    colgroup: ["span"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: (tagName, attribs) => {
      const isExternal = /^https?:\/\//i.test(attribs.href || "");
      return {
        tagName: "a",
        attribs: {
          ...attribs,
          rel: isExternal ? "nofollow noopener ugc" : attribs.rel || "",
          ...(isExternal ? { target: "_blank" } : {}),
        },
      };
    },
  },
};

/**
 * Render a comment body that may contain a mix of Markdown and inline legacy
 * HTML into a safe HTML string suitable for `dangerouslySetInnerHTML`.
 *
 * Pipeline: marked (Markdown → HTML, inline HTML passes through) →
 * sanitize-html (allow-list strip) → safe HTML.
 */
export const renderCommentBodyHtml = (body?: string | null): string => {
  if (!body) return "";
  const html = marked.parse(body, { async: false }) as string;
  return sanitizeHtml(html, SANITIZE_OPTIONS);
};
