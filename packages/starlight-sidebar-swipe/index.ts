import type { StarlightPlugin } from "@astrojs/starlight/types";

export default function starlightSidebarSwipe(): StarlightPlugin {
  return {
    name: "starlight-sidebar-swipe",
    hooks: {
      setup({ logger }) {},
    },
  };
}
