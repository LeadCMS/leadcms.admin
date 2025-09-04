import React from "react";
import {
  Box,
  Chip,
  Typography,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ChevronDown, Copy } from "lucide-react";
import { MdxComponentDto, MdxComponentPropertyDto } from "@lib/network/swagger-client";

interface MdxComponentsPanelProps {
  components: MdxComponentDto[];
  onComponentInsert?: (componentMarkup: string) => void;
}

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
        markup += ` ${prop.name}=${exampleValue}`;
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
      return `"${prop.name}"`;
    case "number":
    case "int":
    case "integer":
      return "1";
    case "boolean":
    case "bool":
      return "true";
    case "array":
      return "{[]}";
    case "object":
      return "{{}}";
    default:
      return `"${prop.name}"`;
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
  onComponentInsert,
}) => {
  const handleCopyComponent = async (component: MdxComponentDto) => {
    const markup = generateComponentMarkup(component);
    await copyToClipboard(markup);
    if (onComponentInsert) {
      onComponentInsert(markup);
    }
  };

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
      <Typography variant="h6" sx={{ mb: 2, px: 1 }}>
        MDX Components ({components.length})
      </Typography>

      {components.map((component) => (
        <Accordion key={component.name} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ChevronDown size={16} />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
              <Typography variant="subtitle2">{component.name}</Typography>
              {component.usageCount && (
                <Chip size="small" label={component.usageCount} color="primary" />
              )}
              <Box sx={{ flex: 1 }} />
              <Tooltip title="Copy component markup">
                <Copy
                  size={16}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyComponent(component);
                  }}
                />
              </Tooltip>
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

              {component.examples && component.examples.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Example Usage:
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      backgroundColor: "grey.100",
                      p: 1,
                      borderRadius: 1,
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      overflow: "auto",
                      margin: 0,
                    }}
                  >
                    {component.examples[0]}
                  </Box>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
