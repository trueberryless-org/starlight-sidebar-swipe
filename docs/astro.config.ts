import starlight from "@astrojs/starlight";
import starlightPluginsDocsComponents from "@trueberryless-org/starlight-plugins-docs-components";
import { defineConfig } from "astro/config";
import starlightSidebarSwipe from "starlight-sidebar-swipe";

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
    }),
  ],
});
