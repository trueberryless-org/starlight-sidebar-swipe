---
"starlight-sidebar-swipe": patch
---

Fixes the sidebar opening instead of scrolling when swiping horizontally inside scrollable elements, e.g. overflowing tabs or code blocks. The sidebar swipe gesture is now only used when the swiped element cannot scroll further in the swipe direction.
