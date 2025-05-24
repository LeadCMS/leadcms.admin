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
        entity: "contentdetailsdto",
        route: getCoreModuleRoute(CoreModule.content)
      },
      {
        id: "comments",
        label: "Comments",
        icon: <Comment />, 
        entity: "commentdetailsdto",
        route: getCoreModuleRoute(CoreModule.comments)
      },
      {
        id: "media",
        label: "Media",
        icon: <ImageIcon />, 
        entity: "mediadetailsdto",
        route: getCoreModuleRoute(CoreModule.media)
      },
      {
        id: "links",
        label: "Links",
        icon: <LinkIcon />, 
        entity: "linkdetailsdto",
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
        entity: "orderdetailsdto",
        route: getCoreModuleRoute(CoreModule.orders)
      },
      {
        id: "deals",
        label: "Deals",
        icon: <MonetizationOn />, 
        entity: "dealdetailsdto",
        route: getCoreModuleRoute(CoreModule.deals)
      },
      {
        id: "contacts",
        label: "Contacts",
        icon: <People />, 
        entity: "contactdetailsdto",
        route: getCoreModuleRoute(CoreModule.contacts)
      },
      {
        id: "accounts",
        label: "Accounts",
        icon: <Business />, 
        entity: "accountdetailsdto",
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
        entity: "emailtemplatedetailsdto",
        route: getCoreModuleRoute(CoreModule.emailTemplates)
      },
      {
        id: "unsubscribes",
        label: "Unsubscribes",
        icon: <Unsubscribe />, 
        entity: "unsubscribedetailsdto",
        route: getCoreModuleRoute(CoreModule.unsubscribes)
      },
      {
        id: "domains",
        label: "Domains",
        icon: <Web />, 
        entity: "domaindetailsdto",
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
        entity: "userdetailsdto",
        route: getCoreModuleRoute(CoreModule.users)
      },
      {
        id: "activityLogs",
        label: "Activity logs",
        icon: <Book />, 
        entity: "activitylogdetailsdto",
        route: getCoreModuleRoute(CoreModule.activityLogs)
      },
      {
        id: "about",
        label: "About",
        icon: <Info />, 
        entity: null, // Always show
        route: getCoreModuleRoute(CoreModule.about)
      }
    ]
  }
];
