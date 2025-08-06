import { useState } from "react";
import { TextField, Box, InputAdornment, IconButton } from "@mui/material";
import { Search } from "lucide-react";
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
      }, 800)
    );
  };

  return (
    <Box>
      <TextField
        size="small"
        defaultValue={initialValue}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ p: 0 }}>
              <IconButton sx={{ p: 0 }}>
                <Search size={18} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        placeholder={searchBoxLabel}
        onChange={handleChange}
        sx={(theme) => ({
          backgroundColor: theme.palette.background.primary,
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
