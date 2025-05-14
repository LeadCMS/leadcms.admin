const DateValueGetter = (value: Date | string | null) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
};

export default DateValueGetter;
