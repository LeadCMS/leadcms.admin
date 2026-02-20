export interface EmailGroupAutoCompleteProps {
  disabled?: boolean;
  label: string;
  placeholder: string;
  value: number;
  error: boolean | undefined;
  helperText: string | string[] | false | undefined;
  onChange: (value: number) => void;
  onChangeWithLabel?: (value: number, label: string) => void;
}

export interface EmailGroupOption {
  id: number;
  label: string;
}

export interface CreateNewEmailGroupProps {
  onChange: (value: EmailGroupOption) => void;
  isOpen: boolean;
  onClose: () => void;
}
