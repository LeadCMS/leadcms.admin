import { ChevronRight } from "lucide-react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { GhostLink } from "components/ghost-link";

interface Links {
  linkText: string;
  toRoute: string;
}

interface BreadCrumbProps {
  links: Links[];
  current: string;
}

export const BreadCrumbNavigation = ({ links = [], current }: BreadCrumbProps) => {
  return (
    <Breadcrumbs separator={<ChevronRight size={20} />}>
      {Array.isArray(links) &&
        links.map((link, index) => (
          <Link key={index} to={link.toRoute} component={GhostLink} underline="hover">
            {link.linkText}
          </Link>
        ))}
      <Typography variant="body1">{current}</Typography>
    </Breadcrumbs>
  );
};
