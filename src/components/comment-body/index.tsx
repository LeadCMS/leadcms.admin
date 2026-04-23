import { FC, useMemo } from "react";
import { Typography } from "@mui/material";
import { renderCommentBodyHtml } from "@utils/comment-body-renderer";

export interface CommentBodyProps {
  body?: string | null;
  /**
   * When true, renders a subtle placeholder for empty bodies instead of `null`.
   * Useful inside live-preview panes.
   */
  showEmptyPlaceholder?: boolean;
  emptyPlaceholder?: string;
}

const proseSx = {
  "& p": { margin: 0, marginBottom: 3 },
  "& p:last-child": { marginBottom: 0 },
  "& a": { color: "primary.main", textDecoration: "underline" },
  "& strong, & b": { fontWeight: 600 },
  "& em, & i": { fontStyle: "italic" },
  "& ul, & ol": { margin: 0, marginBottom: 3, paddingLeft: 3 },
  "& blockquote": {
    margin: 0,
    marginBottom: 3,
    paddingLeft: 1.5,
    borderLeft: "3px solid",
    borderColor: "divider",
    color: "text.secondary",
  },
  "& code": {
    bgcolor: "grey.100",
    px: 0.5,
    borderRadius: 0.5,
    fontFamily: "monospace",
    fontSize: "0.85em",
  },
  "& pre": {
    bgcolor: "grey.100",
    p: 1.5,
    borderRadius: 1,
    overflow: "auto",
    "& code": { bgcolor: "transparent", px: 0 },
  },
  "& h3, & h4, & h5": { marginTop: 1, marginBottom: 0.5, fontWeight: 600 },
  "& table": {
    borderCollapse: "collapse",
    width: "auto",
    maxWidth: "100%",
    marginBottom: 3,
    fontSize: "0.875em",
    display: "block",
    overflowX: "auto",
  },
  "& th, & td": {
    border: "1px solid",
    borderColor: "divider",
    px: 1.25,
    py: 0.75,
    textAlign: "left",
    verticalAlign: "top",
  },
  "& th": {
    bgcolor: "grey.100",
    fontWeight: 600,
  },
  "& tbody tr:nth-of-type(even)": {
    bgcolor: "grey.50",
  },
} as const;

/**
 * Renders a user-submitted comment body that may contain a mix of Markdown and
 * legacy inline HTML. Uses the shared marked + sanitize-html pipeline.
 */
export const CommentBody: FC<CommentBodyProps> = ({
  body,
  showEmptyPlaceholder = false,
  emptyPlaceholder = "Nothing to preview yet.",
}) => {
  const html = useMemo(() => renderCommentBodyHtml(body), [body]);

  if (!html) {
    if (!showEmptyPlaceholder) return null;
    return (
      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
        {emptyPlaceholder}
      </Typography>
    );
  }

  return (
    <Typography
      variant="body2"
      component="div"
      sx={proseSx}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
