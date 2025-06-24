import { ReactNode } from "react";
import { ViewListItemText } from "../index.styled";
import { ViewProps } from "./common";

export const TextView = ({ value, label }: ViewProps<any>): ReactNode => {
  return <ViewListItemText primary={label} secondary={value} />;
};
