---
"starlight-sidebar-swipe": patch
---

Improves accessibility of the mobile menu:

- The collapsed sidebar is no longer reachable with the keyboard or exposed to assistive technologies while it is hidden behind the page content.
- The page content is no longer reachable with the keyboard while the mobile menu is expanded.
- The mobile menu toggle button now exposes its expanded state with the `aria-expanded` attribute.
