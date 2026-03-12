import {
  Autocomplete,
  Box,
  TextField,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  FormLabel,
  IconButton,
  ListSubheader,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useConfig } from "@providers/config-provider";
import { useRequestContext } from "providers/request-provider";
import {
  type AutocompleteKey,
  type FieldDefinition,
  fieldCategories,
  getPrefixedFieldName,
  getOperatorDisplayName,
  noValueOperators,
} from "@features/segments/types";
import { getContinentList, getCountryList } from "utils/general-helper";

type OperatorOption = { value: string; label: string };
type OptionItem = { value: string; label: string };
type FilterRow = {
  whereField: string;
  whereOperator: string;
  whereFieldValue: string;
};

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

const legacyOperatorToSegmentOperator: Record<string, string> = {
  contains: "Contains",
  equals: "Equals",
  is: "Equals",
  "=": "Equals",
  not: "NotEquals",
  "!=": "NotEquals",
  startsWith: "StartsWith",
  endsWith: "EndsWith",
  isEmpty: "IsEmpty",
  isNotEmpty: "IsNotEmpty",
  after: "GreaterThan",
  ">": "GreaterThan",
  onOrAfter: "GreaterThanOrEqual",
  ">=": "GreaterThanOrEqual",
  before: "LessThan",
  "<": "LessThan",
  onOrBefore: "LessThanOrEqual",
  "<=": "LessThanOrEqual",
};

const textOperators: OperatorOption[] = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "not", label: "Not equal" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const numberOperators: OperatorOption[] = [
  { value: "equals", label: "=" },
  { value: "not", label: "!=" },
  { value: "after", label: ">" },
  { value: "onOrAfter", label: ">=" },
  { value: "before", label: "<" },
  { value: "onOrBefore", label: "<=" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const dateOperators: OperatorOption[] = [
  { value: "equals", label: "Is" },
  { value: "not", label: "Is not" },
  { value: "after", label: "After" },
  { value: "onOrAfter", label: "On or after" },
  { value: "before", label: "Before" },
  { value: "onOrBefore", label: "On or before" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const singleSelectOperators: OperatorOption[] = [
  { value: "equals", label: "Is" },
  { value: "not", label: "Is not" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const booleanOperators: OperatorOption[] = [{ value: "equals", label: "Is" }];

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

      const countryOptions = countries
        ? Object.entries(countries).map(([code, name]) => ({ value: code, label: name }))
        : [];
      const continentOptions = continents
        ? Object.entries(continents).map(([code, name]) => ({ value: code, label: name }))
        : [];
      const languageOptions = (config?.languages || []).map((language) => ({
        value: language.code || "",
        label: language.name || language.code || "",
      }));

      setOptions({
        countries: countryOptions,
        continents: continentOptions,
        languages: languageOptions,
      });
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [config?.languages, context]);

  return options;
};

function getColumnType(col: GridColDef | undefined): string {
  return col?.type || "string";
}

function getOperatorsForType(colType: string): OperatorOption[] {
  switch (colType) {
    case "number":
      return numberOperators;
    case "date":
    case "dateTime":
      return dateOperators;
    case "singleSelect":
      return singleSelectOperators;
    case "boolean":
      return booleanOperators;
    default:
      return textOperators;
  }
}

function getDefaultOperator(colType: string): string {
  switch (colType) {
    case "number":
      return "equals";
    case "date":
    case "dateTime":
      return "equals";
    case "singleSelect":
      return "equals";
    case "boolean":
      return "equals";
    default:
      return "contains";
  }
}

function getOperatorLabel(operatorValue: string, colType: string): string {
  const ops = getOperatorsForType(colType);
  const found = ops.find((o) => o.value === operatorValue);
  return found?.label ?? operatorValue;
}

function normalizeFieldOperator(
  field: FieldDefinition | undefined,
  operator: string,
  value: string
) {
  if (!field) return operator;
  if (field.type === "boolean" && operator === "equals") {
    return value === "false" ? "IsFalse" : "IsTrue";
  }
  return legacyOperatorToSegmentOperator[operator] || operator;
}

function getDefaultFieldOperator(field: FieldDefinition | undefined) {
  return field?.operators?.[0] || "Contains";
}

function getFieldDisplayLabel(field: FieldDefinition | undefined, fieldId: string) {
  return getPrefixedFieldName(field, fieldId);
}

function formatStoredValueForInput(field: FieldDefinition | undefined, rawValue: string) {
  if (field?.type === "tags") {
    return rawValue
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return rawValue;
}

function formatValueForStorage(field: FieldDefinition | undefined, nextValue: string | string[]) {
  if (Array.isArray(nextValue)) {
    return nextValue.filter(Boolean).join("|");
  }

  if (field?.type === "tags") {
    return nextValue
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .join("|");
  }

  return nextValue;
}

type CustomFilterBarProps = {
  columns: GridColDef[];
  whereFilters: FilterRow[];
  addFilter: (
    args: {
      whereField?: string;
      whereOperator?: string;
      whereFieldValue?: string;
    },
    removeIdx?: number,
    editIdx?: number
  ) => void;
  removeFilter: (index: number) => void;
  filterPanelOpen?: boolean;
  setFilterPanelOpen?: (open: boolean) => void;
  clearAllFilters: () => void;
  filterFields?: FieldDefinition[];
};

export function CustomFilterBar({
  columns,
  whereFilters,
  addFilter,
  removeFilter,
  filterPanelOpen,
  setFilterPanelOpen,
  clearAllFilters,
  filterFields,
}: CustomFilterBarProps) {
  const autocompleteOptions = useAutocompleteOptions();
  const [field, setField] = useState(filterFields?.[0]?.id || columns[0]?.field);
  const [operator, setOperator] = useState(
    filterFields?.[0]?.operators?.[0] || getDefaultOperator(getColumnType(columns[0]))
  );
  const [value, setValue] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const selectedColumn = useMemo(() => columns.find((c) => c.field === field), [columns, field]);
  const selectedField = useMemo(
    () => filterFields?.find((filterField) => filterField.id === field),
    [field, filterFields]
  );
  const colType = getColumnType(selectedColumn);
  const operatorOptions = selectedField
    ? selectedField.operators.map((item) => ({
        value: item,
        label: getOperatorDisplayName(item),
      }))
    : getOperatorsForType(colType);

  const valueOptions: string[] = useMemo(() => {
    if (selectedField?.options) {
      return selectedField.options.map((option) => option.value);
    }

    if (!selectedColumn) return [];
    const col = selectedColumn as unknown as Record<string, unknown>;
    const opts = col.valueOptions;
    if (Array.isArray(opts)) {
      return opts.map((o) => (typeof o === "string" ? o : String(o)));
    }
    return [];
  }, [selectedColumn]);

  const noValueRequired = selectedField
    ? noValueOperators.includes(operator as never)
    : ["isEmpty", "isNotEmpty"].includes(operator);

  const canApply = field && (noValueRequired || !!String(value).trim());

  const resetToDefaults = () => {
    const defaultField = filterFields?.[0]?.id || columns[0]?.field;
    const defaultColType = getColumnType(columns[0]);
    setField(defaultField);
    setOperator(
      filterFields?.[0]
        ? getDefaultFieldOperator(filterFields[0])
        : getDefaultOperator(defaultColType)
    );
    setValue("");
    setEditIdx(null);
  };

  const handleClose = () => {
    setFilterPanelOpen?.(false);
    resetToDefaults();
  };

  const handleFieldChange = (newField: string) => {
    setField(newField);
    const nextField = filterFields?.find((filterField) => filterField.id === newField);
    if (nextField) {
      const nextOperator = getDefaultFieldOperator(nextField);
      setOperator(nextOperator);
      setValue("");
      return;
    }

    const newCol = columns.find((c) => c.field === newField);
    const newType = getColumnType(newCol);
    const newOps = getOperatorsForType(newType);
    const isCurrentOpValid = newOps.some((o) => o.value === operator);
    if (!isCurrentOpValid) {
      setOperator(getDefaultOperator(newType));
    }
    setValue("");
  };

  const onChipClick = (idx: number) => {
    const f = whereFilters[idx];
    const editField = filterFields?.find((filterField) => filterField.id === f.whereField);
    const normalizedOperator = normalizeFieldOperator(
      editField,
      f.whereOperator,
      f.whereFieldValue
    );

    setField(f.whereField);
    setOperator(normalizedOperator);
    setValue(f.whereFieldValue);
    setEditIdx(idx);
    setFilterPanelOpen?.(true);
  };

  const handleAddOrEdit = () => {
    addFilter(
      {
        whereField: field,
        whereOperator: normalizeFieldOperator(selectedField, operator, value),
        whereFieldValue: formatValueForStorage(selectedField, value),
      },
      undefined,
      editIdx !== null ? editIdx : undefined
    );
    resetToDefaults();
    setFilterPanelOpen?.(false);
  };

  const chipLabel = (f: FilterRow) => {
    const filterField = filterFields?.find((item) => item.id === f.whereField);
    if (filterField) {
      const operatorLabel = getOperatorDisplayName(
        normalizeFieldOperator(filterField, f.whereOperator, f.whereFieldValue) as never
      );
      const fieldLabel = getFieldDisplayLabel(filterField, f.whereField);
      const displayValue = f.whereFieldValue.split("|").filter(Boolean).join(", ");

      if (
        noValueOperators.includes(
          normalizeFieldOperator(filterField, f.whereOperator, f.whereFieldValue) as never
        )
      ) {
        return `${fieldLabel} ${operatorLabel}`;
      }

      return `${fieldLabel} ${operatorLabel} "${displayValue}"`;
    }

    const col = columns.find((c) => c.field === f.whereField);
    const cType = getColumnType(col);
    const fieldLabel = col?.headerName ?? f.whereField;
    const opLabel = getOperatorLabel(f.whereOperator, cType);
    if (["isEmpty", "isNotEmpty"].includes(f.whereOperator)) {
      return `${fieldLabel} ${opLabel}`;
    }
    return `${fieldLabel} ${opLabel} "${f.whereFieldValue}"`;
  };

  const renderValueInput = () => {
    if (selectedField) {
      const isDisabled = noValueRequired;

      if (selectedField.type === "autocomplete") {
        const key = selectedField.autocompleteKey;
        const options = key ? autocompleteOptions[key] : [];
        const selectedOption = options.find((option) => option.value === value) ?? null;

        return (
          <Autocomplete
            size="small"
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, optionValue) => option.value === optionValue.value}
            value={selectedOption}
            onChange={(_event, nextValue) => setValue(nextValue?.value || "")}
            renderInput={(params) => <TextField {...params} label={selectedField.name} />}
            sx={{ minWidth: 220 }}
            disabled={isDisabled}
          />
        );
      }

      if (selectedField.type === "select") {
        return (
          <TextField
            select
            value={value}
            onChange={(event) => setValue(event.target.value)}
            style={{ minWidth: 180 }}
            disabled={isDisabled}
            sx={{
              "& .MuiSelect-select": {
                padding: 2.5,
                minHeight: "unset",
                fontSize: "0.95rem",
              },
            }}
          >
            {(selectedField.options || []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );
      }

      if (selectedField.type === "date") {
        return (
          <TextField
            type="date"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            style={{ minWidth: 180 }}
            disabled={isDisabled}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputBase-input": {
                padding: 2.5,
                minHeight: "unset",
                fontSize: "0.95rem",
              },
            }}
          />
        );
      }

      if (selectedField.type === "number") {
        return (
          <TextField
            type="number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            style={{ minWidth: 180 }}
            disabled={isDisabled}
            sx={{
              "& .MuiInputBase-input": {
                padding: 2.5,
                minHeight: "unset",
                fontSize: "0.95rem",
              },
            }}
          />
        );
      }

      if (selectedField.type === "tags") {
        return (
          <Autocomplete
            freeSolo
            multiple
            size="small"
            options={[]}
            value={formatStoredValueForInput(selectedField, value) as string[]}
            onChange={(_event, nextValue) => {
              setValue(formatValueForStorage(selectedField, nextValue));
            }}
            renderTags={(selectedValues, getTagProps) =>
              selectedValues.map((selectedValue, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <Chip key={key} label={selectedValue} size="small" {...tagProps} />;
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="Tags" placeholder="Type and press Enter" />
            )}
            sx={{ minWidth: 220 }}
            disabled={isDisabled}
          />
        );
      }

      return (
        <TextField
          value={value}
          onChange={(event) => setValue(event.target.value)}
          style={{ minWidth: 180 }}
          disabled={isDisabled}
          sx={{
            "& .MuiInputBase-input": {
              padding: 2.5,
              minHeight: "unset",
              fontSize: "0.95rem",
            },
          }}
        />
      );
    }

    const isDisabled = noValueRequired;

    if (colType === "singleSelect" && valueOptions.length > 0) {
      return (
        <TextField
          select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ minWidth: 180 }}
          disabled={isDisabled}
          sx={{
            "& .MuiSelect-select": {
              padding: 2.5,
              minHeight: "unset",
              fontSize: "0.95rem",
            },
          }}
        >
          {valueOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (colType === "date" || colType === "dateTime") {
      return (
        <TextField
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ minWidth: 180 }}
          disabled={isDisabled}
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiInputBase-input": {
              padding: 2.5,
              minHeight: "unset",
              fontSize: "0.95rem",
            },
          }}
        />
      );
    }

    if (colType === "number") {
      return (
        <TextField
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ minWidth: 180 }}
          disabled={isDisabled}
          sx={{
            "& .MuiInputBase-input": {
              padding: 2.5,
              minHeight: "unset",
              fontSize: "0.95rem",
            },
          }}
        />
      );
    }

    return (
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ minWidth: 180 }}
        disabled={isDisabled}
        sx={{
          "& .MuiInputBase-input": {
            padding: 2.5,
            minHeight: "unset",
            fontSize: "0.95rem",
          },
        }}
      />
    );
  };

  return (
    <>
      {whereFilters.length > 0 && (
        <Box display="flex" sx={{ backgroundColor: "#fafbfd", mb: 2 }}>
          {whereFilters.map((f, idx) => (
            <Chip
              key={idx}
              label={<span style={{ fontWeight: 600 }}>{chipLabel(f)}</span>}
              onClick={() => onChipClick(idx)}
              onDelete={() => removeFilter(idx)}
              deleteIcon={<X size={15} />}
              sx={{ ml: 2 }}
              color={editIdx === idx ? "primary" : "default"}
              variant={editIdx === idx ? "filled" : "outlined"}
            />
          ))}
          <Button
            sx={{
              ml: 2,
              backgroundColor: "#f3f4f6",
              color: "#222",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "16px",
              height: 32,
              minWidth: 0,
              px: 2,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#e5e7eb",
                boxShadow: "none",
              },
            }}
            size="small"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </Box>
      )}
      <Dialog
        open={filterPanelOpen ?? false}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#fafbfd",
            paddingBottom: 3,
            fontSize: "1.1rem",
            fontWeight: "bold",
          }}
        >
          {editIdx !== null ? "Edit Filter" : "Add Filter"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="small"
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fafbfd", padding: 2 }}>
          <Box
            sx={{
              p: 4,
              borderRadius: 0,
              backgroundColor: "#fafbfd",
              mx: "auto",
            }}
          >
            <Stack spacing={5}>
              <Box
                sx={{
                  width: "100%",
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <FormLabel
                  sx={{
                    mb: 2,
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  Field
                </FormLabel>
                <TextField
                  select
                  value={field || filterFields?.[0]?.id || columns[0]?.field || ""}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  style={{ minWidth: 120 }}
                  sx={{
                    "& .MuiSelect-select": {
                      padding: 2.5,
                      minHeight: "unset",
                      fontSize: "0.95rem",
                    },
                  }}
                >
                  {filterFields
                    ? fieldCategories.flatMap((category) => {
                        const groupedFields = filterFields.filter(
                          (filterField) => filterField.category === category
                        );

                        if (groupedFields.length === 0) {
                          return [];
                        }

                        return [
                          <ListSubheader key={`header-${category}`} sx={fieldGroupHeaderSx}>
                            {category}
                          </ListSubheader>,
                          ...groupedFields.map((filterField) => (
                            <MenuItem
                              key={filterField.id}
                              value={filterField.id}
                              sx={{ pl: 4, fontSize: "0.95rem" }}
                            >
                              {getPrefixedFieldName(filterField, filterField.id)}
                            </MenuItem>
                          )),
                        ];
                      })
                    : columns.map((col) => (
                        <MenuItem key={col.field} value={col.field}>
                          {col.headerName}
                        </MenuItem>
                      ))}
                </TextField>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <FormLabel
                  sx={{
                    mb: 2,
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  Operator
                </FormLabel>
                <TextField
                  select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  style={{ minWidth: 120 }}
                  sx={{
                    "& .MuiSelect-select": {
                      padding: 2.5,
                      minHeight: "unset",
                      fontSize: "0.95rem",
                    },
                  }}
                >
                  {operatorOptions.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {!noValueRequired && (
                <Box
                  sx={{
                    width: "100%",
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <FormLabel
                    sx={{
                      mb: 2,
                      fontWeight: "600",
                      fontSize: "0.9rem",
                    }}
                  >
                    Value
                  </FormLabel>
                  {renderValueInput()}
                </Box>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ mr: 4, mb: 3, backgroundColor: "#fafbfd" }}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOrEdit}
            disabled={!canApply}
            color="secondary"
          >
            {editIdx !== null ? "Apply" : "Add Filter"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
