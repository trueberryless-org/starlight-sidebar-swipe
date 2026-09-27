---
"starlight-sidebar-swipe": minor
---

Improves the swipe gesture to feel more natural, similar to the Discord mobile app:

- The page content now follows the finger 1:1 without any delay while swiping.
- Fast flicks open or close the sidebar based on the swipe velocity, while slow swipes open or close it based on how far the page content was dragged.
- The page content settles with a speed matching the swipe velocity instead of a fixed duration.
- Swiping during an ongoing open or close animation now continues from the current position instead of jumping.
- Users who prefer reduced motion no longer see the settle animation.
