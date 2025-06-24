import { ReactNode } from "react";
import { ViewListItemText } from "../index.styled";
import { ViewProps } from "./common";

export const DateTimeView = ({ value, label }: ViewProps<any>): ReactNode => {
  return (
    <ViewListItemText primary={label} secondary={value ? new Date(value).toLocaleString() : null} />
  );
};
