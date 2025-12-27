import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { externalLinksPlugin } from "./plugins/markdown/external-links";
import { kbdPlugin } from "./plugins/markdown/markdown-kbd";
import { replPlugin } from "./plugins/markdown/repl";
import { nav } from "./config/nav";
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import { Sidebar } from "./config/sidebar";
import container from 'markdown-it-container';
import { renderSandbox } from 'vitepress-plugin-sandpack';



export default withMermaid(
    defineConfig({
        vite: {
            configFile: "vite.config.ts"
        },
        sitemap: {
            hostname: "https://learn.wrikka.com",
        },
        appearance: "force-dark",
        title: "Wrikka Learn",
        titleTemplate: "Wrikka Learn",
        description: "Wrikka Learn",
        head: [
            ["link", { rel: "icon", href: "/favicon.webp", type: "image/webp+xml" }],
            ["meta", { name: "author", content: "wrikka" }],
            ["meta", { property: "og:type", content: "/og.webp" }],
            ["meta", { name: "og:title", content: "learn.wrikka.com" }],
            [
                "meta",
                { name: "og:description", content: "คอร์สเรียนทั้งหมด: แชร์สิ่งที่รียนรู้ในทุกๆวัน" },
            ],
            /*
            [
                "script",
                {
                    src: "//code.tidio.co/f4xtk1yekdnq5ynr6c51geiws1cmrhod.js",
                },
            ],*/
        ],
        lang: "th-TH",
        base: "/",
        cleanUrls: true,
        srcDir: ".",
        srcExclude: ["**/README.md", "**/TODO.md"],
        ignoreDeadLinks: false,
        lastUpdated: true,
        themeConfig: {
            darkModeSwitchTitle: "Dark mode",
            docFooter: {
                next: "Next",
                prev: "Previous",
            },
            darkModeSwitchLabel: "Dark mode",
            outline: {
                level: [2, 4],
                label: "On this page",
            },
            logo: "/favicon.ico",
            /*
            algolia: {
                appId: 'import.meta.env.VITE_ALGOLIA_APP_ID',
                apiKey: 'import.meta.env.VITE_ALGOLIA_API_KEY',
                indexName: 'vitepress',
                placeholder: 'Search',
                searchParameters: {
                    hitsPerPage: 10,
                    attributesToRetrieve: ['hierarchy', 'content', 'anchor', 'url'],
                    attributesToSnippet: ['content:10']
                },
                locales: {
                    root: {
                        placeholder: 'Search',
                        translations: {
                            button: {
                                buttonText: 'Search'
                            }
                        }
                    }
                }
            },*/
            socialLinks: [

                {
                    icon: 'facebook',
                    link: 'https://www.facebook.com/webdev.sharex',
                },
                {
                    icon: 'x',
                    link: 'https://x.com/newkrubx',
                },
                { icon: "github", link: "https://github.com/wrikka" },
                {
                    icon: {
                        svg: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
                    },
                    link: "https://wrikka.com",
                },
            ],
            nav: nav,
            sidebar: Sidebar,
        },
        markdown: {
            math: true,
            image: {
                lazyLoading: true,
            },
            config(md) {
                md.use(groupIconMdPlugin);
                md.use(replPlugin);
                md.use(externalLinksPlugin);
                md.use(kbdPlugin);
                md.use(container, 'sandbox', {
                    render(tokens, idx) {
                        return renderSandbox(tokens, idx, 'sandbox');
                    },
                });
            },
        },
    }),
);