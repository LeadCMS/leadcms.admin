import { EmailTemplateDetailsDto } from "@lib/network/swagger-client";

export type EmailTemplateCategory = NonNullable<EmailTemplateDetailsDto["category"]>;

export interface EmailTemplateCategoryOption {
  value: EmailTemplateCategory;
  label: string;
  note: string;
}

export const EMAIL_TEMPLATE_CATEGORY_OPTIONS: EmailTemplateCategoryOption[] = [
  {
    value: "General",
    label: "General",
    note: "General-purpose guidance without extra style constraints.",
  },
  {
    value: "PlainText",
    label: "Plain Text",
    note: "AI keeps it personal and minimally formatted, like a real 1:1 email.",
  },
  {
    value: "SimpleProfessional",
    label: "Simple Professional",
    note: "AI uses a clean professional structure with concise sections and subtle CTA.",
  },
  {
    value: "Newsletter",
    label: "Newsletter",
    note: "AI favors multi-section editorial layouts with content blocks and read-more links.",
  },
  {
    value: "Promotional",
    label: "Promotional",
    note: "AI prioritizes offer-first marketing structure, strong CTAs, and urgency cues.",
  },
  {
    value: "Transactional",
    label: "Transactional",
    note: "AI emphasizes clear factual details, structure, and minimal promotional styling.",
  },
  {
    value: "Lifecycle",
    label: "Lifecycle",
    note: "AI shapes onboarding or drip-style messaging with progressive next-step CTAs.",
  },
  {
    value: "Digest",
    label: "Digest",
    note: "AI prefers report-style layout with summaries, metrics, and scan-friendly sections.",
  },
  {
    value: "Event",
    label: "Event",
    note: "AI foregrounds event details, RSVP CTA, and logistics sections.",
  },
  {
    value: "Alert",
    label: "Alert",
    note: "AI keeps it compact and urgent with clear action and severity-focused messaging.",
  },
];

export const getEmailTemplateCategoryNote = (
  category?: EmailTemplateDetailsDto["category"] | null
): string => {
  const selected = category || "General";
  const option = EMAIL_TEMPLATE_CATEGORY_OPTIONS.find((item) => item.value === selected);
  return option?.note || EMAIL_TEMPLATE_CATEGORY_OPTIONS[0].note;
};
