/**
 * Normalizes a value to a number or null
 */
export const normalizeNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Formats currency in compact notation (K for thousands, M for millions)
 */
export const formatCompactCurrency = (
  amount: number | null | string | undefined,
  formatter: Intl.NumberFormat
): string => {
  const numericAmount = normalizeNumber(amount);
  if (numericAmount === null) {
    return "-";
  }

  if (numericAmount >= 1_000_000) {
    return `${(numericAmount / 1_000_000).toFixed(1)}M`;
  }

  if (numericAmount >= 1_000) {
    return `${(numericAmount / 1_000).toFixed(1)}K`;
  }

  return formatter.format(numericAmount);
};
