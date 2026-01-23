import { toast } from "react-toastify";
import { useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";

export interface NotificationOptions {
  autoClose?: number;
  closeOnClick?: boolean;
}

export interface ErrorData {
  title: string;
  onClick?: () => void;
}

export interface PromiseNotificationOptions {
  pending: React.ReactNode;
  success: React.ReactNode;
  error: (data: unknown) => React.ReactNode | ErrorData;
}

export interface NotificationsServiceSettings {
  defaultAutoClose?: number;
}

function instanceOfErrorData(object: unknown): object is ErrorData {
  return true;
}

export class NotificationsService {
  defaultAutoClose: number;

  constructor(settings: NotificationsServiceSettings = {}) {
    this.defaultAutoClose = settings.defaultAutoClose ?? 5000;
  }

  error(msg: string | Error | unknown, options: NotificationOptions = {}) {
    let errorMessage: string;

    if (msg instanceof Error) {
      errorMessage = msg.message;
    } else if (typeof msg === "string") {
      errorMessage = msg;
    } else {
      errorMessage = JSON.stringify(msg, null, 2);
    }

    toast.error(errorMessage, {
      autoClose: options.autoClose ?? this.defaultAutoClose,
    });
  }

  errorWithContent(content: JSX.Element, options: NotificationOptions = {}) {
    toast.error(content, {
      autoClose: options.autoClose ?? this.defaultAutoClose,
      closeOnClick: options.closeOnClick ?? true,
    });
  }

  warning(msg: string, options: NotificationOptions = {}) {
    toast.warn(msg, {
      autoClose: options.autoClose ?? this.defaultAutoClose,
    });
  }

  info(msg: string, options: NotificationOptions = {}) {
    toast.info(msg, {
      autoClose: options.autoClose ?? this.defaultAutoClose,
    });
  }

  success(msg: string, options: NotificationOptions = {}) {
    toast.success(msg, {
      autoClose: options.autoClose ?? this.defaultAutoClose,
    });
  }

  promise(promise: Promise<unknown>, options: PromiseNotificationOptions) {
    toast.promise(promise, {
      pending: {
        render() {
          return options.pending;
        },
      },
      success: {
        render() {
          return options.success;
        },
      },
      error: {
        render(data) {
          const err = options.error(data);
          if (instanceOfErrorData(err)) {
            return (
              <div
                onClick={() => {
                  data.closeToast && data.closeToast();
                  err.onClick && err.onClick();
                }}
              >
                {(err as ErrorData).title}
              </div>
            );
          }
        },
      },
    });
  }
}

export const useNotificationsService = (
  settings: NotificationsServiceSettings = {}
): { notificationsService: NotificationsService } => {
  const defaultAutoClose = settings.defaultAutoClose ?? 5000;
  const notificationsService = useMemo(
    () => new NotificationsService({ defaultAutoClose }),
    [defaultAutoClose]
  );
  return { notificationsService: notificationsService };
};
