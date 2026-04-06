import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useConfig } from "@providers/config-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { useUserInfo } from "@providers/user-provider";
import useLocalStorage from "use-local-storage";
import { emailTemplateGroupFilterStorageKey } from "@features/email-templates/constants";
import { LanguageSelect } from "@components/language-select";
import { EmailGroupAutocomplete } from "@components/email-group-autocomplete";
import { MaskedSlugInput } from "@components/masked-slug-input";
import { RemoteAutocomplete } from "@components/remote-autocomplete";
import { RemoteValues } from "@components/remote-autocomplete/types";
import {
  EMAIL_TEMPLATE_CATEGORY_OPTIONS,
  EmailTemplateCategory,
} from "@utils/email-template-category";

export interface AddTemplateDialogResult {
  language: string;
  subject: string;
  emailGroupId: number;
  name: string;
  fromName: string;
  fromEmail: string;
  category: EmailTemplateCategory;
}

interface AddTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (result: AddTemplateDialogResult) => void;
  defaultEmailGroupId?: number | "";
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_./]/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getRequiredError = (value: string, isTouched: boolean | undefined, label: string) => {
  if (!value.trim()) {
    return isTouched ? `${label} is required` : null;
  }

  return null;
};

export const AddTemplateDialog = ({
  open,
  onClose,
  onAdd,
  defaultEmailGroupId,
}: AddTemplateDialogProps) => {
  const { config } = useConfig();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const userInfo = useUserInfo();
  const [storedGroupId] = useLocalStorage<number | "">(emailTemplateGroupFilterStorageKey, "");

  const [language, setLanguage] = useState("");
  const [subject, setSubject] = useState("");
  const [emailGroupId, setEmailGroupId] = useState(0);
  const [name, setName] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [category, setCategory] = useState<EmailTemplateCategory>("General");
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;

  const languageError =
    hasMultipleLanguages && !language && touched.language ? "Language is required" : undefined;

  const hasValidTemplateName = /^[\p{L}\p{N}][\p{L}\p{N}\-_./]*[\p{L}\p{N}]$|^[\p{L}\p{N}]$/u.test(
    name
  );
  const hasValidSenderEmail = emailPattern.test(fromEmail);

  const subjectError = getRequiredError(subject, touched.subject, "Subject");

  const emailGroupError = !emailGroupId
    ? touched.emailGroupId
      ? "Email Group is required"
      : undefined
    : undefined;

  const requiredNameError = getRequiredError(name, touched.name, "Name");
  let nameError = requiredNameError;
  if (!nameError && !hasValidTemplateName) {
    nameError = "Use letters, numbers, hyphens, underscores, dots, or slashes";
  }

  const fromNameError = getRequiredError(fromName, touched.fromName, "Sender Name");
  const fromEmailRequiredError = getRequiredError(fromEmail, touched.fromEmail, "Sender Email");
  let fromEmailError = fromEmailRequiredError;
  if (!fromEmailError && !hasValidSenderEmail) {
    fromEmailError = "Enter a valid email address";
  }

  const isValid =
    (!hasMultipleLanguages || !!language) &&
    !!subject.trim() &&
    !!emailGroupId &&
    !!name.trim() &&
    !!fromName.trim() &&
    !!fromEmail.trim() &&
    !subjectError &&
    !emailGroupError &&
    !nameError &&
    !fromNameError &&
    !fromEmailError;

  useEffect(() => {
    if (!open) return;

    const defaultLanguage =
      (isLanguageFilterActive && selectedLanguage !== "all" ? selectedLanguage : "") ||
      config?.defaultLanguage ||
      "";
    const defaultSenderName = userInfo?.details?.displayName || userInfo?.details?.userName || "";
    const defaultSenderEmail = userInfo?.details?.email || "";

    setLanguage(defaultLanguage);
    setSubject("");
    const initialEmailGroupId =
      defaultEmailGroupId !== undefined
        ? Number(defaultEmailGroupId || 0)
        : storedGroupId
        ? Number(storedGroupId)
        : 0;

    setEmailGroupId(initialEmailGroupId);
    setName("");
    setFromName(defaultSenderName);
    setFromEmail(defaultSenderEmail);
    setCategory("General");
    setNameManuallyEdited(false);
    setTouched({});
  }, [
    config?.defaultLanguage,
    isLanguageFilterActive,
    open,
    selectedLanguage,
    defaultEmailGroupId,
    storedGroupId,
    userInfo?.details?.displayName,
    userInfo?.details?.email,
    userInfo?.details?.userName,
  ]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubject(value);
    setTouched((prev) => ({ ...prev, subject: true }));

    if (!nameManuallyEdited) {
      setName(slugify(value));
    }
  };

  const handleNameChange = (value: string) => {
    setNameManuallyEdited(true);
    setTouched((prev) => ({ ...prev, name: true }));
    setName(value);
  };

  const handleClose = () => {
    onClose();
  };

  const handleAdd = () => {
    setTouched({
      language: true,
      subject: true,
      emailGroupId: true,
      name: true,
      fromName: true,
      fromEmail: true,
    });

    if (!isValid) {
      return;
    }

    onAdd({
      language,
      subject,
      emailGroupId,
      name,
      fromName,
      fromEmail,
      category,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Template</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, mt: 1 }}>
          Fill in the main details before creating the template.
        </Typography>

        <Grid container rowSpacing={4} columnSpacing={3}>
          {hasMultipleLanguages && (
            <Grid size={{ xs: 12 }}>
              <LanguageSelect
                value={language}
                onChange={(value) => {
                  setLanguage(value);
                  setTouched((prev) => ({ ...prev, language: true }));
                }}
                label="Language"
                error={!!languageError}
                helperText={languageError || "Language version of this template."}
                required
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={handleSubjectChange}
              onBlur={() => setTouched((prev) => ({ ...prev, subject: true }))}
              required
              placeholder="Enter email subject"
              error={!!subjectError}
              helperText={subjectError || "Shown in the email subject line."}
              slotProps={{ formHelperText: { sx: { ml: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <EmailGroupAutocomplete
              disabled={false}
              label="Email Group"
              value={emailGroupId}
              defaultLanguage={language}
              error={!!emailGroupError}
              helperText={emailGroupError || "Groups related emails for easier use."}
              placeholder="Select group"
              onChange={(value) => {
                setEmailGroupId(value);
                setTouched((prev) => ({ ...prev, emailGroupId: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, emailGroupId: true }))}
            />
          </Grid>

          {hasAIAssistance && (
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value as EmailTemplateCategory)}
                >
                  {EMAIL_TEMPLATE_CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                Mostly used by AI to understand what kind of email this is and generate better
                templates.
              </Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <MaskedSlugInput
              label="Name"
              value={name}
              onChange={handleNameChange}
              helperText={nameError || "Unique key used later in forms or API."}
              error={!!nameError}
              placeholder="enter-template-key"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RemoteAutocomplete
              type={RemoteValues.SENDER_NAMES}
              label="Sender Name"
              placeholder="Enter sender name"
              value={fromName}
              onChange={(_event, value) => {
                setFromName((value as string) || "");
                setTouched((prev) => ({ ...prev, fromName: true }));
              }}
              onInputChange={(value) => {
                setFromName(value);
                setTouched((prev) => ({ ...prev, fromName: true }));
              }}
              freeSolo
              multiple={false}
              limit={1}
              language={language}
              error={!!fromNameError}
              helperText={fromNameError || "Default sender name."}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RemoteAutocomplete
              type={RemoteValues.SENDER_EMAILS}
              label="Sender Email"
              placeholder="Enter sender email"
              value={fromEmail}
              onChange={(_event, value) => {
                setFromEmail((value as string) || "");
                setTouched((prev) => ({ ...prev, fromEmail: true }));
              }}
              onInputChange={(value) => {
                setFromEmail(value);
                setTouched((prev) => ({ ...prev, fromEmail: true }));
              }}
              freeSolo
              multiple={false}
              limit={1}
              language={language}
              error={!!fromEmailError}
              helperText={fromEmailError || "Default sender email."}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Alert severity="warning" sx={{ py: 0.5, alignItems: "center" }}>
              Sender must be trusted or allowed in your email provider, or sending may fail.
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!isValid}>
          Continue to Template Editor
        </Button>
      </DialogActions>
    </Dialog>
  );
};
