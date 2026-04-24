import { ChevronRight } from "lucide-react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
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
    <Breadcrumbs separator={<ChevronRight size={16} />}>
      {Array.isArray(links) &&
        links.map((link, index) => (
          <Link
            key={index}
            to={link.toRoute}
            component={GhostLink}
            underline="none"
            sx={{
              fontSize: "14px",
              fontWeight: (theme) => theme.typography.subtitle1.fontWeight,
              color: (theme) => theme.typography.subtitle2.color,
              lineHeight: "24px",
            }}
          >
            {link.linkText}
          </Link>
        ))}
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: (theme) => theme.typography.subtitle1.fontWeight,
          color: (theme) => theme.palette.text.primary,
          lineHeight: (theme) => theme.typography.subtitle1.lineHeight,
        }}
      >
        {current}
      </Typography>
    </Breadcrumbs>
  );
};
