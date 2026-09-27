const desktopMinWidth = 800;
const swipeDetectionDistance = 5;
const maxHorizontalSwipeAngle = 30;
const swipeIdleThreshold = 50;
const swipeMinMovement = 2;

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
      element.style.transition = "none";
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (event: TouchEvent) => {
      if (state === "idle" || state === "vertical" || isDesktopViewport())
        return;

      const touch = event.touches[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (state === "measuring") state = getSwipeState(dx, dy);
      if (state !== "horizontal") return;

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
    if (state === "horizontal") {
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

export function slideMainFrame(element: HTMLElement, expanded: boolean) {
  element.style.transition = "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
  element.style.transform = expanded ? "translateX(100vw)" : "translateX(0)";
}

export function resetMainFrame(element: HTMLElement) {
  element.style.transition = "none";
  element.style.transform = "translateX(0)";
}

export function isDesktopViewport(): boolean {
  return window.innerWidth >= desktopMinWidth;
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
  const match = element.style.transform.match(/translateX\(([-.0-9]+)/);

  return Number.parseFloat(match?.[1] ?? "0");
}

function getSwipeState(dx: number, dy: number): SwipeState {
  if (Math.hypot(dx, dy) < swipeDetectionDistance) return "measuring";

  const angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI);

  return angle > maxHorizontalSwipeAngle ? "vertical" : "horizontal";
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
    idleTime > swipeIdleThreshold || Math.abs(movement) < swipeMinMovement;

  return isStandingStill ? translateX > sidebarWidth / 2 : movement > 0;
}

type SwipeState = "idle" | "measuring" | "horizontal" | "vertical";
