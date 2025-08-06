import { ReactNode } from "react";
import { EditProps } from "@components/generic-components/edit-components/common";
import { DateField } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export const DatetimeEdit = ({
  label,
  example,
  value,
  onChangeValue,
  disabled,
}: EditProps<Date>): ReactNode => {
  return (
    <div title={example}>
      <DateField
        disabled={disabled}
        label={label}
        format="L HH:mm"
        size={"small"}
        fullWidth
        variant="outlined"
        value={dayjs(value)}
        onChange={(newValue) => {
          onChangeValue && onChangeValue(newValue ? newValue.toDate() : null);
        }}
      />
    </div>
  );
};
