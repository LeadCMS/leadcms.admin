import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Briefcase, Edit, Mail } from "lucide-react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { ContactDetailsDto, RequestParams } from "lib/network/swagger-client";
import { contactFormBreadcrumbLinks } from "../constants";
import { ModuleWrapper } from "@components/module-wrapper";
import { CoreModule, getEditFormRoute } from "@lib/router";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { getMockConversationsForContact } from "./mock-data";
import { ContactViewOutletContext } from "./types";

type ContactTabValue = "overview" | "communications" | "activity" | "orders" | "deals";

const contactDetailsCache = new Map<number, ContactDetailsDto>();

const tabPathMap: Record<ContactTabValue, string> = {
  overview: "details",
  communications: "communications",
  activity: "activity",
  orders: "orders",
  deals: "deals",
};

const getTabFromPathname = (pathname: string): ContactTabValue => {
  if (pathname.endsWith("/communications")) {
    return "communications";
  }
  if (pathname.endsWith("/activity") || pathname.endsWith("/logs")) {
    return "activity";
  }
  if (pathname.endsWith("/orders") || pathname.endsWith("/invoices")) {
    return "orders";
  }
  if (pathname.endsWith("/deals")) {
    return "deals";
  }
  return "overview";
};

const isContactState = (state: unknown): state is ContactDetailsDto =>
  typeof state === "object" && state !== null && "email" in state;

const getContactDisplayName = (contact: ContactDetailsDto | null) => {
  if (!contact) return "View Contact";
  if (contact.fullName && contact.fullName.trim()) return contact.fullName.trim();
  const firstName = contact.firstName || "";
  const lastName = contact.lastName || "";
  const fallback = `${firstName} ${lastName}`.trim();
  return fallback || "View Contact";
};

const getContactInitials = (contact: ContactDetailsDto | null) => {
  if (!contact) return "C";
  const firstName = contact.firstName || "";
  const lastName = contact.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || contact.fullName || "Contact";
  const parts = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "C";
};

export const ContactBase = () => {
  const { state, pathname } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();

  const initialContactState = isContactState(state) ? state : null;
  const [contact, setContact] = useState<ContactDetailsDto | null>(initialContactState);
  const [tabValue, setTabValue] = useState<ContactTabValue>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const didFetchRef = useRef(false);

  const contactIdFromPath = id ? Number(id) : undefined;
  const contactId = useMemo(() => {
    if (Number.isFinite(contactIdFromPath)) {
      return contactIdFromPath as number;
    }
    if (initialContactState?.id && Number.isFinite(initialContactState.id)) {
      return initialContactState.id;
    }
    return undefined;
  }, [contactIdFromPath, initialContactState?.id]);

  const contactName = getContactDisplayName(contact);
  const conversationCount = getMockConversationsForContact(contactId).length;

  useEffect(() => {
    setTabValue(getTabFromPathname(pathname));
  }, [pathname]);

  useEffect(() => {
    if (initialContactState && !contact) {
      setContact(initialContactState);
    }
  }, [contact, initialContactState]);

  useEffect(() => {
    if (!contactId) return;

    const cachedContact = contactDetailsCache.get(contactId);
    if (cachedContact) {
      setContact(cachedContact);
      return;
    }

    if (didFetchRef.current) return;

    didFetchRef.current = true;
    setIsLoading(true);

    (async () => {
      try {
        const includeRelationsPath =
          "/api/contacts/" + contactId + "?filter%5Binclude%5D=Account&filter%5Binclude%5D=Domain";

        const paramsWithIncludes = {
          path: includeRelationsPath,
        } as unknown as RequestParams;

        const { data } = await client.api.contactsDetail(contactId, paramsWithIncludes);
        contactDetailsCache.set(contactId, data);
        setContact(data);
      } catch (error) {
        console.log(error);
        notificationsService.error("Server error: could not retrieve contact details.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [client, contactId, notificationsService]);

  const handleTabChange = (_event: SyntheticEvent, newValue: ContactTabValue) => {
    setTabValue(newValue);
    navigate(tabPathMap[newValue], { state: contact ?? initialContactState ?? undefined });
  };

  const handleEdit = () => {
    if (!contactId) return;
    navigate(`/${CoreModule.contacts}/${getEditFormRoute(contactId)}`, {
      state: contact ?? initialContactState ?? undefined,
    });
  };

  const handleCreateDeal = () => {
    notificationsService.info("Deal creation will be available once this integration is enabled.");
  };

  const subtitleParts = [contact?.jobTitle, contact?.companyName].filter(
    (part): part is string => !!part && part.trim().length > 0
  );

  const outletContext: ContactViewOutletContext = {
    contact,
    contactId,
    isLoading,
  };

  return (
    <ModuleWrapper breadcrumbs={contactFormBreadcrumbLinks} currentBreadcrumb={contactName}>
      <Card variant="outlined" sx={{ mt: 4, mb: 3 }}>
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
          }}
        >
          <Avatar src={contact?.avatarUrl || ""} sx={{ width: 72, height: 72, fontSize: "1.5rem" }}>
            {getContactInitials(contact)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700}>
              {contactName}
            </Typography>
            {subtitleParts.length > 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitleParts.join(" at ")}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {contact?.email || "No contact details yet"}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Mail size={16} />}
              component="a"
              href={contact?.email ? `mailto:${contact.email}` : undefined}
              disabled={!contact?.email}
            >
              Email
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit size={16} />}
              onClick={handleEdit}
              disabled={!contactId}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Briefcase size={16} />}
              onClick={handleCreateDeal}
            >
              Create Deal
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab value="overview" label="Overview" />
        <Tab
          value="communications"
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>Communications</span>
              {conversationCount > 0 && (
                <Box
                  sx={{
                    minWidth: 20,
                    px: 0.75,
                    borderRadius: 999,
                    bgcolor: "action.selected",
                    fontSize: "0.75rem",
                    lineHeight: 1.4,
                    fontWeight: 600,
                  }}
                >
                  {conversationCount}
                </Box>
              )}
            </Box>
          }
        />
        <Tab value="orders" label="Orders" />
      </Tabs>
      <Divider />

      <Outlet context={outletContext} />
    </ModuleWrapper>
  );
};
