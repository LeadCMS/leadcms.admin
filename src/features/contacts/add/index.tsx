import { useState } from "react";
import { ContactCreateDto, ContactDetailsDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { ContactForm } from "../form";

export const ContactAdd = () => {
  const { client } = useRequestContext();

  const [contact] = useState<ContactDetailsDto>({ email: "" });

  const handleSave = async (newContact: ContactDetailsDto) => {
    const createDto: ContactCreateDto = {
      ...newContact,
    };
    await client.api.contactsCreate(createDto);
  };

  return <ContactForm contact={contact} handleSave={handleSave} isEdit={false} />;
};
