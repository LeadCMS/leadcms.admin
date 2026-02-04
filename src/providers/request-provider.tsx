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

class ApiExtended<getTokenFn> extends Api<getTokenFn> {
  constructor(apiConfig?: ApiConfig<getTokenFn>) {
    super(apiConfig);
    Object.keys(this.api).forEach((key) => {
      const oldFunc = (this.api as unknown as any)[key];
      (this.api as unknown as any)[key] = async (...args: any[]) => {
        try {
          const response = await oldFunc(...args);
          if (response.error) {
            if (response.status == 401 && this.logoutFunc) {
              this.logoutFunc();
            }
            throw response.error;
          }
          return response;
        } catch (e: any) {
          if (e.error) {
            if (e.status == 401 && this.logoutFunc) {
              this.logoutFunc();
            }
            throw e;
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
