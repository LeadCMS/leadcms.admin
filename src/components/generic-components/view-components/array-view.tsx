import {
  Dialog,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { camelCaseToTitleCase, isJsonArray } from "../common";
import { ViewListItemText } from "../index.styled";
import { ViewProps } from "./common";

export const ArrayView = ({ value, label }: ViewProps<any>): ReactNode => {
  const [open, setOpen] = useState(false);

  if (!value) return <ViewListItemText primary={label} secondary={"N/A"} />;

  if (!isJsonArray(value)) {
    const arrayString = value.join(",");
    return <ViewListItemText primary={label} secondary={arrayString} />;
  }

  const headers = Object.keys(value![0]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <ViewListItemText primary={label} secondary={"Click here to view"} onClick={handleOpen} />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{label}</DialogTitle>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{camelCaseToTitleCase(header)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {value!.map((record: any) => (
              <TableRow key={record.domainName}>
                {headers.map((header) => (
                  <TableCell key={header}>{record[header]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Dialog>
    </>
  );
};
