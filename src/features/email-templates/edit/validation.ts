import zod from "zod";

export const EmailTemplateEditValidationScheme = zod.object({
  name: zod.string(),
  subject: zod.string(),
  bodyTemplate: zod.string(),
  fromEmail: zod.string().email(),
  fromName: zod.string(),
  language: zod.string(),
  emailGroupId: zod.number().min(1, "Email Group is required"),
});
