import React from "react";
import {
  Box,
  Typography,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import { ChevronDown, Copy } from "lucide-react";
import { MdxComponentDto, MdxComponentPropertyDto } from "@lib/network/swagger-client";
import { MdxCodeBlock } from "./mdx-code-block";

interface MdxComponentsPanelProps {
  components: MdxComponentDto[];
  onClosePanel?: () => void;
}

/**
 * Format a property value for proper JSX syntax
 * For booleans: returns null if false (to omit the attribute), true if true (for shorthand syntax)
 */
const formatPropValueForJSX = (value: string, propType?: string | null): string | null | true => {
  // If the value is already properly formatted (wrapped in quotes or braces), return as is
  if (/^[""]/.test(value) || value.startsWith("{")) {
    return value;
  }

  // Handle different types
  switch (propType?.toLowerCase()) {
    case "boolean":
    case "bool":
      // For boolean properties, use JSX shorthand conventions
      if (value === "true") {
        return true; // This will result in shorthand syntax like <Component prop />
      } else if (value === "false") {
        return null; // This will omit the attribute entirely
      }
      return value;
    case "number":
    case "int":
    case "integer":
      // Convert string number to JSX number expression
      if (!isNaN(Number(value))) {
        return `{${value}}`;
      }
      return value;
    case "array":
    case "object":
      // These should already be wrapped in braces
      return value.startsWith("{") ? value : `{${value}}`;
    default:
      // String values should be quoted
      return `"${value}"`;
  }
};

/**
 * Generate example markup for a component
 */
const generateComponentMarkup = (component: MdxComponentDto): string => {
  const hasProps = component.properties && component.properties.length > 0;
  const hasChildren = component.acceptsChildren;

  if (!hasProps && !hasChildren) {
    return `<${component.name} />`;
  }

  let markup = `<${component.name}`;

  // Add example properties
  if (hasProps) {
    component.properties?.forEach((prop: MdxComponentPropertyDto) => {
      if (prop.name) {
        const exampleValue = prop.exampleValues?.[0] || getDefaultPropValue(prop);
        // Format the example value properly for JSX
        const formattedValue = formatPropValueForJSX(exampleValue, prop.type);

        if (formattedValue === null) {
          // Omit boolean false properties
          return;
        } else if (formattedValue === true) {
          // Use shorthand syntax for boolean true properties
          markup += ` ${prop.name}`;
        } else {
          // Normal attribute with value
          markup += ` ${prop.name}=${formattedValue}`;
        }
      }
    });
  }

  if (hasChildren) {
    markup += `>\n  {/* Add your content here */}\n</${component.name}>`;
  } else {
    markup += " />";
  }

  return markup;
};

/**
 * Get default value for a property based on its type
 */
const getDefaultPropValue = (prop: MdxComponentPropertyDto): string => {
  switch (prop.type?.toLowerCase()) {
    case "string":
      return `${prop.name}`;
    case "number":
    case "int":
    case "integer":
      return "1";
    case "boolean":
    case "bool":
      return "true"; // Will be handled by formatPropValueForJSX to use shorthand syntax
    case "array":
      return "[]";
    case "object":
      return "{}";
    default:
      return `${prop.name}`;
  }
};

/**
 * Copy text to clipboard
 */
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
  }
};

export const MdxComponentsPanel: React.FC<MdxComponentsPanelProps> = ({
  components,
  onClosePanel,
}) => {
  if (components.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">
          No custom components available for this content type
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      {components.map((component) => {
        const defaultMarkup = generateComponentMarkup(component);
        const example =
          component.examples && component.examples.length > 0 ? component.examples[0] : undefined;

        return (
          <Accordion key={component.name} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown size={16} />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                <Typography variant="subtitle2">{component.name}</Typography>
                <Box sx={{ flex: 1 }} />
                {!!component.usageCount && component.usageCount > 0 && (
                  <Tooltip title="Approximate usage count across content">
                    <Typography variant="caption" color="text.secondary">
                      Used {component.usageCount} time(s)
                    </Typography>
                  </Tooltip>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {component.description && (
                  <Typography variant="body2" color="text.secondary">
                    {component.description}
                  </Typography>
                )}

                {component.properties && component.properties.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Properties:
                    </Typography>
                    {component.properties.map((prop) => (
                      <Box key={prop.name} sx={{ ml: 1, mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{prop.name}</strong>
                          {prop.type && ` (${prop.type})`}
                          {prop.isRequired && (
                            <Box component="span" sx={{ color: "error.main" }}>
                              {" "}
                              *
                            </Box>
                          )}
                        </Typography>
                        {prop.description && (
                          <Typography variant="caption" color="text.secondary">
                            {prop.description}
                          </Typography>
                        )}
                        {prop.exampleValues && prop.exampleValues.length > 0 && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Example: {prop.exampleValues[0]}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Default Markup (auto-generated) */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Default Markup
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Tooltip title="Copy default markup to clipboard">
                      <Copy
                        size={16}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          copyToClipboard(defaultMarkup);
                          onClosePanel?.();
                        }}
                      />
                    </Tooltip>
                  </Stack>
                  <MdxCodeBlock code={defaultMarkup} />
                </Box>

                {/* Example Usage (if provided) */}
                {example && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Example Usage
                      </Typography>
                      <Box sx={{ flex: 1 }} />
                      <Tooltip title="Copy example to clipboard">
                        <Copy
                          size={16}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            copyToClipboard(example);
                            onClosePanel?.();
                          }}
                        />
                      </Tooltip>
                    </Stack>
                    <MdxCodeBlock code={example} />
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};
