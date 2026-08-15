export function initSwipeNavigation(
    element: HTMLElement,
    setExpanded: (expanded: boolean) => void,
    getExpanded: () => boolean
) {
    let state: 'idle' | 'measuring' | 'horizontal' | 'vertical' = 'idle';
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastTime = 0;
    let movementDirection = 0;
    let isOpenAtStart = false;

    const getSidebarWidthPx = () => window.innerWidth;

    document.addEventListener('touchstart', (e: TouchEvent) => {
        if (!document.documentElement.hasAttribute('data-has-sidebar')) return;

        const touch = e.touches[0];
        if (!touch || window.innerWidth >= 800) return;

        state = 'measuring';
        startX = touch.clientX;
        startY = touch.clientY;
        lastX = startX;
        lastTime = Date.now();
        isOpenAtStart = getExpanded();
        movementDirection = 0;
        element.style.transition = 'none';
    }, { passive: true });

    document.addEventListener('touchmove', (e: TouchEvent) => {
        if (state === 'idle' || state === 'vertical' || window.innerWidth >= 800) return;

        const touch = e.touches[0];
        if (!touch) return;

        const x = touch.clientX;
        const y = touch.clientY;
        const dx = x - startX;
        const dy = y - startY;

        if (state === 'measuring') {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance >= 5) {
                const angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI);
                if (angle > 30) {
                    state = 'vertical';
                } else {
                    state = 'horizontal';
                }
            }
        }

        if (state === 'horizontal') {
            if (e.cancelable) e.preventDefault();

            const now = Date.now();
            const dt = now - lastTime;
            if (dt > 0) {
                movementDirection = x - lastX;
                lastX = x;
                lastTime = now;
            }

            const base = isOpenAtStart ? getSidebarWidthPx() : 0;
            let targetX = base + dx;
            targetX = Math.max(0, Math.min(targetX, getSidebarWidthPx()));

            element.style.transition = 'transform 0.03s ease-out';
            element.style.transform = `translateX(${targetX}px)`;
        }
    }, { passive: false });

    const endSwipe = () => {
        if (state === 'horizontal') {
            const currentTransformMatch = element.style.transform.match(/translateX\(([-.0-9]+)/);
            const currentX = currentTransformMatch ? parseFloat(currentTransformMatch[1] || '0') : 0;

            const sidebarWidthPx = getSidebarWidthPx();
            const isStandingStill = (Date.now() - lastTime > 50) || Math.abs(movementDirection) < 2;

            if (isStandingStill) {
                setExpanded(currentX > sidebarWidthPx / 2);
            } else {
                setExpanded(movementDirection > 0);
            }
        }
        state = 'idle';
    };

    document.addEventListener('touchend', endSwipe);
    document.addEventListener('touchcancel', endSwipe);
}
