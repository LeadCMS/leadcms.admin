import zod from "zod";

export const EmailGroupEditValidationScheme = zod.object({
  name: zod.string(),
  language: zod.string().min(1, "Language is required"),
});
