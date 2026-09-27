import starlight from "@astrojs/starlight";
import starlightPluginsDocsComponents from "@trueberryless-org/starlight-plugins-docs-components";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import starlightSidebarSwipe from "starlight-sidebar-swipe";

const site =
  (process.env.CONTEXT === "deploy-preview" ||
  process.env.CONTEXT === "branch-deploy"
    ? process.env.DEPLOY_PRIME_URL
    : process.env.URL) ?? "https://starlight-sidebar-swipe.netlify.app";

export default defineConfig({
  site,
  integrations: [
    starlight({
      title: "Starlight Sidebar Swipe",
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: new URL("og.png", site).href,
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:alt",
            content: "Swipeable sidebar on mobile, just like Discord.",
          },
        },
      ],
      editLink: {
        baseUrl:
          "https://github.com/trueberryless-org/starlight-sidebar-swipe/edit/main/docs/",
      },
      plugins: [
        starlightSidebarSwipe(),
        starlightPluginsDocsComponents({
          pluginName: "starlight-sidebar-swipe",
          showcaseProps: {
            entries: [],
          },
        }),
        starlightLinksValidator(),
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [{ slug: "getting-started" }],
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/trueberryless-org/starlight-sidebar-swipe",
        },
      ],
    }),
  ],
});
