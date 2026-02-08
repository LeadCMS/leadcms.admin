import { useEffect } from "react";

const isMacPlatform = () => {
  if (typeof navigator === "undefined") {
    return false;
  }
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || navigator.userAgent || "";
  return /mac/i.test(platform);
};

export const useSaveShortcut = (onSave: () => void, enabled = true) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const modifierPressed = isMacPlatform() ? event.metaKey : event.ctrlKey;
      if (!modifierPressed) {
        return;
      }
      if (event.key.toLowerCase() !== "s") {
        return;
      }
      event.preventDefault();
      onSave();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onSave]);
};
