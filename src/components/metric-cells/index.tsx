import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { TrendingUp } from "lucide-react";
import {
  normalizeNumber,
  formatCompactCurrency,
  PrimaryCurrencyConfig,
} from "@utils/currency-formatter";

interface CountPillProps {
  value: number | null | undefined;
}

/**
 * Renders a count value in a pill/badge style
 */
export const CountPill = ({ value }: CountPillProps) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 36,
      px: 1.5,
      py: 0.5,
      borderRadius: 999,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  >
    <Typography variant="body2" fontWeight={600} fontSize={12} color="text.primary">
      {value ?? 0}
    </Typography>
  </Box>
);

interface RevenueCellProps {
  value: number | null | undefined;
  primaryCurrency?: PrimaryCurrencyConfig | null;
}

/**
 * Renders a revenue value with optional trend indicator
 */
export const RevenueCell = ({ value, primaryCurrency }: RevenueCellProps) => {
  const numericValue = normalizeNumber(value);
  const display = formatCompactCurrency(numericValue, primaryCurrency ?? null);
  const highlight = numericValue !== null && numericValue > 0;
  const showTrend = numericValue !== null && numericValue > 1_000_000;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 1,
        height: "100%",
        width: "100%",
      }}
    >
      <Typography
        variant="body2"
        fontWeight={600}
        color={highlight ? "success.main" : "text.primary"}
        textAlign="right"
      >
        {display}
      </Typography>
      {showTrend && (
        <Box color="success.main" display="flex" alignItems="center">
          <TrendingUp size={16} color="currentColor" />
        </Box>
      )}
    </Box>
  );
};
