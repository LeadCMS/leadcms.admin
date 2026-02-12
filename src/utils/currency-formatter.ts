/**
 * Currency configuration from the server's /api/config endpoint.
 */
export interface PrimaryCurrencyConfig {
  code: string;
  englishName?: string;
  nativeName?: string;
  symbol?: string;
  decimalDigits?: number;
  decimalSeparator?: string;
  groupSeparator?: string;
  positivePattern?: number;
  negativePattern?: number;
  cultureName?: string;
}

/**
 * Normalizes a value to a number or null.
 */
export const normalizeNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatterCache = new Map<string, Intl.NumberFormat>();

/**
 * Builds an Intl.NumberFormat for a given currency code
 * and locale. Results are cached to avoid creating
 * duplicate formatters.
 */
const getCurrencyFormatter = (
  currencyCode: string,
  locale: string,
  maximumFractionDigits?: number
): Intl.NumberFormat => {
  const digits = maximumFractionDigits ?? 2;
  const key = `${locale}:${currencyCode}:${digits}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: digits,
    });
    formatterCache.set(key, fmt);
  }
  return fmt;
};

/**
 * Formats a monetary value using the primary currency
 * configuration from the server.
 */
export const formatPrimaryCurrency = (
  value: number | null | undefined,
  config: PrimaryCurrencyConfig | null | undefined,
  maximumFractionDigits?: number
): string => {
  if (value === null || value === undefined) return "";
  if (!config?.code) {
    return String(value);
  }
  const locale = config.cultureName || "en-US";
  const digits = maximumFractionDigits ?? config.decimalDigits ?? 2;
  const fmt = getCurrencyFormatter(config.code, locale, digits);
  return fmt.format(value);
};

/**
 * Formats a monetary value using an arbitrary ISO 4217
 * currency code (e.g. "EUR", "GBP"). The browser's
 * Intl.NumberFormat handles symbol and formatting rules
 * natively for any standard currency code.
 */
export const formatCurrencyByCode = (
  value: number | null | undefined,
  currencyCode: string | null | undefined,
  locale?: string,
  maximumFractionDigits?: number
): string => {
  if (value === null || value === undefined) return "";
  if (!currencyCode) return String(value);
  const fmt = getCurrencyFormatter(currencyCode, locale || "en-US", maximumFractionDigits ?? 2);
  return fmt.format(value);
};

/**
 * Formats currency in compact notation
 * (K for thousands, M for millions).
 */
export const formatCompactCurrency = (
  amount: number | null | string | undefined,
  config: PrimaryCurrencyConfig | null | undefined
): string => {
  const numericAmount = normalizeNumber(amount);
  if (numericAmount === null) {
    return "-";
  }

  const symbol = config?.symbol || "";

  if (numericAmount >= 1_000_000) {
    return `${symbol}${(numericAmount / 1_000_000).toFixed(1)}M`;
  }

  if (numericAmount >= 1_000) {
    return `${symbol}${(numericAmount / 1_000).toFixed(1)}K`;
  }

  return formatPrimaryCurrency(numericAmount, config, 0);
};
