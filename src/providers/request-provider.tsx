import {
  createContext,
  memo,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Api, ApiConfig } from "lib/network/swagger-client";
import { buildAbsoluteUrl } from "lib/network/utils";
import { useAuthState } from "./auth-provider";

type getTokenFn = () => Promise<string | undefined>;

type NormalizedApiError = {
  status: number;
  title?: string;
  message: string;
  errors?: Record<string, string[]>;
  type?: string;
  traceId?: string;
  raw?: unknown;
};

const isFetchResponse = (value: unknown): value is Response => {
  return (
    !!value &&
    typeof value === "object" &&
    "status" in value &&
    typeof (value as Response).status === "number" &&
    "json" in value &&
    typeof (value as Response).json === "function"
  );
};

const toNormalizedApiError = (error: unknown, fallbackStatus?: number): NormalizedApiError => {
  const err = error as Record<string, unknown>;
  const status =
    (typeof err?.status === "number" ? err.status : undefined) ?? fallbackStatus ?? 500;
  const title =
    (typeof err?.title === "string" && err.title) ||
    (typeof err?.message === "string" && err.message) ||
    "Request failed";

  return {
    status,
    title,
    message: title,
    errors:
      err?.errors && typeof err.errors === "object"
        ? (err.errors as Record<string, string[]>)
        : undefined,
    type: typeof err?.type === "string" ? err.type : undefined,
    traceId: typeof err?.traceId === "string" ? err.traceId : undefined,
    raw: error,
  };
};

const parseResponseError = async (response: Response): Promise<NormalizedApiError> => {
  let payload: unknown = undefined;
  try {
    payload = await response.clone().json();
  } catch {
    try {
      payload = await response.clone().text();
    } catch {
      payload = undefined;
    }
  }

  if (payload && typeof payload === "object") {
    return toNormalizedApiError(payload, response.status);
  }

  const fallbackMessage =
    typeof payload === "string" && payload.trim().length > 0
      ? payload.trim()
      : response.statusText || "Request failed";

  return {
    status: response.status,
    title: fallbackMessage,
    message: fallbackMessage,
    raw: payload,
  };
};

class ApiExtended<getTokenFn> extends Api<getTokenFn> {
  constructor(apiConfig?: ApiConfig<getTokenFn>) {
    super(apiConfig);
    Object.keys(this.api).forEach((key) => {
      const apiMap = this.api as Record<string, unknown>;
      const oldFunc = apiMap[key] as (...args: unknown[]) => Promise<unknown>;
      apiMap[key] = async (...args: unknown[]) => {
        try {
          const response = (await oldFunc(...args)) as {
            error?: unknown;
            status?: number;
          };

          if (response.error) {
            if (response.status == 401 && this.logoutFunc) {
              this.logoutFunc();
            }
            throw toNormalizedApiError(response.error, response.status);
          }

          return response;
        } catch (e: unknown) {
          if (isFetchResponse(e)) {
            if (e.status == 401 && this.logoutFunc) {
              this.logoutFunc();
            }
            throw await parseResponseError(e);
          }

          const caught = e as { error?: unknown; status?: number };

          if (caught.error) {
            if (caught.status == 401 && this.logoutFunc) {
              this.logoutFunc();
            }
            throw toNormalizedApiError(caught.error, caught.status);
          }

          throw e;
        }
      };
    });
  }
  logoutFunc?: () => Promise<void>;
}

const client = new ApiExtended<getTokenFn>({
  baseUrl: buildAbsoluteUrl("/").replace(/\/$/, ""),
  securityWorker: async (getToken) => {
    const token = await getToken?.();
    if (token) {
      return {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
    }
  },
  baseApiParams: {
    secure: true,
  },
});

export type RequestContextType = {
  client: ApiExtended<getTokenFn>;
};

const requestContext = createContext<RequestContextType>({ client });

export const RequestProvider = memo(function RequestProvider({ children }: PropsWithChildren) {
  const { getToken, reLogin } = useAuthState();
  const [isReady, setIsReady] = useState<boolean>(false);
  useEffect(() => {
    client.setSecurityData(getToken);
    setIsReady(true);
  }, [getToken]);
  client.logoutFunc = reLogin;
  const value = useMemo(() => ({ client }), []);

  return <requestContext.Provider value={value}>{isReady && children}</requestContext.Provider>;
});

export const useRequestContext = () => useContext(requestContext);
