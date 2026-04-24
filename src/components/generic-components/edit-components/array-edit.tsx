import { ReactNode, useState } from "react";
import { EditProps } from "@components/generic-components/edit-components/common";
import {
  KnownTagsAutocomplete,
  type KnownTagsEntityType,
} from "@components/known-tags-autocomplete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import { camelCaseToTitleCase } from "../common";
import { getModuleNameFromUrl } from "@utils/general-helper";

type JsonArray = {
  [key: string]: any;
};

const tagEntityTypeByModuleName: Record<string, KnownTagsEntityType> = {
  Accounts: "accounts",
  Comments: "comments",
  Contacts: "contacts",
  Content: "content",
  Deals: "deals",
  Domains: "domains",
  Media: "media",
  Orders: "orders",
};

const isObjectArray = (item: unknown): item is JsonArray[] =>
  Array.isArray(item) &&
  item.length > 0 &&
  item.every((entry) => typeof entry === "object" && entry !== null && !Array.isArray(entry));

export const ArrayEdit = ({
  key,
  label,
  example,
  required,
  value,
  disabled,
  onChangeValue,
  error,
}: EditProps<any>): ReactNode => {
  const [open, setOpen] = useState(false);
  const moduleName = getModuleNameFromUrl();
  const tagEntityType = tagEntityTypeByModuleName[moduleName];
  const stringArrayValue = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

  if (key === "tags" && tagEntityType) {
    return (
      <KnownTagsAutocomplete
        entityType={tagEntityType}
        label={label}
        placeholder="Add tag"
        disabled={disabled}
        error={!!error}
        helperText={error}
        value={stringArrayValue}
        onChange={onChangeValue}
      />
    );
  }

  if (!value)
    return (
      <TextField key={key} label={label} value={"N/A"} disabled={true} size={"small"} fullWidth />
    );

  if (!isObjectArray(value)) {
    const arrayString = Array.isArray(value) ? value.join(", ") : String(value);
    return (
      <TextField
        key={key}
        title={example}
        type={"text"}
        label={label}
        disabled={true}
        required={required}
        error={!!error}
        helperText={error}
        value={arrayString}
        variant={"outlined"}
        fullWidth={true}
        size={"small"}
      />
    );
  }

  const headers = Object.keys(value[0]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <TextField
        sx={{ input: { cursor: "pointer" } }}
        key={key}
        title={example}
        type={"text"}
        label={label}
        disabled={true}
        required={required}
        error={!!error}
        helperText={error}
        value={"Click here to view"}
        onClick={handleOpen}
        variant={"outlined"}
        fullWidth={true}
        size={"small"}
      />
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
            {value.map((record: any) => (
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
