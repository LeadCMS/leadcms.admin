import { Github, Globe, BookOpen } from "lucide-react";

export const TeckStack = {
  site: {
    segment_i: {
      title: "Website",
      descrp: "Next.js with React 18 and Tailwind CSS",
      tags: [
        { label: "version", value: "1.2.75-pre", attr: "primary" },
        { label: "latestVersion", value: "1.2.80", attr: "secondary" },
      ],
    },
    segment_ii: {
      context: [
        { label: "framework", value: "Next.js 15.0.4" },
        { label: "lastUpdated", value: "2025-01-08" },
      ],
      children: (
        <div className="progress-bar">
          <p className="label">System Score</p>
          {/* <ProgressBar value={80} className="value" /> */}
        </div>
      ),
    },
    segment_iii: {
      context: [
        { label: "React", value: "18.3.1" },
        { label: "Tailwind CSS", value: "3.4.0" },
        { label: "shadcn/ui", value: "0.9.0" },
        { label: "Lucide Icons", value: "0.460.0" },
        { label: "TypeScript", value: "5.6.3" },
      ],
    },
  },
  admin: {
    segment_i: {
      title: "Admin Portal",
      descrp: "React admin interface with Material-UI",
      tags: [
        { label: "version", value: "1.2.75-pre", attr: "primary" },
        { label: "latestVersion", value: "1.2.80", attr: "secondary" },
      ],
    },
    segment_ii: {
      context: [
        { label: "framework", value: "React 18.3.0 + Webpack" },
        { label: "lastUpdated", value: "2025-01-08" },
      ],
    },
    segment_iii: {
      context: [
        { label: "React", value: "18.3.0" },
        { label: "Material-UI", value: "7.1.0" },
        { label: "Chakra UI", value: "3.2.0" },
        { label: "React Hook Form", value: "7.56.4" },
        { label: "Monaco Editor", value: "4.7.0" },
        { label: "TypeScript", value: "4.9.4" },
      ],
    },
  },
  backend: {
    segment_i: {
      title: "Backend",
      descrp: ".NET 8 API with Entity Framework",
      tags: [
        { label: "version", value: "1.2.75-pre", attr: "primary" },
        { label: "latestVersion", value: "1.2.80", attr: "secondary" },
      ],
    },
    segment_ii: {
      context: [
        { label: "framework", value: ".NET 8.0" },
        { label: "lastUpdated", value: "2025-01-08" },
      ],
    },
    segment_iii: {
      context: [
        { label: "ASP.NET Core", value: "8.0.11" },
        { label: "Entity Framework", value: "8.0.11" },
        { label: "Npgsql (PostgreSQL)", value: "8.0.11" },
        { label: "AutoMapper", value: "12.0.1" },
        { label: "Serilog", value: "7.0.0" },
        { label: "Swagger/OpenAPI", value: "6.5.0" },
      ],
    },
  },
};

export const Storage = {
  database: {
    type: "PostgreSQL",
    version: "15.4",
    status: "Healthy",
    connectionPool: 85,
    migrations: 24,
    lastBackup: "2025-01-08 04:00 UTC",
    description: "",
  },
  server: {
    uptime: "45 days, 12 hours",
    environment: "Production",
    deployment: "On-Premises",
    region: "us-east-1",
    lastDeployment: "2025-01-08 09:23 UTC",
    nodeCount: 3,
    description: "",
  },
};

export const LeadCMSbadges = [
  {
    variant: "outline",
    attr: "",
    label: "Stable",
  },
  {
    variant: "outline",
    attr: "",
    label: `v${TeckStack.site.segment_i.tags.find((tag) => tag.label === "version")?.value}`,
  },
  {
    variant: "outline",
    attr: "",
    label: "MIT License",
  },
  {
    variant: "outline",
    attr: "",
    label: "Self-Hosted",
  },
];

export const ExternalResources = [
  { name: "Website", url: "https://leadcms.ai", icon: <Globe className="h-5 w-5" /> },
  { name: "Documentation", url: "https://docs.leadcms.ai", icon: <BookOpen className="h-5 w-5" /> },
  {
    name: "GitHub Backend",
    url: "https://github.com/peterliapin/LeadCMS-backend",
    icon: <Github className="h-5 w-5" />,
  },
  {
    name: "GitHub Admin",
    url: "https://github.com/LeadCMS/leadcms.admin",
    icon: <Github className="h-5 w-5" />,
  },
];

export const Contributors = [
  {
    name: "Peter Liapin",
    role: "Lead Developer",
    avatar: "https://avatars.githubusercontent.com/u/3127002?v=4",
    descrp: [
      "CTO at WaveAccess SL",
      "CTO at Duklas SL",
      "Custom Software Development",
      "CTO at TagPoint.co.uk",
      "Founder of XLTools.net",
    ].join(" | "),
    url: "https://github.com/peterliapin",
  },
  {
    name: "Yuriv Baranov",
    role: "Frontend Developer",
    avatar: "https://avatars.githubusercontent.com/u/40540592?v=4",
    descrp: undefined,
    url: "https://github.com/Yuri2b",
  },
  {
    name: "Dilhan Rubera",
    role: "DevOps Engineer",
    avatar: "https://avatars.githubusercontent.com/u/125571040?v=4",
    descrp: undefined,
    url: "https://github.com/DilhanRubera",
  },
  {
    name: "M Lakshan",
    role: "UX Designer",
    avatar: "https://avatars.githubusercontent.com/u/75500772?s=64&v=4",
    descrp: undefined,
    url: "https://github.com/M-lakshan",
  },
];

export const CLI = {
  dir: ">_ Update Commands",
  cmd: ["$ docker compose pull", "$ docker compose up -d"],
};

export const SystemStatus = {
  status: {
    identifier: "System-Status",
    type: "Overview",
    healthProgress: 86,
    services: [
      {
        name: ".NET API Services",
        description: "All endpoints operational",
        icon: "Server",
        statusColor: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      },
      {
        name: "PostgreSQL Database",
        description: "Connected and healthy",
        icon: "Database",
        statusColor: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      },
      {
        name: "Site Applications",
        description: "Next.js & React admin running",
        icon: "Globe",
        statusColor: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      },
      {
        name: "Background Jobs",
        description: "Quartz scheduler running",
        icon: "Clock",
        statusColor: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      },
    ],
  },
  database: {
    identifier: "Database",
    type: Storage.database.type,
    version: Storage.database.version,
    status: Storage.database.status,
    connectionPool: Storage.database.connectionPool,
    migrations: Storage.database.migrations,
    lastBackup: Storage.database.lastBackup,
  },
  deployement: {
    identifier: "Deployement",
    environment: Storage.server.environment,
    deployment: Storage.server.deployment,
    region: Storage.server.region,
    nodeCount: Storage.server.nodeCount,
    lastDeployment: Storage.server.lastDeployment,
    uptime: Storage.server.uptime,
    showDockerHelp: Storage.server.deployment === "On-Premises",
    dockerHelp: {
      commands: [
        {
          comment: "# Pull latest Docker images",
          command: "$ docker compose pull",
        },
        {
          comment: "# Restart all services with updated images",
          command: "$ docker compose up -d",
        },
        {
          comment: "# Check service status",
          command: "$ docker compose ps",
        },
      ],
      helpText:
        "Run these commands in your LeadCMS.ai installation directory to update the " +
        ".NET backend, React admin, and Next.js site to the latest versions.",
    },
  },
};
