import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightSidebarSwipe from "starlight-sidebar-swipe";
import starlightPluginsDocsComponents from "@trueberryless-org/starlight-plugins-docs-components";

export default defineConfig({
  integrations: [
    starlight({
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
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [{ slug: "getting-started" }],
        },
      ],
      social: {
        github: "https://github.com/trueberryless-org/starlight-sidebar-swipe",
      },
      title: "Starlight Sidebar Swipe",
      customCss: ["./src/styles/swipe.css"],
      components: {
        MobileMenuToggle: "./src/components/MobileMenuToggle.astro",
      },
    }),
  ],
});
