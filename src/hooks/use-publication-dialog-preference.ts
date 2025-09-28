import useLocalStorage from "use-local-storage";

const PUBLICATION_DIALOG_PREFERENCE_KEY = "publication-dialog-preference";

export interface PublicationDialogPreference {
  showDialog: boolean;
}

export const usePublicationDialogPreference = () => {
  const [preference, setPreference] = useLocalStorage<PublicationDialogPreference>(
    PUBLICATION_DIALOG_PREFERENCE_KEY,
    { showDialog: true }
  );

  const shouldShowDialog = () => preference.showDialog;

  const setDontShowAgain = () => {
    setPreference({ showDialog: false });
  };

  const resetPreference = () => {
    setPreference({ showDialog: true });
  };

  return {
    shouldShowDialog,
    setDontShowAgain,
    resetPreference,
  };
};
