import { CoreModule, getCoreModuleRoute } from "../lib/router";
import {
  Dashboard,
  Newspaper,
  Comment,
  Image as ImageIcon,
  Link as LinkIcon,
  Inventory,
  MonetizationOn,
  People,
  Business,
  Email,
  Unsubscribe,
  Web,
  Person,
  Book,
  Info
} from "@mui/icons-material";

export const MENU_CONFIG = [
  {
    header: "MAIN",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Dashboard />, 
        entity: null, // Always show
        route: getCoreModuleRoute(CoreModule.dashboard)
      }
    ]
  },
  {
    header: "CMS",
    items: [
      {
        id: "content",
        label: "Content",
        icon: <Newspaper />, 
        entity: "content",
        route: getCoreModuleRoute(CoreModule.content)
      },
      {
        id: "comments",
        label: "Comments",
        icon: <Comment />, 
        entity: "comment",
        route: getCoreModuleRoute(CoreModule.comments)
      },
      {
        id: "media",
        label: "Media",
        icon: <ImageIcon />, 
        entity: "media",
        route: getCoreModuleRoute(CoreModule.media)
      },
      {
        id: "links",
        label: "Links",
        icon: <LinkIcon />, 
        entity: "link",
        route: getCoreModuleRoute(CoreModule.links)
      }
    ]
  },
  {
    header: "CRM",
    items: [
      {
        id: "orders",
        label: "Orders",
        icon: <Inventory />, 
        entity: "order",
        route: getCoreModuleRoute(CoreModule.orders)
      },
      {
        id: "deals",
        label: "Deals",
        icon: <MonetizationOn />, 
        entity: "deal",
        route: getCoreModuleRoute(CoreModule.deals)
      },
      {
        id: "contacts",
        label: "Contacts",
        icon: <People />, 
        entity: "contact",
        route: getCoreModuleRoute(CoreModule.contacts)
      },
      {
        id: "accounts",
        label: "Accounts",
        icon: <Business />, 
        entity: "account",
        route: getCoreModuleRoute(CoreModule.accounts)
      }
    ]
  },
  {
    header: "MARKETING",
    items: [
      {
        id: "emailTemplates",
        label: "Email templates",
        icon: <Email />, 
        entity: "emailtemplate",
        route: getCoreModuleRoute(CoreModule.emailTemplates)
      },
      {
        id: "unsubscribes",
        label: "Unsubscribes",
        icon: <Unsubscribe />, 
        entity: "unsubscribe",
        route: getCoreModuleRoute(CoreModule.unsubscribes)
      },
      {
        id: "domains",
        label: "Domains",
        icon: <Web />, 
        entity: "domain",
        route: getCoreModuleRoute(CoreModule.domains)
      }
    ]
  },
  {
    header: "GENERAL",
    items: [
      {
        id: "users",
        label: "Users",
        icon: <Person />, 
        entity: "user",
        route: getCoreModuleRoute(CoreModule.users)
      },
      {
        id: "activityLogs",
        label: "Activity logs",
        icon: <Book />, 
        entity: "activity-log",
        route: getCoreModuleRoute(CoreModule.activityLogs)
      },
      {
        id: "about",
        label: "About",
        icon: <Info />, 
        entity: null,
        route: getCoreModuleRoute(CoreModule.about)
      }
    ]
  }
];
