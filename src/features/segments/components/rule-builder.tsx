import React, { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import ListSubheader from "@mui/material/ListSubheader";
import { Plus, Trash2 } from "lucide-react";
import {
  type AutocompleteKey,
  type FieldDefinition,
  contactFields,
  getAvailableContactFields,
  getAvailableFieldCategories,
  getFieldById,
  getPrefixedFieldName,
  getFieldsByCategory,
  getOperatorDisplayName,
  noValueOperators,
} from "../types";
import { RuleGroup, SegmentRule } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { useConfig } from "@providers/config-provider";
import { getCountryList, getContinentList } from "utils/general-helper";

type OptionItem = { value: string; label: string };

/** Hook that lazy-loads countries, continents, languages. */
const useAutocompleteOptions = () => {
  const context = useRequestContext();
  const { config } = useConfig();
  const [options, setOptions] = useState<Record<AutocompleteKey, OptionItem[]>>({
    countries: [],
    continents: [],
    languages: [],
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [countries, continents] = await Promise.all([
        getCountryList(context),
        getContinentList(context),
      ]);

      if (cancelled) return;

      const countryOpts: OptionItem[] = countries
        ? Object.entries(countries).map(([code, name]) => ({ value: code, label: name }))
        : [];

      const continentOpts: OptionItem[] = continents
        ? Object.entries(continents).map(([code, name]) => ({ value: code, label: name }))
        : [];

      const langs = config?.languages || [];
      const languageOpts: OptionItem[] = langs.map((l) => ({
        value: l.code || "",
        label: l.name || l.code || "",
      }));

      setOptions({
        countries: countryOpts,
        continents: continentOpts,
        languages: languageOpts,
      });
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [context, config]);

  return options;
};

interface RuleBuilderProps {
  ruleGroup: RuleGroup;
  onChange: (ruleGroup: RuleGroup) => void;
  title?: string;
  description?: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatRuleValue = (value: SegmentRule["value"]) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") {
    const recordValue = value as {
      value?: unknown;
      values?: unknown;
    };
    if (recordValue.value !== undefined) return String(recordValue.value ?? "");
    if (Array.isArray(recordValue.values)) return recordValue.values.map(String).join(", ");
    return JSON.stringify(value);
  }
  return String(value);
};

/* ── Typed value editor ── */
const RuleValueEditor: React.FC<{
  field: FieldDefinition | undefined;
  rule: SegmentRule;
  onValueChange: (value: SegmentRule["value"]) => void;
  autocompleteOptions: Record<AutocompleteKey, OptionItem[]>;
}> = ({ field, rule, onValueChange, autocompleteOptions }) => {
  if (noValueOperators.includes(rule.operator)) return null;

  const fieldType = field?.type ?? "text";

  switch (fieldType) {
    case "autocomplete": {
      const key = field?.autocompleteKey;
      const opts = key ? autocompleteOptions[key] : [];
      const currentValue = formatRuleValue(rule.value);
      const selectedOption = opts.find((o) => o.value === currentValue) ?? null;

      return (
        <Autocomplete
          size="small"
          options={opts}
          getOptionLabel={(o) => (typeof o === "string" ? o : o.label)}
          isOptionEqualToValue={(option, val) => option.value === val.value}
          value={selectedOption}
          onChange={(_e, newVal) => {
            onValueChange(newVal && typeof newVal !== "string" ? newVal.value : "");
          }}
          renderInput={(params) => <TextField {...params} label={field?.name ?? "Value"} />}
          sx={{ minWidth: 220 }}
        />
      );
    }
    case "select":
      return (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Value</InputLabel>
          <Select
            value={formatRuleValue(rule.value)}
            label="Value"
            onChange={(e) => onValueChange(e.target.value)}
          >
            {(field?.options ?? []).map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case "number":
      return (
        <TextField
          size="small"
          type="number"
          label="Value"
          value={formatRuleValue(rule.value)}
          onChange={(e) => onValueChange(e.target.value)}
          sx={{ minWidth: 140 }}
        />
      );

    case "date":
      return (
        <TextField
          size="small"
          type="date"
          label="Value"
          value={formatRuleValue(rule.value)}
          onChange={(e) => onValueChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 170 }}
        />
      );

    case "boolean":
      /* boolean operators (IsTrue/IsFalse) need no value */
      return null;

    case "tags":
      return (
        <Autocomplete
          freeSolo
          multiple
          size="small"
          options={[]}
          value={
            Array.isArray(rule.value)
              ? (rule.value as string[])
              : formatRuleValue(rule.value)
              ? [formatRuleValue(rule.value)]
              : []
          }
          onChange={(_e, newValue) => {
            onValueChange(
              newValue.length === 1 ? newValue[0] : newValue.length === 0 ? "" : newValue
            );
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...props } = getTagProps({
                index,
              });
              return <Chip key={key} label={option} size="small" {...props} />;
            })
          }
          renderInput={(params) => (
            <TextField {...params} label="Tags" placeholder="Type and press Enter" />
          )}
          sx={{ minWidth: 220 }}
        />
      );

    default:
      return (
        <TextField
          size="small"
          label="Value"
          value={formatRuleValue(rule.value)}
          onChange={(e) => onValueChange(e.target.value)}
          sx={{ minWidth: 160 }}
        />
      );
  }
};

/* ── Grouped field selector items ── */
const fieldGroupHeaderSx = {
  px: 2,
  py: 1,
  lineHeight: 1.6,
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "text.primary",
  backgroundColor: "background.paper",
  backgroundImage: "none",
  borderTop: "1px solid",
  borderBottom: "1px solid",
  borderColor: "divider",
  boxShadow: "inset 4px 0 0 var(--mui-palette-primary-main)",
  zIndex: 2,
};

const getCategoryDisplayName = (category: string): string => {
  if (category === "Email Logs") {
    return "Email Logs (any match)";
  }
  if (category === "Last Email") {
    return "Last Email (most recent)";
  }
  return category;
};

const buildFieldMenuItems = (availableEntities?: string[]) => {
  const availableFieldIds = new Set(
    getAvailableContactFields(availableEntities).map((field) => field.id)
  );
  const items: React.ReactNode[] = [];
  for (const category of getAvailableFieldCategories(availableEntities)) {
    const fields = getFieldsByCategory(category).filter((field) => availableFieldIds.has(field.id));
    if (fields.length === 0) continue;
    items.push(
      <ListSubheader key={`header-${category}`} sx={fieldGroupHeaderSx}>
        {getCategoryDisplayName(category)}
      </ListSubheader>
    );
    for (const f of fields) {
      items.push(
        <MenuItem key={f.id} value={f.id} sx={{ pl: 4, fontSize: "0.95rem" }}>
          {getPrefixedFieldName(f, f.id)}
        </MenuItem>
      );
    }
  }
  return items;
};

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  ruleGroup,
  onChange,
  title = "Rules",
  description,
}) => {
  const { config } = useConfig();
  const availableFields = React.useMemo(
    () => getAvailableContactFields(config?.entities),
    [config?.entities]
  );
  const fieldMenuItems = React.useMemo(
    () => buildFieldMenuItems(config?.entities),
    [config?.entities]
  );
  const autocompleteOptions = useAutocompleteOptions();

  const updateRule = (ruleId: string, updatedRule: Partial<SegmentRule>) => {
    const newGroup = { ...ruleGroup };
    const updateRuleInGroup = (group: RuleGroup): boolean => {
      const ruleIndex = group.rules?.findIndex((r) => r.id === ruleId) ?? -1;
      if (ruleIndex !== -1 && group.rules) {
        group.rules[ruleIndex] = {
          ...group.rules[ruleIndex],
          ...updatedRule,
        };
        return true;
      }
      for (const subGroup of group.groups || []) {
        if (updateRuleInGroup(subGroup)) return true;
      }
      return false;
    };
    updateRuleInGroup(newGroup);
    onChange(newGroup);
  };

  const removeRule = (ruleId: string) => {
    const newGroup = { ...ruleGroup };
    const removeRuleFromGroup = (group: RuleGroup): boolean => {
      const ruleIndex = group.rules?.findIndex((r) => r.id === ruleId) ?? -1;
      if (ruleIndex !== -1 && group.rules) {
        group.rules.splice(ruleIndex, 1);
        return true;
      }
      for (const subGroup of group.groups || []) {
        if (removeRuleFromGroup(subGroup)) return true;
      }
      return false;
    };
    removeRuleFromGroup(newGroup);
    onChange(newGroup);
  };

  const addRule = (groupId?: string) => {
    const defaultField = availableFields[0] ?? contactFields[0];
    const newRule: SegmentRule = {
      id: generateId(),
      fieldId: defaultField.id,
      operator: "Contains",
      value: "",
    };

    const newGroup = { ...ruleGroup };

    if (!groupId || groupId === ruleGroup.id) {
      if (!newGroup.rules) newGroup.rules = [];
      newGroup.rules.push(newRule);
    } else {
      const findAndAddToGroup = (group: RuleGroup): boolean => {
        if (group.id === groupId) {
          if (!group.rules) group.rules = [];
          group.rules.push(newRule);
          return true;
        }
        for (const subGroup of group.groups || []) {
          if (findAndAddToGroup(subGroup)) return true;
        }
        return false;
      };
      findAndAddToGroup(newGroup);
    }
    onChange(newGroup);
  };

  const updateGroupConnector = (groupId: string, connector: "And" | "Or") => {
    const newGroup = { ...ruleGroup };
    const updateConnectorInGroup = (group: RuleGroup): boolean => {
      if (group.id === groupId) {
        group.connector = connector;
        return true;
      }
      for (const subGroup of group.groups || []) {
        if (updateConnectorInGroup(subGroup)) return true;
      }
      return false;
    };
    updateConnectorInGroup(newGroup);
    onChange(newGroup);
  };

  const handleFieldChange = (rule: SegmentRule, newFieldId: string) => {
    const newField = getFieldById(newFieldId);
    const ops = newField?.operators ?? [];
    const currentOpValid = ops.includes(rule.operator);
    const newOperator = currentOpValid ? rule.operator : ops[0] ?? "Contains";
    const needsValueReset = !currentOpValid || newField?.type !== getFieldById(rule.fieldId)?.type;
    updateRule(rule.id, {
      fieldId: newFieldId,
      operator: newOperator,
      value: needsValueReset ? "" : rule.value,
    });
  };

  const renderRule = (rule: SegmentRule) => {
    const field = getFieldById(rule.fieldId);
    const availableOperators = field?.operators || [];

    return (
      <Box
        key={rule.id}
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Field</InputLabel>
          <Select
            value={rule.fieldId}
            label="Field"
            onChange={(e) => handleFieldChange(rule, e.target.value)}
          >
            {fieldMenuItems}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Operator</InputLabel>
          <Select
            value={rule.operator}
            label="Operator"
            onChange={(e) =>
              updateRule(rule.id, {
                operator: e.target.value as SegmentRule["operator"],
              })
            }
          >
            {availableOperators.map((op) => (
              <MenuItem key={op} value={op}>
                {getOperatorDisplayName(op)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <RuleValueEditor
          field={field}
          rule={rule}
          onValueChange={(value) => updateRule(rule.id, { value })}
          autocompleteOptions={autocompleteOptions}
        />

        <IconButton size="small" onClick={() => removeRule(rule.id)} color="error">
          <Trash2 size={16} />
        </IconButton>
      </Box>
    );
  };

  const renderRuleGroup = (group: RuleGroup, isRoot = false) => {
    return (
      <Card
        key={group.id}
        sx={{
          mb: 2,
          border: isRoot ? "none" : "1px solid #e0e0e0",
        }}
      >
        <CardContent>
          {!isRoot && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="subtitle2">Group Connector:</Typography>
              <Chip
                label="AND"
                variant={group.connector === "And" ? "filled" : "outlined"}
                onClick={() => updateGroupConnector(group.id, "And")}
                clickable
                size="small"
              />
              <Chip
                label="OR"
                variant={group.connector === "Or" ? "filled" : "outlined"}
                onClick={() => updateGroupConnector(group.id, "Or")}
                clickable
                size="small"
              />
            </Box>
          )}

          {(group.rules || []).map((rule) => renderRule(rule))}
          {(group.groups || []).map((subGroup) => renderRuleGroup(subGroup))}

          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => addRule(group.id)}
              variant="outlined"
            >
              Add Rule
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {title && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      )}
      {renderRuleGroup(ruleGroup, true)}
    </Box>
  );
};
