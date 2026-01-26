import { useEffect, useState } from "react";
import { ContactDetailsDto, ContactUpdateDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { useParams } from "react-router-dom";
import { type IdRouteParams } from "@lib/router";
import { ContactForm } from "../form";

export const ContactEdit = () => {
  const { client } = useRequestContext();

  const { id: idParam } = useParams<IdRouteParams>();
  const id = Number(idParam);

  const [contact, setContact] = useState<ContactDetailsDto>({
    firstName: "",
    email: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.api.contactsDetail(id);
        setContact(data);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [client]);

  const handleSave = async (newContact: ContactDetailsDto) => {
    const updateDto: ContactUpdateDto = {
      ...newContact,
    };
    await client.api.contactsPartialUpdate(id, updateDto);
  };

  const handleDelete = async (contactId: number) => {
    await client.api.contactsDelete(contactId);
  };

  return (
    <ContactForm
      contact={contact}
      handleSave={handleSave}
      handleDelete={handleDelete}
      isEdit={true}
    />
  );
};
