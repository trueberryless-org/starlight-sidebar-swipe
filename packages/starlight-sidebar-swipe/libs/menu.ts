const DESKTOP_MEDIA_QUERY = "(min-width: 50em)";
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
const SLIDE_DURATION = 300;
const SLIDE_EASING = "cubic-bezier(0.25, 1, 0.5, 1)";

export const SLIDE_EASING_INITIAL_SLOPE = 1 / 0.25;

export function getDesktopMediaQuery(): MediaQueryList {
  return matchMedia(DESKTOP_MEDIA_QUERY);
}

export function isDesktopViewport(): boolean {
  return getDesktopMediaQuery().matches;
}

export function slideMainFrame(
  element: HTMLElement,
  expanded: boolean,
  duration = SLIDE_DURATION
) {
  const slideDuration = prefersReducedMotion() ? 0 : duration;

  element.style.transition = `transform ${slideDuration}ms ${SLIDE_EASING}`;
  element.style.transform = expanded ? "translateX(100vw)" : "translateX(0)";
}

export function moveMainFrame(element: HTMLElement, translateX: number) {
  element.style.transition = "none";
  element.style.transform = `translateX(${translateX}px)`;
}

export function resetMainFrame(element: HTMLElement) {
  moveMainFrame(element, 0);
}

export function getMainFrameTranslateX(element: HTMLElement): number {
  const { transform } = getComputedStyle(element);
  if (transform === "none") return 0;

  return new DOMMatrixReadOnly(transform).m41;
}

export function updateMenuInertness(expanded: boolean) {
  const isMobileMenu = !isDesktopViewport();

  for (const element of document.querySelectorAll(
    ".main-frame, .sl-skip-link"
  )) {
    element.toggleAttribute("inert", isMobileMenu && expanded);
  }

  document
    .getElementById("starlight__sidebar")
    ?.toggleAttribute("inert", isMobileMenu && !expanded);
}

function prefersReducedMotion(): boolean {
  return matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
}
