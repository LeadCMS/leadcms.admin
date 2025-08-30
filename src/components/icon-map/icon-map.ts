import { User, HelpCircle, MessageCircle, Info, Code2, School } from "lucide-react";

export const iconKeywordMap = [
  {
    keywords: ["author details", "author", "user", "creator", "writer"],
    icon: User,
    key: "user",
  },
  {
    keywords: ["comment body", "comment", "body", "text", "message"],
    icon: MessageCircle,
    key: "message",
  },
  {
    keywords: ["context", "background", "about", "reference"],
    icon: Info,
    key: "info",
  },
  {
    keywords: ["meta", "metadata", "details", "info"],
    icon: Code2,
    key: "code2",
  },
  {
    keywords: ["student", "school"],
    icon: School,
    key: "student",
  },
];
export const defaultIcon = HelpCircle;

export const defaultIconKey = "help";
