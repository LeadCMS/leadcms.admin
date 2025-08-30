import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface UseNavigationGuardProps {
  when: boolean;
  message?: string;
  onBeforeUnload?: () => boolean;
}

export const useNavigationGuard = ({
  when,
  message = "You have unsaved changes. Are you sure you want to leave?",
  onBeforeUnload,
}: UseNavigationGuardProps) => {
  const navigate = useNavigate();

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (when) {
        if (onBeforeUnload && !onBeforeUnload()) {
          return;
        }
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    if (when) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when, message, onBeforeUnload]);

  // Handle programmatic navigation
  const guardedNavigate = useCallback(
    (to: string, options?: { replace?: boolean; state?: unknown }) => {
      if (when) {
        const confirmed = window.confirm(message);
        if (confirmed) {
          navigate(to, options);
        }
      } else {
        navigate(to, options);
      }
    },
    [when, message, navigate]
  );

  return { guardedNavigate };
};
