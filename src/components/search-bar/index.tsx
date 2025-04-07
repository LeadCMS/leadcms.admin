import { useState } from "react";
import { TextField, Box, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBoxProps {
  setSearchTermOnChange: (searchTerm: string) => void;
  searchBoxLabel: string;
  initialValue: string;
}

export const SearchBar = ({
  setSearchTermOnChange,
  searchBoxLabel,
  initialValue,
}: SearchBoxProps) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (timer) {
      clearTimeout(timer);
    }
    setTimer(
      setTimeout(() => {
        setSearchTermOnChange(event.target.value);
      }, 800),
    );
  };

  return (
    <Box>
      <TextField
        size="small"
        defaultValue={initialValue}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        label={searchBoxLabel}
        onChange={handleChange}
      ></TextField>
    </Box>
  );
};
