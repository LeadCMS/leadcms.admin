import { useCallback } from "react";
import { useConfig } from "@providers/config-provider";
import {
  formatPrimaryCurrency,
  formatCurrencyByCode,
  formatCompactCurrency,
} from "@utils/currency-formatter";

/**
 * Hook that provides currency formatting functions
 * based on the server's primaryCurrency configuration.
 *
 * - formatMoney: formats using the primary currency
 * - formatByCode: formats using an arbitrary ISO 4217
 *   currency code (e.g. "EUR", "GBP")
 * - formatCompact: compact notation (K/M) with the
 *   primary currency symbol
 */
export const useCurrencyFormatter = () => {
  const { primaryCurrency } = useConfig();

  const formatMoney = useCallback(
    (value: number | null | undefined, maximumFractionDigits?: number): string =>
      formatPrimaryCurrency(value, primaryCurrency, maximumFractionDigits),
    [primaryCurrency]
  );

  const formatByCode = useCallback(
    (
      value: number | null | undefined,
      currencyCode: string | null | undefined,
      maximumFractionDigits?: number
    ): string =>
      formatCurrencyByCode(
        value,
        currencyCode,
        primaryCurrency?.cultureName,
        maximumFractionDigits
      ),
    [primaryCurrency]
  );

  const formatCompact = useCallback(
    (amount: number | null | string | undefined): string =>
      formatCompactCurrency(amount, primaryCurrency),
    [primaryCurrency]
  );

  return {
    formatMoney,
    formatByCode,
    formatCompact,
    primaryCurrency,
  };
};
