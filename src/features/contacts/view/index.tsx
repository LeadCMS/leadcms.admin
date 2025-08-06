import { useEffect, useState } from "react";
import { Divider, ListItem, ListItemAvatar, Tab, Tabs } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ContactDetailsDto } from "lib/network/swagger-client";
import { contactFormBreadcrumbLinks } from "../constants";
import { ModuleWrapper } from "@components/module-wrapper";
import { AvatarContainer, ContactNameListItemTextLarge } from "../index.styled";

export const ContactBase = () => {
  const { state } = useLocation();
  const contact = state as ContactDetailsDto;
  const contactFullName = `${contact.firstName || ""} ${contact.lastName || ""}`;

  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState("details");

  const handleChange = (event: React.ChangeEvent<any>, newValue: string) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    navigate(tabValue, { state: state });
  }, [tabValue]);

  return (
    <ModuleWrapper breadcrumbs={contactFormBreadcrumbLinks} currentBreadcrumb={contactFullName}>
      <ListItem>
        <ListItemAvatar>
          <AvatarContainer src={contact.avatarUrl!}></AvatarContainer>
        </ListItemAvatar>
        <ContactNameListItemTextLarge
          primary={`${contact.firstName || ""} ${contact.lastName || ""}`}
          secondary={`contact_id: ${contact.id}`}
        />
      </ListItem>
      {/* <Tabs value={tabValue} onChange={handleChange}>
        <Tab value="details" label="Details" />
        <Tab value="logs" label="Logs" />
      </Tabs> */}
      {/* <Divider></Divider> */}
      <Outlet />
    </ModuleWrapper>
  );
};
