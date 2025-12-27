import type { DefaultTheme } from "vitepress";

export default function sidebarServer(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Getting Started",
      collapsed: false,
      base: "/server/get-started",
      items: [
        { text: "Introduction", link: "/introduction" },
        { text: "Installation", link: "/installation" },
        { text: "Configuration", link: "/configuration" },
      ],
    },
    {
      text: "Core Concepts",
      collapsed: false,
      base: "/server/core-concepts",
      items: [
        { text: "Routing", link: "/routing" },
        { text: "Middleware", link: "/middleware" },
        { text: "Handlers", link: "/handlers" },
        { text: "Dependencies", link: "/dependencies" },
        { text: "Plugins", link: "/plugins" },
      ],
    },
    {
      text: "Data & Caching",
      collapsed: false,
      base: "/server/data-caching",
      items: [
        { text: "KV Storage", link: "/kv-storage" },
        { text: "SQL Database", link: "/sql-database" },
        { text: "Cache API", link: "/cache-api" },
      ],
    },
    {
      text: "Security",
      collapsed: false,
      base: "/server/security",
      items: [
        { text: "Authentication", link: "/authentication" },
        { text: "Authorization", link: "/authorization" },
        { text: "CORS", link: "/cors" },
        { text: "Secrets Management", link: "/secrets-management" },
      ],
    },
    {
      text: "Monitoring & Debugging",
      collapsed: false,
      base: "/server/monitoring-debugging",
      items: [
        { text: "Logging", link: "/logging" },
        { text: "Health Checks", link: "/health-checks" },
        { text: "Debugging", link: "/debugging" },
      ],
    },
    {
      text: "Deployment",
      collapsed: false,
      base: "/server/deployment",
      items: [
        { text: "Overview", link: "/overview" },
        { text: "Docker", link: "/docker" },
        { text: "CI/CD", link: "/ci-cd" },
      ],
    },
    {
      text: "Advanced Guides",
      collapsed: false,
      base: "/server/advanced-guides",
      items: [
        { text: "File Uploads", link: "/file-uploads" },
        { text: "WebSockets", link: "/websockets" },
        { text: "GraphQL", link: "/graphql" },
      ],
    },
  ];
}
