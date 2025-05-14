const DateValueFormatter = (value: Date | string | null) => {
  if (!value) return "-";

  return value instanceof Date ? value.toLocaleDateString() : new Date(value).toLocaleDateString();
};

export default DateValueFormatter;
