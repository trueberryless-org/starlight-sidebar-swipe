import { isDesktopViewport } from "./menu";

const SWIPE_DETECTION_DISTANCE = 5;
const MAX_HORIZONTAL_SWIPE_ANGLE = 30;
const SWIPE_IDLE_THRESHOLD = 50;
const SWIPE_MIN_MOVEMENT = 2;
const TRANSLATE_X_RE = /translateX\(([-.0-9]+)/;

export function initSwipeNavigation(
  element: HTMLElement,
  setExpanded: (expanded: boolean) => void,
  getExpanded: () => boolean
) {
  let state: SwipeState = "idle";
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastTime = 0;
  let movement = 0;
  let isOpenAtStart = false;
  let touchTarget: EventTarget | null = null;

  document.addEventListener(
    "touchstart",
    (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!isSwipeEnabled() || !touch) return;

      state = "measuring";
      startX = touch.clientX;
      startY = touch.clientY;
      lastX = startX;
      lastTime = Date.now();
      isOpenAtStart = getExpanded();
      movement = 0;
      touchTarget = event.target;
      element.style.transition = "none";
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (event: TouchEvent) => {
      if (state === "idle" || state === "ignored" || isDesktopViewport())
        return;

      const touch = event.touches[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (state === "measuring") state = getSwipeState(dx, dy, touchTarget);
      if (state !== "swiping") return;

      if (event.cancelable) event.preventDefault();

      const now = Date.now();
      if (now > lastTime) {
        movement = touch.clientX - lastX;
        lastX = touch.clientX;
        lastTime = now;
      }

      const translateX = getSwipeTranslateX(
        isOpenAtStart,
        dx,
        getSidebarWidth()
      );

      element.style.transition = "transform 0.03s ease-out";
      element.style.transform = `translateX(${translateX}px)`;
    },
    { passive: false }
  );

  const endSwipe = () => {
    if (state === "swiping") {
      setExpanded(
        isSwipeExpanding(
          getTranslateX(element),
          getSidebarWidth(),
          Date.now() - lastTime,
          movement
        )
      );
    }

    state = "idle";
  };

  document.addEventListener("touchend", endSwipe);
  document.addEventListener("touchcancel", endSwipe);
}

function isSwipeEnabled(): boolean {
  return (
    document.documentElement.hasAttribute("data-has-sidebar") &&
    !isDesktopViewport()
  );
}

function getSidebarWidth(): number {
  return window.innerWidth;
}

function getTranslateX(element: HTMLElement): number {
  const match = element.style.transform.match(TRANSLATE_X_RE);

  return Number.parseFloat(match?.[1] ?? "0");
}

function getSwipeState(
  dx: number,
  dy: number,
  target: EventTarget | null
): SwipeState {
  if (Math.hypot(dx, dy) < SWIPE_DETECTION_DISTANCE) return "measuring";

  const angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI);

  if (angle > MAX_HORIZONTAL_SWIPE_ANGLE) return "ignored";

  return isInsideHorizontalScrollContainer(target, dx) ? "ignored" : "swiping";
}

function isInsideHorizontalScrollContainer(
  target: EventTarget | null,
  dx: number
): boolean {
  let element = target instanceof Element ? target : null;

  while (element && element !== document.documentElement) {
    if (isHorizontalScrollContainer(element, dx)) return true;
    element = element.parentElement;
  }

  return false;
}

function isHorizontalScrollContainer(element: Element, dx: number): boolean {
  const { direction, overflowX } = getComputedStyle(element);
  if (overflowX !== "auto" && overflowX !== "scroll") return false;

  return canScrollHorizontally(
    Math.abs(element.scrollLeft),
    element.scrollWidth - element.clientWidth,
    direction === "rtl" ? dx < 0 : dx > 0
  );
}

function canScrollHorizontally(
  scrollPosition: number,
  maxScrollPosition: number,
  isScrollingTowardStart: boolean
): boolean {
  if (maxScrollPosition <= 0) return false;

  return isScrollingTowardStart
    ? scrollPosition > 0
    : scrollPosition < maxScrollPosition - 1;
}

function getSwipeTranslateX(
  isOpenAtStart: boolean,
  dx: number,
  sidebarWidth: number
): number {
  const base = isOpenAtStart ? sidebarWidth : 0;

  return Math.max(0, Math.min(base + dx, sidebarWidth));
}

function isSwipeExpanding(
  translateX: number,
  sidebarWidth: number,
  idleTime: number,
  movement: number
): boolean {
  const isStandingStill =
    idleTime > SWIPE_IDLE_THRESHOLD || Math.abs(movement) < SWIPE_MIN_MOVEMENT;

  return isStandingStill ? translateX > sidebarWidth / 2 : movement > 0;
}

type SwipeState = "idle" | "ignored" | "measuring" | "swiping";
