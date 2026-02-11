import { ChipProps } from "@mui/material";

export type ContactConversationStatus = "open" | "pending" | "closed";
export type ContactConversationChannel = "email" | "sms";

export interface ContactConversation {
  id: string;
  contactId: number;
  subject: string;
  preview: string;
  status: ContactConversationStatus;
  channel: ContactConversationChannel;
  messageCount: number;
  lastMessageAt: string;
}

export type ContactActivityType =
  | "email_open"
  | "page_view"
  | "form_submission"
  | "download"
  | "note";

export interface ContactActivityItem {
  id: string;
  contactId: number;
  type: ContactActivityType;
  description: string;
  timestamp: string;
}

export type ContactDealStage =
  | "Prospecting"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Closed";

export interface ContactDealItem {
  id: string;
  contactId: number;
  name: string;
  stage: ContactDealStage;
  amount: number;
  closeDate: string;
  owner: string;
}

const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000).toISOString();

export const mockContactConversations: ContactConversation[] = [
  {
    id: "conv-1001",
    contactId: 1,
    subject: "Q1 Renewal Follow-up",
    preview: "Thanks for the update. Please send the revised pricing for annual terms.",
    status: "open",
    channel: "email",
    messageCount: 6,
    lastMessageAt: hoursAgo(2),
  },
  {
    id: "conv-1002",
    contactId: 1,
    subject: "Security Questionnaire",
    preview: "We reviewed the SOC2 documentation and have two additional compliance questions.",
    status: "pending",
    channel: "email",
    messageCount: 4,
    lastMessageAt: daysAgo(1),
  },
  {
    id: "conv-1003",
    contactId: 1,
    subject: "Demo recap",
    preview: "Great session. We are sharing this internally and will come back next week.",
    status: "closed",
    channel: "sms",
    messageCount: 3,
    lastMessageAt: daysAgo(4),
  },
  {
    id: "conv-2001",
    contactId: 2,
    subject: "Onboarding questions",
    preview: "Can you confirm if the migration assistant supports CSV headers mapping?",
    status: "open",
    channel: "email",
    messageCount: 2,
    lastMessageAt: hoursAgo(5),
  },
];

export const mockContactActivities: ContactActivityItem[] = [
  {
    id: "act-1001",
    contactId: 1,
    type: "email_open",
    description: "Opened email Q1 Product Update",
    timestamp: hoursAgo(1),
  },
  {
    id: "act-1002",
    contactId: 1,
    type: "page_view",
    description: "Viewed the Pricing page",
    timestamp: hoursAgo(5),
  },
  {
    id: "act-1003",
    contactId: 1,
    type: "form_submission",
    description: "Submitted request form",
    timestamp: daysAgo(1),
  },
  {
    id: "act-1004",
    contactId: 1,
    type: "download",
    description: "Downloaded Enterprise Security Guide",
    timestamp: daysAgo(2),
  },
  {
    id: "act-1005",
    contactId: 1,
    type: "note",
    description: "Internal note: requested legal review before procurement",
    timestamp: daysAgo(3),
  },
  {
    id: "act-2001",
    contactId: 2,
    type: "page_view",
    description: "Viewed integrations page",
    timestamp: hoursAgo(8),
  },
];

export const mockContactDeals: ContactDealItem[] = [
  {
    id: "deal-1001",
    contactId: 1,
    name: "ACME Platform Expansion",
    stage: "Negotiation",
    amount: 74000,
    closeDate: daysFromNow(18),
    owner: "Sarah Holmes",
  },
  {
    id: "deal-1002",
    contactId: 1,
    name: "ACME Analytics Add-on",
    stage: "Proposal",
    amount: 18500,
    closeDate: daysFromNow(32),
    owner: "Daniel Kim",
  },
  {
    id: "deal-2001",
    contactId: 2,
    name: "Northwind Trial Conversion",
    stage: "Qualification",
    amount: 9000,
    closeDate: daysFromNow(12),
    owner: "Alex Romero",
  },
];

export const getMockConversationsForContact = (contactId?: number) =>
  mockContactConversations.filter((conversation) => conversation.contactId === contactId);

export const getMockActivitiesForContact = (contactId?: number) =>
  mockContactActivities
    .filter((activity) => activity.contactId === contactId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export const getMockDealsForContact = (contactId?: number) =>
  mockContactDeals.filter((deal) => deal.contactId === contactId);

export const getConversationStatusColor = (
  status: ContactConversationStatus
): ChipProps["color"] => {
  switch (status) {
    case "open":
      return "success";
    case "pending":
      return "warning";
    case "closed":
      return "default";
    default:
      return "default";
  }
};

export const getDealStageColor = (stage: ContactDealStage): ChipProps["color"] => {
  switch (stage) {
    case "Closed":
      return "success";
    case "Negotiation":
      return "warning";
    case "Proposal":
      return "info";
    case "Qualification":
      return "secondary";
    case "Prospecting":
      return "default";
    default:
      return "default";
  }
};
