import type { StarlightPlugin } from "@astrojs/starlight/types";
import { overrideStarlightComponent } from "./libs/starlight";

export default function starlightSidebarSwipe(): StarlightPlugin {
  return {
    name: "starlight-sidebar-swipe",
    hooks: {
      "config:setup"({
        addIntegration,
        updateConfig: updateStarlightConfig,
        config: starlightConfig,
        logger,
      }) {
        updateStarlightConfig({
          components: {
            ...starlightConfig.components,
            ...overrideStarlightComponent(
              starlightConfig.components,
              logger,
              "MobileMenuToggle"
            ),
          },
          customCss: ["starlight-sidebar-swipe/styles/swipe.css"],
        });
      },
    },
  };
}
