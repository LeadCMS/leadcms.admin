import PersonIcon from "@mui/icons-material/Person";
import CommentIcon from "@mui/icons-material/Comment";
import InfoIcon from "@mui/icons-material/Info";
import DataObjectIcon from "@mui/icons-material/DataObject";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export const iconKeywordMap = [
  {
    keywords: ["author details", "author", "user", "creator", "writer"],
    icon: PersonIcon,
  },
  {
    keywords: ["comment body", "comment", "body", "text", "message"],
    icon: CommentIcon,
  },
  {
    keywords: ["context", "background", "about", "reference"],
    icon: InfoIcon,
  },
  {
    keywords: ["meta", "metadata", "details", "info"],
    icon: DataObjectIcon,
  },
];
export const defaultIcon = HelpOutlineIcon;