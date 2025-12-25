import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { contactFields, getFieldById, getOperatorDisplayName } from "../types";
import { RuleGroup, SegmentRule } from "lib/network/swagger-client";

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
    const recordValue = value as { value?: unknown; values?: unknown };
    if (recordValue.value !== undefined) return String(recordValue.value ?? "");
    if (Array.isArray(recordValue.values)) return recordValue.values.map(String).join(", ");
    return JSON.stringify(value);
  }
  return String(value);
};

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  ruleGroup,
  onChange,
  title = "Rules",
  description,
}) => {
  const updateRule = (ruleId: string, updatedRule: Partial<SegmentRule>) => {
    const newGroup = { ...ruleGroup };
    const updateRuleInGroup = (group: RuleGroup): boolean => {
      const ruleIndex = group.rules?.findIndex((r) => r.id === ruleId) ?? -1;
      if (ruleIndex !== -1 && group.rules) {
        group.rules[ruleIndex] = { ...group.rules[ruleIndex], ...updatedRule };
        return true;
      }

      for (const subGroup of group.groups || []) {
        if (updateRuleInGroup(subGroup)) {
          return true;
        }
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
        if (removeRuleFromGroup(subGroup)) {
          return true;
        }
      }
      return false;
    };

    removeRuleFromGroup(newGroup);
    onChange(newGroup);
  };

  const addRule = (groupId?: string) => {
    const newRule: SegmentRule = {
      id: generateId(),
      fieldId: contactFields[0].id,
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
          if (findAndAddToGroup(subGroup)) {
            return true;
          }
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
        if (updateConnectorInGroup(subGroup)) {
          return true;
        }
      }
      return false;
    };

    updateConnectorInGroup(newGroup);
    onChange(newGroup);
  };

  const renderRule = (rule: SegmentRule) => {
    const field = getFieldById(rule.fieldId);
    const availableOperators = field?.operators || [];

    return (
      <Box key={rule.id} sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Field</InputLabel>
          <Select
            value={rule.fieldId}
            label="Field"
            onChange={(e) => updateRule(rule.id, { fieldId: e.target.value })}
          >
            {contactFields.map((field) => (
              <MenuItem key={field.id} value={field.id}>
                {field.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Operator</InputLabel>
          <Select
            value={rule.operator}
            label="Operator"
            onChange={(e) =>
              updateRule(rule.id, { operator: e.target.value as SegmentRule["operator"] })
            }
          >
            {availableOperators.map((op) => (
              <MenuItem key={op} value={op}>
                {getOperatorDisplayName(op)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!["IsEmpty", "IsNotEmpty", "IsTrue", "IsFalse"].includes(rule.operator) && (
          <TextField
            size="small"
            label="Value"
            value={formatRuleValue(rule.value)}
            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
            sx={{ minWidth: 150 }}
          />
        )}

        <IconButton size="small" onClick={() => removeRule(rule.id)} color="error">
          <Trash2 size={16} />
        </IconButton>
      </Box>
    );
  };

  const renderRuleGroup = (group: RuleGroup, isRoot = false) => {
    return (
      <Card key={group.id} sx={{ mb: 2, border: isRoot ? "none" : "1px solid #e0e0e0" }}>
        <CardContent>
          {!isRoot && (
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
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
