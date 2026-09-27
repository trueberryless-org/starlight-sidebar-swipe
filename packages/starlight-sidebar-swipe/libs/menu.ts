const DESKTOP_MEDIA_QUERY = "(min-width: 50em)";

export function getDesktopMediaQuery(): MediaQueryList {
  return matchMedia(DESKTOP_MEDIA_QUERY);
}

export function isDesktopViewport(): boolean {
  return getDesktopMediaQuery().matches;
}

export function slideMainFrame(element: HTMLElement, expanded: boolean) {
  element.style.transition = "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
  element.style.transform = expanded ? "translateX(100vw)" : "translateX(0)";
}

export function resetMainFrame(element: HTMLElement) {
  element.style.transition = "none";
  element.style.transform = "translateX(0)";
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
