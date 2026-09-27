import {
  SLIDE_EASING_INITIAL_SLOPE,
  getMainFrameTranslateX,
  isDesktopViewport,
  moveMainFrame,
} from "./menu";

const SWIPE_DETECTION_DISTANCE = 5;
const MAX_HORIZONTAL_SWIPE_ANGLE = 30;
const VELOCITY_SAMPLE_WINDOW = 100;
const FLING_VELOCITY = 0.3;
const MIN_SETTLE_DURATION = 120;
const MAX_SETTLE_DURATION = 300;

export function initSwipeNavigation(
  element: HTMLElement,
  setExpanded: (expanded: boolean, duration: number) => void
) {
  let state: SwipeState = "idle";
  let startX = 0;
  let startY = 0;
  let startTranslateX = 0;
  let translateX = 0;
  let samples: SwipeSample[] = [];
  let touchTarget: EventTarget | null = null;
  let animationFrame: number | undefined;

  const renderSwipe = () => {
    animationFrame = undefined;
    moveMainFrame(element, translateX);
  };

  document.addEventListener(
    "touchstart",
    (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!isSwipeEnabled() || !touch) return;

      state = "measuring";
      startX = touch.clientX;
      startY = touch.clientY;
      startTranslateX = getMainFrameTranslateX(element);
      translateX = startTranslateX;
      samples = [{ time: event.timeStamp, x: touch.clientX }];
      touchTarget = event.target;
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

      samples = addSwipeSample(samples, {
        time: event.timeStamp,
        x: touch.clientX,
      });
      translateX = clampTranslateX(startTranslateX + dx, getSidebarWidth());
      animationFrame ??= requestAnimationFrame(renderSwipe);
    },
    { passive: false }
  );

  const endSwipe = (event: TouchEvent) => {
    if (state === "swiping") {
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      renderSwipe();

      const sidebarWidth = getSidebarWidth();
      const velocity = getSwipeVelocity(samples, event.timeStamp);
      const expanded = isSwipeExpanding(translateX, sidebarWidth, velocity);
      const distance = Math.abs((expanded ? sidebarWidth : 0) - translateX);

      setExpanded(
        expanded,
        getSettleDuration(distance, sidebarWidth, velocity)
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

function addSwipeSample(
  samples: SwipeSample[],
  sample: SwipeSample
): SwipeSample[] {
  return [
    ...samples.filter(
      ({ time }) => sample.time - time <= VELOCITY_SAMPLE_WINDOW
    ),
    sample,
  ];
}

function clampTranslateX(translateX: number, sidebarWidth: number): number {
  return Math.max(0, Math.min(translateX, sidebarWidth));
}

function getSwipeVelocity(samples: SwipeSample[], now: number): number {
  const recentSamples = samples.filter(
    ({ time }) => now - time <= VELOCITY_SAMPLE_WINDOW
  );
  const first = recentSamples[0];
  const last = recentSamples.at(-1);
  if (!first || !last || last.time === first.time) return 0;

  return (last.x - first.x) / (last.time - first.time);
}

function isSwipeExpanding(
  translateX: number,
  sidebarWidth: number,
  velocity: number
): boolean {
  if (Math.abs(velocity) >= FLING_VELOCITY) return velocity > 0;

  return translateX > sidebarWidth / 2;
}

function getSettleDuration(
  distance: number,
  sidebarWidth: number,
  velocity: number
): number {
  const duration =
    Math.abs(velocity) >= FLING_VELOCITY
      ? (SLIDE_EASING_INITIAL_SLOPE * distance) / Math.abs(velocity)
      : (MAX_SETTLE_DURATION * distance) / sidebarWidth;

  return Math.max(MIN_SETTLE_DURATION, Math.min(duration, MAX_SETTLE_DURATION));
}

interface SwipeSample {
  time: number;
  x: number;
}

type SwipeState = "idle" | "ignored" | "measuring" | "swiping";
