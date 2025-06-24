import { User, HelpCircle, MessageCircle, Info, Code2 } from "lucide-react";

export const iconKeywordMap = [
  {
    keywords: ["author details", "author", "user", "creator", "writer"],
    icon: User,
  },
  {
    keywords: ["comment body", "comment", "body", "text", "message"],
    icon: MessageCircle,
  },
  {
    keywords: ["context", "background", "about", "reference"],
    icon: Info,
  },
  {
    keywords: ["meta", "metadata", "details", "info"],
    icon: Code2,
  },
];
export const defaultIcon = HelpCircle;
