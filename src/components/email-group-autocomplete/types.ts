export interface EmailGroupAutoCompleteProps {
  disabled?: boolean;
  label: string;
  placeholder: string;
  value: number;
  defaultLanguage?: string;
  error: boolean | undefined;
  helperText: string | string[] | false | undefined;
  onChange: (value: number) => void;
  onChangeWithLabel?: (value: number, label: string) => void;
  onBlur?: () => void;
}

export interface EmailGroupOption {
  id: number;
  label: string;
  language?: string | null;
}

export interface CreateNewEmailGroupProps {
  onChange: (value: EmailGroupOption) => void;
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage?: string;
}
