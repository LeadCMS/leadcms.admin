import React from "react";
import { Box } from "@mui/material";
import CodeEditor from "@uiw/react-textarea-code-editor";

interface MdxCodeBlockProps {
  code: string;
  readOnly?: boolean;
}

/**
 * A syntax-highlighted code block component specifically for MDX examples
 * Uses the same CodeEditor that's used elsewhere in the application
 */
export const MdxCodeBlock: React.FC<MdxCodeBlockProps> = ({ code, readOnly = true }) => {
  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        backgroundColor: "grey.100",
        border: "1px solid",
        borderColor: "grey.300",
        "& .w-tc-editor": {
          backgroundColor: "transparent !important",
          minHeight: "auto !important",
        },
        "& .w-tc-editor-text": {
          fontFamily: "monospace !important",
          fontSize: "0.8rem !important",
          lineHeight: "1.4 !important",
        },
        "& .w-tc-editor-focus": {
          outline: "none !important",
          boxShadow: "none !important",
        },
        // Enhanced syntax highlighting colors for better readability
        "& .token.tag": {
          color: "#d73a49 !important", // HTML/JSX tags
        },
        "& .token.attr-name": {
          color: "#6f42c1 !important", // Attribute names
        },
        "& .token.attr-value": {
          color: "#032f62 !important", // Attribute values
        },
        "& .token.string": {
          color: "#032f62 !important", // Strings
        },
        "& .token.comment": {
          color: "#6a737d !important", // Comments
          fontStyle: "italic !important",
        },
        "& .token.keyword": {
          color: "#d73a49 !important", // Keywords (function, const, etc.)
        },
        "& .token.punctuation": {
          color: "#24292e !important", // Brackets, parentheses, etc.
        },
        // Legacy selectors for older versions
        "& .w-tc-editor-var": {
          color: "#d73a49 !important",
        },
        "& .w-tc-editor-property": {
          color: "#6f42c1 !important",
        },
        "& .w-tc-editor-string": {
          color: "#032f62 !important",
        },
        "& .w-tc-editor-comment": {
          color: "#6a737d !important",
          fontStyle: "italic !important",
        },
      }}
    >
      <CodeEditor
        value={code}
        language="jsx"
        readOnly={readOnly}
        onChange={() => {
          // No-op since it's read-only
        }}
        padding={12}
        style={{
          fontSize: "0.8rem",
          fontFamily: "monospace",
          backgroundColor: "transparent",
          borderRadius: "4px",
        }}
        data-color-mode="light"
      />
    </Box>
  );
};
