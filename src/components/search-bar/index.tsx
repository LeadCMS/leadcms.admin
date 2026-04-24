import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Search, X } from "lucide-react";
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
  const [searchValue, setSearchValue] = useState(initialValue || "");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearchValue(initialValue || "");
  }, [initialValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    if (timer) {
      clearTimeout(timer);
    }
    setTimer(
      setTimeout(() => {
        setSearchTermOnChange(value);
      }, 800)
    );
  };

  const handleClear = () => {
    if (timer) {
      clearTimeout(timer);
    }
    setSearchValue("");
    setSearchTermOnChange("");
  };

  return (
    <Box>
      <TextField
        size="small"
        value={searchValue}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ p: 0 }}>
              <IconButton sx={{ p: 0 }}>
                <Search size={18} />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: searchValue ? (
            <InputAdornment position="end" sx={{ p: 0 }}>
              <IconButton sx={{ p: 0 }} onClick={handleClear} aria-label="Clear search">
                <X size={18} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        placeholder={searchBoxLabel}
        onChange={handleChange}
        sx={(theme) => ({
          minWidth: 400,
          backgroundColor: theme.palette.background.secondary,
          "& .MuiInputBase-input": {
            fontSize: "0.9rem",
            padding: 2,
            "&::placeholder": {
              fontSize: "0.9rem",
              opacity: 0.6,
            },
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E4E4E7",
          },
          mr: 2,
        })}
      ></TextField>
    </Box>
  );
};
