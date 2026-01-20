import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { Plus } from "lucide-react";
import { CreateNewEmailGroup } from "./create-new";
import { useRequestContext } from "@providers/request-provider";
import { useConfig } from "@providers/config-provider";
import { useNotificationsService } from "@hooks";
import { showApiError } from "@utils/api-error-parser";
import { EmailGroupAutoCompleteProps, EmailGroupOption } from "./types";

export function EmailGroupAutocomplete({
  label,
  placeholder,
  value,
  defaultLanguage,
  onChange,
  onChangeWithLabel,
  onBlur,
  error,
  helperText,
  disabled,
}: EmailGroupAutoCompleteProps) {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const [options, setOptions] = useState<EmailGroupOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const preferredLanguage = defaultLanguage || config?.defaultLanguage || "";
  const sortedOptions = [...options].sort((left, right) => {
    const preferredPrefix = preferredLanguage.split("-")[0].toLowerCase();
    const leftLang = (left.language || "").toLowerCase();
    const rightLang = (right.language || "").toLowerCase();
    const leftScore =
      leftLang === preferredLanguage.toLowerCase()
        ? 0
        : leftLang.startsWith(preferredPrefix)
        ? 1
        : 2;
    const rightScore =
      rightLang === preferredLanguage.toLowerCase()
        ? 0
        : rightLang.startsWith(preferredPrefix)
        ? 1
        : 2;

    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }

    return left.label.localeCompare(right.label);
  });

  const requestData = async () => {
    setIsLoading(true);
    let data: EmailGroupOption[] = [];
    try {
      const response = await client.api.emailGroupsList();
      data = response.data.map((value) => ({
        id: value.id as number,
        label: value.name,
        language: value.language,
      }));
    } catch (e) {
      showApiError(e, notificationsService, undefined, "Failed to get options");
    } finally {
      setOptions(data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestData();
  }, []);

  const handleAddNewGroup = (newGroup: EmailGroupOption) => {
    setDialogOpen(false);
    requestData();
    onChange(newGroup.id);
    if (onChangeWithLabel) {
      onChangeWithLabel(newGroup.id, newGroup.label);
    }
  };

  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 12 }}>
          <TextField
            select
            label={label || "Group ID"}
            value={value === undefined || value === null ? "" : value}
            onChange={(e) => {
              if (e.target.value === "__add__") {
                setDialogOpen(true);
              } else {
                const numVal = Number(e.target.value);
                onChange(numVal);
                if (onChangeWithLabel) {
                  const opt = options.find((o) => o.id === numVal);
                  onChangeWithLabel(numVal, opt?.label || "");
                }
              }
            }}
            error={!!error}
            helperText={helperText}
            placeholder={placeholder}
            onBlur={onBlur}
            fullWidth
            disabled={disabled}
            slotProps={{ formHelperText: { sx: { ml: 0 } } }}
            InputProps={{
              endAdornment: (
                <>{isLoading ? <CircularProgress color="inherit" size={20} /> : null}</>
              ),
            }}
          >
            {sortedOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {opt.label}
                  {opt.language && (
                    <Chip
                      label={opt.language}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 18,
                        fontSize: "0.65rem",
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
            <MenuItem value="__add__">
              <Plus size={20} style={{ marginRight: 8 }} /> Create new group
            </MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <CreateNewEmailGroup
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onChange={handleAddNewGroup}
        defaultLanguage={defaultLanguage}
      />
    </>
  );
}
