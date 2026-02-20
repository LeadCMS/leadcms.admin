import React, { useCallback, useEffect, useMemo, useState } from "react";
import mjml2html from "mjml-browser";
import { Liquid } from "liquidjs";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { ChevronDown, ChevronUp, Plus, Trash2, Monitor, Smartphone } from "lucide-react";
import { useUserInfo } from "@providers/user-provider";

export type TemplateFormat = "Html" | "Mjml";

export interface TemplatePreviewProps {
  /** Raw template source (HTML or MJML) */
  source: string;
  /** Template format — "Html" or "Mjml" */
  format: TemplateFormat;
  height?: string;
}

interface TemplateParam {
  key: string;
  value: string;
  type: "text" | "boolean";
}

/** Shared Liquid engine instance (stateless, safe to reuse). */
const liquidEngine = new Liquid({ strictVariables: false });

/**
 * Normalise legacy backend template tokens to Liquid syntax.
 *
 * Supported input forms (all map to `{{ key }}`):
 *   <%key%>   &lt;%key%&gt;   ${key}
 *
 * Liquid-native `{{ key }}` and `{% if %}` are left as-is.
 */
export function normalizePlaceholders(source: string): string {
  let result = source;
  // <%key%>
  result = result.replace(/<%\s*(\w+)\s*%>/g, (_, k) => `{{ ${k} }}`);
  // HTML-encoded variant &lt;%key%&gt;
  result = result.replace(/&lt;%\s*(\w+)\s*%&gt;/g, (_, k) => `{{ ${k} }}`);
  // ${key}
  result = result.replace(/\$\{\s*(\w+)\s*\}/g, (_, k) => `{{ ${k} }}`);
  return result;
}

/**
 * Auto-detect template variable names from any supported
 * placeholder syntax (legacy + Liquid).
 */
function detectVariables(source: string): string[] {
  const vars = new Set<string>();
  const patterns = [
    /\{\{\s*(\w+)\s*\}\}/g, // {{ var }}
    /<%\s*(\w+)\s*%>/g, // <%var%>
    /&lt;%\s*(\w+)\s*%&gt;/g, // &lt;%var%&gt;
    /\$\{\s*(\w+)\s*\}/g, // ${var}
    /\{%\s*if\s+(\w+)\s*%\}/g, // {% if var %}
    /\{%\s*unless\s+(\w+)\s*%\}/g, // {% unless var %}
  ];
  for (const rx of patterns) {
    let m;
    while ((m = rx.exec(source)) !== null) {
      vars.add(m[1]);
    }
  }
  return Array.from(vars);
}

/**
 * Render a Liquid template string synchronously-ish.
 * liquidjs `parseAndRenderSync` works in browser.
 */
function renderLiquid(template: string, params: TemplateParam[]): string {
  const ctx: Record<string, string | boolean> = {};
  for (const p of params) {
    ctx[p.key] = p.type === "boolean" ? p.value === "true" : p.value;
  }
  return liquidEngine.parseAndRenderSync(template, ctx);
}

/**
 * Detect format from source content when the API doesn't
 * provide an explicit format field yet.
 */
export function detectFormat(source: string, apiFormat?: string | null): TemplateFormat {
  if (apiFormat === "Mjml" || apiFormat === "Html") {
    return apiFormat;
  }
  const trimmed = (source || "").trim();
  if (trimmed.startsWith("<mjml")) return "Mjml";
  return "Html";
}

// ---- localStorage helpers for param persistence ----
const PARAMS_STORAGE_KEY = "email-tpl-preview-params";

function loadStoredParams(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PARAMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredParams(map: Record<string, string>) {
  try {
    localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota exceeded — ignore */
  }
}

// ---- Pattern-based smart defaults ----
/* eslint-disable @typescript-eslint/no-explicit-any */
interface UserProfile {
  email?: string;
  userName?: string;
  displayName?: string;
}

const BOOLEAN_PATTERNS = /^(is[A-Z_]|has[A-Z_]|show|hide|enable|disable|active|visible)/i;

/**
 * Generate a smart dummy value for a template variable
 * based on its name and optionally the current user profile.
 */
function generateSmartDefault(
  key: string,
  user?: UserProfile | null
): { value: string; type: "text" | "boolean" } {
  const lower = key.toLowerCase();

  // Boolean patterns
  if (BOOLEAN_PATTERNS.test(key)) {
    return { value: "true", type: "boolean" };
  }

  // Email
  if (lower.includes("email") || lower === "mail") {
    return {
      value: user?.email || "user@example.com",
      type: "text",
    };
  }

  // ID patterns — must come before generic name patterns
  if (lower === "id") {
    return { value: "1042", type: "text" };
  }
  if (lower.includes("orderid") || lower.includes("order_id")) {
    return { value: "ORD-1042", type: "text" };
  }
  if (
    lower.includes("refid") ||
    lower.includes("ref_id") ||
    lower.includes("referenceid") ||
    lower.includes("reference_id") ||
    lower.includes("platformref")
  ) {
    return { value: "REF-78432", type: "text" };
  }

  // Order number
  if (lower.includes("ordernumber") || lower.includes("order_number")) {
    return { value: "ORD-2024-00158", type: "text" };
  }

  // Name patterns
  if (lower === "name" || lower === "username" || lower === "user_name") {
    return {
      value: user?.userName || "johndoe",
      type: "text",
    };
  }
  if (
    lower.includes("customername") ||
    lower.includes("customer_name") ||
    lower.includes("displayname") ||
    lower.includes("display_name") ||
    lower.includes("fullname") ||
    lower.includes("full_name") ||
    lower.includes("contactname") ||
    lower.includes("contact_name") ||
    lower.includes("buyername") ||
    lower.includes("buyer_name") ||
    lower.includes("recipientname") ||
    lower.includes("recipient_name")
  ) {
    return {
      value: user?.displayName || "John Doe",
      type: "text",
    };
  }
  if (lower.includes("firstname") || lower.includes("first_name")) {
    const first = (user?.displayName || "").split(" ")[0];
    return { value: first || "John", type: "text" };
  }
  if (lower.includes("lastname") || lower.includes("last_name")) {
    const parts = (user?.displayName || "").split(" ");
    const last = parts.length > 1 ? parts.slice(1).join(" ") : "";
    return { value: last || "Doe", type: "text" };
  }

  // Date / time
  if (lower.includes("date")) {
    return {
      value: new Date().toISOString().split("T")[0],
      type: "text",
    };
  }
  if (lower.includes("time")) {
    return { value: "12:00 PM", type: "text" };
  }
  if (lower.includes("year")) {
    return {
      value: String(new Date().getFullYear()),
      type: "text",
    };
  }

  // URL / link
  if (lower.includes("url") || lower.includes("link") || lower.includes("href")) {
    return { value: "https://example.com", type: "text" };
  }

  // Phone
  if (lower.includes("phone") || lower.includes("tel")) {
    return { value: "+1 (555) 123-4567", type: "text" };
  }

  // Company / organisation
  if (
    lower.includes("company") ||
    lower.includes("organization") ||
    lower.includes("organisation")
  ) {
    return { value: "Acme Inc.", type: "text" };
  }

  // Address
  if (lower.includes("address") && !lower.includes("email")) {
    return {
      value: "123 Main St, Anytown, USA",
      type: "text",
    };
  }

  // Currency
  if (lower.includes("currency")) {
    return { value: "USD", type: "text" };
  }

  // Fee / commission
  if (lower.includes("fee") || lower.includes("commission")) {
    return { value: "2.50", type: "text" };
  }

  // Amount / price / total / cost / unitprice
  if (
    lower.includes("amount") ||
    lower.includes("price") ||
    lower.includes("total") ||
    lower.includes("cost")
  ) {
    return { value: "99.99", type: "text" };
  }

  // Product / item
  if (lower.includes("product") || lower.includes("item")) {
    return { value: "Premium Widget", type: "text" };
  }

  // Source / platform / provider
  if (
    lower.includes("source") ||
    lower.includes("platform") ||
    lower.includes("provider") ||
    lower.includes("gateway")
  ) {
    return { value: "Stripe", type: "text" };
  }

  // Language / locale
  if (lower.includes("language") || lower.includes("locale")) {
    return { value: "en", type: "text" };
  }

  // Count / number / quantity
  if (
    lower.includes("count") ||
    lower.includes("number") ||
    lower.includes("quantity") ||
    lower.includes("qty")
  ) {
    return { value: "5", type: "text" };
  }

  // Title / subject / heading
  if (lower === "title" || lower === "subject" || lower === "heading") {
    return { value: "Sample Title", type: "text" };
  }

  // Description / message / body / content
  if (lower === "description" || lower === "message" || lower === "body" || lower === "content") {
    return { value: "Lorem ipsum dolor sit amet.", type: "text" };
  }

  // Code / token
  if (lower.includes("code") || lower.includes("token") || lower.includes("otp")) {
    return { value: "ABC123", type: "text" };
  }

  // Fallback — use the key itself as a placeholder
  return {
    value: `[${key}]`,
    type: "text",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  source,
  format,
  height = "calc(100vh - 300px)",
}) => {
  const userInfo = useUserInfo();
  const user = userInfo?.details ?? null;

  const [paramsOpen, setParamsOpen] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [params, setParams] = useState<TemplateParam[]>([]);
  const [newParamKey, setNewParamKey] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Auto-detect variables from source
  const detectedVars = useMemo(() => detectVariables(source), [source]);

  // Initialise params from localStorage + smart defaults on first detect
  useEffect(() => {
    if (detectedVars.length === 0) return;
    if (initialized) return;
    const stored = loadStoredParams();
    const initial: TemplateParam[] = detectedVars.map((v) => {
      if (stored[v] !== undefined) {
        const isBool = stored[v] === "true" || stored[v] === "false";
        return {
          key: v,
          value: stored[v],
          type: isBool ? ("boolean" as const) : ("text" as const),
        };
      }
      return { key: v, ...generateSmartDefault(v, user) };
    });
    setParams(initial);
    setInitialized(true);
  }, [detectedVars, user, initialized]);

  // Merge detected vars with user-defined params
  const effectiveParams = useMemo(() => {
    const merged = [...params];
    for (const v of detectedVars) {
      if (!merged.find((p) => p.key === v)) {
        const smart = generateSmartDefault(v, user);
        merged.push({ key: v, ...smart });
      }
    }
    return merged;
  }, [params, detectedVars, user]);

  // Render pipeline:  normalise → Liquid → (MJML compile if needed)
  const preview = useMemo(() => {
    if (!source || !source.trim()) {
      return { html: "", errors: [] as string[] };
    }

    try {
      const normalized = normalizePlaceholders(source);
      const rendered = renderLiquid(normalized, effectiveParams);

      if (format === "Mjml") {
        const result = mjml2html(rendered, {
          validationLevel: "soft",
        });
        const errors = (result.errors || []).map((e: { message: string }) => e.message);
        return { html: result.html || "", errors };
      }

      // HTML format — render directly
      return { html: rendered, errors: [] as string[] };
    } catch (e) {
      return { html: "", errors: [String(e)] };
    }
  }, [source, format, effectiveParams]);

  const addParam = () => {
    const key = newParamKey.trim();
    if (!key || params.find((p) => p.key === key)) return;
    setParams([...params, { key, value: "", type: "text" }]);
    setNewParamKey("");
  };

  /** Update a param by key. Promotes auto-detected params into state. */
  const updateParam = useCallback((key: string, updates: Partial<TemplateParam>) => {
    setParams((prev) => {
      const idx = prev.findIndex((p) => p.key === key);
      let next: TemplateParam[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], ...updates };
      } else {
        // Auto-detected param not yet in state — promote it
        next = [...prev, { key, value: "", type: "text" as const, ...updates }];
      }
      // Persist to localStorage
      const stored = loadStoredParams();
      const updated = next.find((p) => p.key === key);
      if (updated) stored[key] = updated.value;
      saveStoredParams(stored);
      return next;
    });
  }, []);

  const removeParam = (key: string) => {
    setParams((prev) => prev.filter((p) => p.key !== key));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height,
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1,
          px: 1,
        }}
      >
        <Tooltip title="Toggle parameter editor">
          <IconButton size="small" onClick={() => setParamsOpen(!paramsOpen)}>
            {paramsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </Tooltip>
        <Typography variant="body2" color="text.secondary">
          Template Parameters
        </Typography>
        {effectiveParams.length > 0 && (
          <Chip label={effectiveParams.length} size="small" color="primary" variant="outlined" />
        )}
        <Box sx={{ flex: 1 }} />
        <Chip
          label={format}
          size="small"
          variant="outlined"
          color={format === "Mjml" ? "secondary" : "default"}
          sx={{ mr: 1 }}
        />
        <Tooltip title={mobilePreview ? "Desktop preview" : "Mobile preview"}>
          <IconButton size="small" onClick={() => setMobilePreview(!mobilePreview)}>
            {mobilePreview ? <Smartphone size={18} /> : <Monitor size={18} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Parameter editor */}
      <Collapse in={paramsOpen}>
        <Box
          sx={{
            p: 2,
            mb: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "grey.50",
            maxHeight: 200,
            overflow: "auto",
          }}
        >
          <Grid container spacing={2}>
            {effectiveParams.map((param) => (
              <React.Fragment key={param.key}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      pt: 1,
                      fontFamily: "monospace",
                    }}
                  >
                    {"{{ "}
                    {param.key}
                    {" }}"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={param.type === "boolean"}
                        onChange={(e) => {
                          const isBool = e.target.checked;
                          updateParam(param.key, {
                            type: isBool ? "boolean" : "text",
                            value: isBool ? "true" : "",
                          });
                        }}
                      />
                    }
                    label={<Typography variant="caption">Bool</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  {param.type === "boolean" ? (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={param.value === "true"}
                          onChange={(e) =>
                            updateParam(param.key, {
                              value: String(e.target.checked),
                            })
                          }
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {param.value === "true" ? "True" : "False"}
                        </Typography>
                      }
                    />
                  ) : (
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Value for ${param.key}`}
                      value={param.value}
                      onChange={(e) =>
                        updateParam(param.key, {
                          value: e.target.value,
                        })
                      }
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  {!detectedVars.includes(param.key) && (
                    <Tooltip title="Remove parameter">
                      <IconButton size="small" onClick={() => removeParam(param.key)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
              </React.Fragment>
            ))}
          </Grid>

          {/* Add custom parameter */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Add parameter name"
              value={newParamKey}
              onChange={(e) => setNewParamKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addParam();
                }
              }}
            />
            <Tooltip title="Add parameter">
              <IconButton size="small" onClick={addParam} disabled={!newParamKey.trim()}>
                <Plus size={18} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Liquid syntax help */}
          <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" component="div">
              <strong>Liquid syntax:</strong> {"{{ variable }}"} for values,{" "}
              {"{% if variable %}...{% endif %}"} for conditionals,{" "}
              {"{% for item in items %}...{% endfor %}"} for loops.
              <br />
              <strong>Legacy syntax:</strong> {"<%variable%>"} and {"${variable}"} are
              auto-converted to Liquid.
            </Typography>
          </Box>
        </Box>
      </Collapse>

      {/* Errors */}
      {preview.errors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          {preview.errors.map((e, i) => (
            <Typography key={i} variant="body2">
              {e}
            </Typography>
          ))}
        </Alert>
      )}

      {/* HTML Preview iframe */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <iframe
          srcDoc={preview.html}
          title="Email Preview"
          sandbox="allow-same-origin allow-scripts"
          style={{
            border: "none",
            width: mobilePreview ? "375px" : "100%",
            height: "100%",
            background: "white",
            transition: "width 0.3s ease",
          }}
        />
      </Box>
    </Box>
  );
};
