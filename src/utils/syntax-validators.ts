import { parse as parseYaml, YAMLParseError } from "yaml";
import { compile } from "@mdx-js/mdx";

export interface SyntaxValidationResult {
  isValid: boolean;
  error?: SyntaxValidationError;
}

export interface SyntaxValidationError {
  message: string;
  line?: number;
  column?: number;
  type: "json" | "yaml" | "mdx";
}

/**
 * Validates JSON syntax
 */
export const validateJsonSyntax = (content: string): SyntaxValidationResult => {
  if (!content.trim()) {
    return { isValid: true };
  }

  try {
    JSON.parse(content);
    return { isValid: true };
  } catch (error) {
    let line: number | undefined;
    let column: number | undefined;
    let message = "Invalid JSON syntax";

    if (error instanceof SyntaxError) {
      message = error.message;

      // Try to extract line/column information from error message
      const lineMatch = message.match(/at line (\d+)/);
      const columnMatch = message.match(/at column (\d+)|at position (\d+)/);

      if (lineMatch) {
        line = parseInt(lineMatch[1], 10);
      }
      if (columnMatch) {
        column = parseInt(columnMatch[1] || columnMatch[2], 10);
      }

      // If we couldn't parse line/column from message, try to calculate from position
      if (!line && !column) {
        const positionMatch = message.match(/position (\d+)/);
        if (positionMatch) {
          const position = parseInt(positionMatch[1], 10);
          const lines = content.substring(0, position).split("\n");
          line = lines.length;
          column = lines[lines.length - 1].length + 1;
        }
      }
    }

    return {
      isValid: false,
      error: {
        message,
        line,
        column,
        type: "json",
      },
    };
  }
};

/**
 * Validates YAML syntax
 */
export const validateYamlSyntax = (content: string): SyntaxValidationResult => {
  if (!content.trim()) {
    return { isValid: true };
  }

  try {
    parseYaml(content, { strict: true });
    return { isValid: true };
  } catch (error) {
    let message = "Invalid YAML syntax";
    let line: number | undefined;
    let column: number | undefined;

    if (error instanceof YAMLParseError) {
      message = error.message;
      if (error.linePos && error.linePos.length > 0) {
        line = error.linePos[0].line;
        column = error.linePos[0].col;
      }
    }

    return {
      isValid: false,
      error: {
        message,
        line,
        column,
        type: "yaml",
      },
    };
  }
};

/**
 * Validates frontmatter block structure and YAML syntax
 */
export const validateFrontmatter = (content: string): SyntaxValidationResult => {
  if (!content.trim()) {
    return { isValid: true };
  }

  // Check if content starts with frontmatter
  if (!content.startsWith("---")) {
    return { isValid: true }; // No frontmatter is valid
  }

  // Validate frontmatter structure
  const lines = content.split(/\r?\n/);
  
  // First line must be exactly "---"
  if (lines[0] !== "---") {
    return {
      isValid: false,
      error: {
        message: "Frontmatter opening delimiter must be exactly '---' on its own line",
        line: 1,
        type: "mdx",
      },
    };
  }

  // Find the closing frontmatter delimiter
  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    return {
      isValid: false,
      error: {
        message: "Frontmatter is missing closing '---' delimiter",
        line: 1,
        type: "mdx",
      },
    };
  }

  // Extract and validate YAML content between delimiters
  const yamlContent = lines.slice(1, closingIndex).join("\n");
  
  // Empty frontmatter is valid
  if (!yamlContent.trim()) {
    return { isValid: true };
  }

  const yamlResult = validateYamlSyntax(yamlContent);
  if (!yamlResult.isValid && yamlResult.error) {
    return {
      isValid: false,
      error: {
        ...yamlResult.error,
        message: `Frontmatter YAML error: ${yamlResult.error.message}`,
        type: "mdx",
        // Adjust line numbers to account for frontmatter position (add 1 for opening ---)
        line: yamlResult.error.line ? yamlResult.error.line + 1 : undefined,
      },
    };
  }

  return { isValid: true };
};

/**
 * Validates MDX syntax using the official MDX compiler
 * This provides comprehensive validation including:
 * - Frontmatter block structure and YAML syntax
 * - JSX component syntax with proper nesting
 * - MDX-specific syntax and expressions
 * - Import/export statements
 * - JavaScript expressions in {expression} syntax
 */
export const validateMdxSyntax = async (content: string): Promise<SyntaxValidationResult> => {
  if (!content.trim()) {
    return { isValid: true };
  }

  // First, validate frontmatter structure and YAML syntax
  const frontmatterResult = validateFrontmatter(content);
  if (!frontmatterResult.isValid) {
    return frontmatterResult;
  }

  // Then validate the MDX content using the official compiler
  try {
    await compile(content, {
      development: true, // Better error messages in development
      outputFormat: "function-body",
      // Allow any JSX components without imports for validation
      jsx: false,
    });

    return { isValid: true };
  } catch (error: unknown) {
    // Extract error information from the compile error
    let message = "MDX compilation failed";
    let line: number | undefined;
    let column: number | undefined;

    if (error && typeof error === "object" && "message" in error) {
      const errorObj = error as { message?: string; line?: number; column?: number };
      if (errorObj.message) {
        message = errorObj.message;

        // Try to extract line/column information from error message
        const lineMatch = message.match(/:(\d+):(\d+)/);
        if (lineMatch) {
          line = parseInt(lineMatch[1], 10);
          column = parseInt(lineMatch[2], 10);
        }
      }

      // Handle VFile errors (common in MDX compilation)
      if (errorObj.line !== undefined) {
        line = errorObj.line;
      }
      if (errorObj.column !== undefined) {
        column = errorObj.column;
      }
    }

    return {
      isValid: false,
      error: {
        message,
        line,
        column,
        type: "mdx",
      },
    };
  }
};

/**
 * Basic MDX syntax validation (fallback)
 * This is the current implementation that checks for:
 * - Unmatched JSX tags
 * - Invalid JSX syntax
 * - Frontmatter YAML syntax (if present)
 */
export const validateMdxSyntaxBasic = (content: string): SyntaxValidationResult => {
  if (!content.trim()) {
    return { isValid: true };
  }

  // First, check frontmatter if it exists
  const frontmatterMatch = content.match(/^---\s*\n(.*?)\n---\s*\n/s);
  if (frontmatterMatch) {
    const frontmatterContent = frontmatterMatch[1];
    const yamlResult = validateYamlSyntax(frontmatterContent);
    if (!yamlResult.isValid) {
      const yamlError = yamlResult.error;
      if (!yamlError) return { isValid: true }; // This shouldn't happen but satisfies TypeScript

      return {
        isValid: false,
        error: {
          ...yamlError,
          message: `Frontmatter error: ${yamlError.message}`,
          type: "mdx",
          // Adjust line numbers to account for frontmatter position
          line: yamlError.line ? yamlError.line + 1 : undefined,
        },
      };
    }
  }

  // Remove frontmatter for JSX validation
  const contentWithoutFrontmatter = content.replace(/^---\s*\n(.*?)\n---\s*\n/s, "");

  // Basic JSX tag matching validation
  const result = validateJsxTags(contentWithoutFrontmatter);
  if (!result.isValid) {
    // Adjust line numbers if frontmatter was present
    const frontmatterLines = frontmatterMatch ? frontmatterMatch[0].split("\n").length - 1 : 0;
    const resultError = result.error;
    if (!resultError) return { isValid: true }; // This shouldn't happen but satisfies TypeScript

    return {
      isValid: false,
      error: {
        ...resultError,
        type: "mdx",
        line: resultError.line ? resultError.line + frontmatterLines : undefined,
      },
    };
  }

  return { isValid: true };
};

/**
 * Basic JSX tag validation for MDX content
 */
function validateJsxTags(content: string): SyntaxValidationResult {
  const lines = content.split("\n");
  const tagStack: Array<{ tag: string; line: number }> = [];

  // Regex to match JSX tags (both opening and closing)
  const jsxTagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)*)\s*[^>]*>/g;
  const selfClosingRegex = /<[a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)*\s*[^>]*\/>/g;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineNumber = lineIndex + 1;

    // Skip code blocks and inline code
    if (line.trim().startsWith("```") || line.includes("`")) {
      continue;
    }

    let match;
    jsxTagRegex.lastIndex = 0; // Reset regex state

    while ((match = jsxTagRegex.exec(line)) !== null) {
      const fullTag = match[0];
      const tagName = match[1];

      // Skip self-closing tags
      if (selfClosingRegex.test(fullTag)) {
        continue;
      }

      // Skip HTML void elements
      const voidElements = [
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "meta",
        "param",
        "source",
        "track",
        "wbr",
      ];
      if (voidElements.includes(tagName.toLowerCase())) {
        continue;
      }

      if (fullTag.startsWith("</")) {
        // Closing tag
        if (tagStack.length === 0) {
          return {
            isValid: false,
            error: {
              message: `Unexpected closing tag '</${tagName}>' - no matching opening tag found`,
              line: lineNumber,
              type: "mdx",
            },
          };
        }

        const lastOpenTag = tagStack[tagStack.length - 1];
        if (lastOpenTag.tag !== tagName) {
          return {
            isValid: false,
            error: {
              message: `Mismatched tag: expected </${lastOpenTag.tag}> but got </${tagName}>`,
              line: lineNumber,
              type: "mdx",
            },
          };
        }

        tagStack.pop();
      } else {
        // Opening tag
        tagStack.push({ tag: tagName, line: lineNumber });
      }
    }
  }

  // Check for unclosed tags
  if (tagStack.length > 0) {
    const unclosedTag = tagStack[tagStack.length - 1];
    return {
      isValid: false,
      error: {
        message: `Unclosed tag '<${unclosedTag.tag}>' opened at line ${unclosedTag.line}`,
        line: unclosedTag.line,
        type: "mdx",
      },
    };
  }

  return { isValid: true };
}

/**
 * Main validation function that determines the appropriate validator based on format
 * Returns Promise<SyntaxValidationResult> for MDX (async) and SyntaxValidationResult for others
 */
export const validateContentSyntax = (
  content: string,
  format: string
): SyntaxValidationResult | Promise<SyntaxValidationResult> => {
  const upperFormat = format.toUpperCase();

  switch (upperFormat) {
    case "JSON":
      return validateJsonSyntax(content);
    case "YAML":
    case "YML":
      return validateYamlSyntax(content);
    case "MDX":
    case "MD":
    case "MARKDOWN":
      return validateMdxSyntax(content); // This is now async
    case "HTML":
      // For HTML, we can use basic JSX validation
      return validateJsxTags(content);
    default:
      // For plain text or unknown formats, always valid
      return { isValid: true };
  }
};
