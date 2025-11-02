import React from "react";

export interface RemoteAutoCompleteProps {
  label: string;
  placeholder: string;
  freeSolo: boolean;
  multiple?: boolean;
  limit?: number;
  value: string | string[] | null;
  error: boolean | undefined;
  helperText: string | string[] | false | undefined;
  onChange: (event: React.SyntheticEvent<Element, Event>, value: string | string[] | null) => void;
  type: RemoteValues;
  contentType?: string;
  language?: string;
}

export enum RemoteValues {
  TAGS = 1,
  CATEGORIES,
  AUTHORS,
}
