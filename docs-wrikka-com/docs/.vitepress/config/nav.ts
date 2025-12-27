import type { DefaultTheme } from "vitepress";


export const nav: DefaultTheme.NavItem[] = [
  {
    text: "Framework",
    items: [
      { text: 'All Framework', link: '/' },
      {
        text: 'Framework',
        items: [
          { text: 'Vitext', link: '/vitext/' },
          { text: 'CLI', link: '/cli/' },
          { text: 'AI', link: '/ai/' },
          { text: 'UI', link: '/ui/' },
          { text: 'Docs', link: '/docs/' },
          { text: 'Packages', link: '/docs/' },
          { text: 'Server', link: '/server/' },
        ]
      }
    ]
  },
  {
    text: 'Resources',
    items: [
      { text: 'Blog', link: '/blog' },
      { text: 'Changelog', link: '/changelog' },
      { text: 'Feedback', link: '/feedback' },
      { text: 'Contributing', link: '/contributing' },
    ]
  },



];
