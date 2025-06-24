import { memo, PropsWithChildren, useEffect, createContext, useState, useContext } from "react";
import { useRequestContext } from "./request-provider";
import { useAuthState } from "./auth-provider";
import { UserDetailsDto } from "@lib/network/swagger-client";
import { useNotificationsService } from "@hooks";

const UserContext = createContext<UserContextData | null>(null);

interface UserContextData {
  details: UserDetailsDto | null;
  refresh: () => Promise<void>;
}

export const UserProvider = memo(function UserProvider({ children }: PropsWithChildren) {
  const requestContext = useRequestContext();
  const authState = useAuthState();
  const { notificationsService } = useNotificationsService();
  const [currentUser, setCurrentUser] = useState<UserDetailsDto | null>(null);

  const infoRetrieve = async () => {
    const resp = await requestContext.client.api.usersMeList();
    if (resp.error) {
      notificationsService.error("Unable to retrieve user info data");
      setCurrentUser(null);
      return;
    }
    setCurrentUser(resp.data);
  };

  useEffect(() => {
    if (!authState.account && !authState.localToken) return;
    infoRetrieve();
  }, [authState.account, authState.localToken]);
  const ctxValue = {
    details: currentUser,
    refresh: infoRetrieve,
  } as UserContextData;
  return <UserContext.Provider value={ctxValue}>{children}</UserContext.Provider>;
});

export const useUserInfo = () => {
  const ctx = useContext(UserContext);
  return ctx;
};
