import { List, ListItem } from "@mui/material";
import {
  People,
  Business,
  Inventory,
  Web,
  Link,
  Comment,
  Unsubscribe,
  Person,
  Info,
  Email,
  Book,
} from "@mui/icons-material";
import { CoreModule, coreModuleRoute, getCoreModuleRoute } from "lib/router";
import { SidebarLinkButton } from "./sidebar-link-button";
import { ListSubheaderStyled, SidebarStyled } from "./index.styled";
import { useRouteParams } from "typesafe-routes";
import { Newspaper } from "@mui/icons-material";

export const Sidebar = () => {
  const { moduleName } = useRouteParams(coreModuleRoute);

  return (
    <SidebarStyled>
      <List component="nav" subheader={<ListSubheaderStyled>CMS</ListSubheaderStyled>}>
        <ListItem>
          <SidebarLinkButton
            title="Content"
            to={getCoreModuleRoute(CoreModule.blog)}
            Icon={Newspaper}
            selected={moduleName === CoreModule.blog}
          />
        </ListItem>
        <ListItem>
          <SidebarLinkButton
            title="Comments"
            to={getCoreModuleRoute(CoreModule.comments)}
            Icon={Comment}
            selected={moduleName === CoreModule.comments}
          />
        </ListItem>
        <ListItem>
          <SidebarLinkButton
            title="Links"
            to={getCoreModuleRoute(CoreModule.links)}
            Icon={Link}
            selected={moduleName === CoreModule.links}
          />
        </ListItem>
      </List>
      <List component="nav" subheader={<ListSubheaderStyled>CRM</ListSubheaderStyled>}>
        <ListItem>
          <SidebarLinkButton
            title="Contacts"
            to={getCoreModuleRoute(CoreModule.contacts)}
            Icon={People}
            selected={moduleName === CoreModule.contacts}
          />
        </ListItem>
        <ListItem>
          <SidebarLinkButton
            title="Accounts"
            to={getCoreModuleRoute(CoreModule.accounts)}
            Icon={Business}
            selected={moduleName === CoreModule.accounts}
          />
        </ListItem>
        <ListItem>
          <SidebarLinkButton
            title="Orders"
            to={getCoreModuleRoute(CoreModule.orders)}
            Icon={Inventory}
            selected={moduleName === CoreModule.orders}
          />
        </ListItem>
        <ListItem>
          <SidebarLinkButton
            title="Domains"
            to={getCoreModuleRoute(CoreModule.domains)}
            Icon={Web}
            selected={moduleName === CoreModule.domains}
          />
        </ListItem>
        <ListItem>
          <SidebarLinkButton
            title="Activity logs"
            to={getCoreModuleRoute(CoreModule.activityLogs)}
            Icon={Book}
            selected={moduleName === CoreModule.activityLogs}
          />
        </ListItem>
      </List>
      <List component="nav" subheader={<ListSubheaderStyled>MARKETING</ListSubheaderStyled>}>
        <ListItem>
          <SidebarLinkButton
            title="Email templates"
            to={getCoreModuleRoute(CoreModule.emailTemplates)}
            Icon={Email}
            selected={moduleName === CoreModule.emailTemplates}
          />
        </ListItem>
        <ListItem>
          <SidebarLinkButton
            title="Unsubscribes"
            to={getCoreModuleRoute(CoreModule.unsubscribes)}
            Icon={Unsubscribe}
            selected={moduleName === CoreModule.unsubscribes}
          />
        </ListItem>
      </List>
      <List component="nav" subheader={<ListSubheaderStyled>General</ListSubheaderStyled>}>
        <ListItem>
          <SidebarLinkButton
            title="Users"
            to={getCoreModuleRoute(CoreModule.users)}
            Icon={Person}
            selected={moduleName === CoreModule.users}
          />
        </ListItem>
        <ListItem>
          <SidebarLinkButton
            title="About"
            to={getCoreModuleRoute(CoreModule.about)}
            Icon={Info}
            selected={moduleName === CoreModule.about}
          />
        </ListItem>
      </List>
    </SidebarStyled>
  );
};
