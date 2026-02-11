import { AccountDetailsDto } from "@lib/network/swagger-client";

export interface AccountViewOutletContext {
  account: AccountDetailsDto | null;
  accountId?: number;
  isLoading: boolean;
}
