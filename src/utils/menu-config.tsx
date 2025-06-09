import { CoreModule, getCoreModuleRoute } from "../lib/router";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  MessageSquare,
  Image,
  Link,
  Boxes,
  ShoppingCart,
  DollarSign,
  Users,
  Building2,
  Mail,
  BellOff,
  Globe,
  User,
  BookOpen,
  HelpCircle
} from "lucide-react";

export const MENU_CONFIG = [
  {
    header: "MAIN",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard />,
        entity: null,
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
        icon: <FileText />,
        entity: "content",
        route: getCoreModuleRoute(CoreModule.content)
      },
      {
        id: "comments",
        label: "Comments",
        icon: <MessageSquare />,
        entity: "comment",
        route: getCoreModuleRoute(CoreModule.comments)
      },
      {
        id: "media",
        label: "Media",
        icon: <Image />,
        entity: "media",
        route: getCoreModuleRoute(CoreModule.media)
      },
      {
        id: "links",
        label: "Links",
        icon: <Link />,
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
        icon: <ShoppingCart />,
        entity: "order",
        route: getCoreModuleRoute(CoreModule.orders)
      },
      {
        id: "deals",
        label: "Deals",
        icon: <DollarSign />,
        entity: "deal",
        route: getCoreModuleRoute(CoreModule.deals)
      },
      {
        id: "contacts",
        label: "Contacts",
        icon: <Users />,
        entity: "contact",
        route: getCoreModuleRoute(CoreModule.contacts)
      },
      {
        id: "accounts",
        label: "Accounts",
        icon: <Building2 />,
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
        icon: <Mail />,
        entity: "emailtemplate",
        route: getCoreModuleRoute(CoreModule.emailTemplates)
      },
      {
        id: "unsubscribes",
        label: "Unsubscribes",
        icon: <BellOff />,
        entity: "unsubscribe",
        route: getCoreModuleRoute(CoreModule.unsubscribes)
      },
      {
        id: "domains",
        label: "Domains",
        icon: <Globe />,
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
        icon: <User />,
        entity: "user",
        route: getCoreModuleRoute(CoreModule.users)
      },
      {
        id: "activityLogs",
        label: "Activity logs",
        icon: <BookOpen />,
        entity: "activity-log",
        route: getCoreModuleRoute(CoreModule.activityLogs)
      },
      {
        id: "about",
        label: "About",
        icon: <HelpCircle />,
        entity: null,
        route: getCoreModuleRoute(CoreModule.about)
      }
    ]
  }
];