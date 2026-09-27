import type { StarlightPlugin } from "@astrojs/starlight/types";

import { getComponentOverrides } from "./libs/starlight";

export default function starlightSidebarSwipe(): StarlightPlugin {
  return {
    name: "starlight-sidebar-swipe",
    hooks: {
      "config:setup"({
        config: starlightConfig,
        logger,
        updateConfig: updateStarlightConfig,
      }) {
        updateStarlightConfig({
          components: getComponentOverrides(
            starlightConfig.components,
            logger,
            ["MobileMenuToggle"]
          ),
        });
      },
    },
  };
}
