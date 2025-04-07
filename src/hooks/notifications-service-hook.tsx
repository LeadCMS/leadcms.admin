import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface NotificationOptions {
  autoClose?: number;
}

export interface ErrorData {
  title: string;
  onClick?: () => void;
}

export interface PromiseNotificationOptions {
  pending: React.ReactNode;
  success: React.ReactNode;
  error: (data: any) => React.ReactNode | ErrorData;
}

export interface NotificationsServiceSettings {
  defaultAutoClose?: number;
}

function instanceOfErrorData(object: any): object is ErrorData {
  return true;
}

export class NotificationsService {
  defaultAutoClose: number;

  constructor(settings: NotificationsServiceSettings = {}) {
    this.defaultAutoClose = settings.defaultAutoClose ?? 5000;
  }

  error(msg: string | Error | unknown, options: NotificationOptions = {}) {
    const error = msg instanceof Error ? msg.message : JSON.stringify(msg, null, 2);
    toast.error(error, {
      autoClose: options.autoClose ?? this.defaultAutoClose,
    });
  }

  errorWithContent(content: JSX.Element, options: NotificationOptions = {}) {
    toast.error(content, {
      autoClose: options.autoClose ?? this.defaultAutoClose,
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
  settings: NotificationsServiceSettings = {},
): { notificationsService: NotificationsService } => {
  const notificationsService = new NotificationsService(settings);
  return { notificationsService: notificationsService };
};
