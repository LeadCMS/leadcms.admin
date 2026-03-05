import { timezones } from "./constants";

/**
 * Formats a timezone offset in minutes to a short UTC string.
 * e.g. 330 → "UTC+5:30", -300 → "UTC-5", 0 → "UTC+0"
 */
export const formatTimezoneShort = (offsetMinutes: number | null | undefined): string => {
  if (offsetMinutes == null) return "";
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return minutes ? `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}` : `UTC${sign}${hours}`;
};

/**
 * Returns the full descriptive timezone label from
 * the timezones constant, falling back to the short format.
 * e.g. 330 → "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi"
 */
export const formatTimezoneLong = (offsetMinutes: number | null | undefined): string => {
  if (offsetMinutes == null) return "";
  const tz = timezones.find((t) => t.value === offsetMinutes);
  return tz?.label || formatTimezoneShort(offsetMinutes);
};

/**
 * Returns both short and long timezone labels for a given
 * offset in minutes.
 */
export const getTimezoneInfo = (offsetMinutes: number | null | undefined) => ({
  short: formatTimezoneShort(offsetMinutes),
  long: formatTimezoneLong(offsetMinutes),
});
