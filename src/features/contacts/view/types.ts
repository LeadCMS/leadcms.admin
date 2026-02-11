import { ContactDetailsDto } from "@lib/network/swagger-client";

export interface ContactViewOutletContext {
  contact: ContactDetailsDto | null;
  contactId?: number;
  isLoading: boolean;
}
