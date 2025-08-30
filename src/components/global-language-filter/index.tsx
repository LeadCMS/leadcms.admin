import { TextField, MenuItem, Chip, ListSubheader } from "@mui/material";
import { useConfig } from "@providers/config-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { Globe, Languages } from "lucide-react";

export const GlobalLanguageFilter = () => {
  const { config } = useConfig();
  const { selectedLanguage, setSelectedLanguage, isLanguageFilterActive } =
    useGlobalLanguageFilter();
  const languages = config?.languages || [];

  if (languages.length <= 1) {
    return null;
  }

  return (
    <TextField
      select
      size="small"
      value={selectedLanguage}
      onChange={(e) => setSelectedLanguage(e.target.value)}
      sx={{
        minWidth: 120,
        "& .MuiInputBase-root": {
          height: 36,
        },
        "& .MuiSelect-select": {
          padding: "8px 14px",
          fontSize: "0.875rem",
        },
      }}
      InputProps={{
        startAdornment: isLanguageFilterActive ? (
          <Chip
            size="small"
            label="Filtered"
            color="primary"
            variant="filled"
            sx={{
              height: 20,
              fontSize: "0.75rem",
              mr: 1,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        ) : (
          <Globe size={14} style={{ marginRight: 8, color: "#666" }} />
        ),
      }}
    >
      <ListSubheader
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "primary.main",
          backgroundColor: "primary.50",
          borderBottom: "1px solid",
          borderBottomColor: "primary.200",
          py: 1.5,
        }}
      >
        <Languages size={14} />
        Content Language
      </ListSubheader>
      <MenuItem value="all">All Languages</MenuItem>
      {languages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          {lang.name}
        </MenuItem>
      ))}
    </TextField>
  );
};
