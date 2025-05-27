import zod from "zod";

export const UserEditValidationScheme = zod.object({
  displayName: zod.string(),
  email: zod.string().email(),
  userName: zod.string(),
  password: zod.string().optional().nullable(),
  generatePassword: zod.boolean().optional(),
  sendPasswordEmail: zod.boolean().optional(),
  language: zod.string().optional(),
});
