type GridFormatterParam = { value?: Date | string | null };

const getDateValue = (input: GridFormatterParam | Date | string | null) => {
  if (input && typeof input === "object" && "value" in input) {
    return input.value ?? null;
  }
  return input;
};

const DateValueFormatter = (input: GridFormatterParam | Date | string | null) => {
  const value = getDateValue(input);
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

export default DateValueFormatter;
