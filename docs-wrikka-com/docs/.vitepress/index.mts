import type { Theme } from 'vitepress'
import { clerkPlugin } from "@clerk/vue";
import DefaultTheme from "vitepress/theme";
import { Sandbox } from "vitepress-plugin-sandpack";
import "vitepress-plugin-sandpack/dist/style.css";
import { createMediumZoomProvider } from "./composables/useMediumZoom";
import CustomLayout from "./layouts/custom-layout.vue";
import "./styles/index.css";
import "./styles/nav-badge.css";
import "uno.css";
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import "virtual:group-icons.css";
import 'vitepress-plugin-codeblocks-fold/style/index.css';


export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component("Sandbox", Sandbox);
    ctx.app.use(TwoslashFloatingVue);
    ctx.app.use(clerkPlugin, {
        publishableKey: import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY || (() => {
            throw new Error("Missing Clerk Publishable Key");
        })()
    });
    createMediumZoomProvider(ctx.app, ctx.router);

  },
} satisfies Theme
