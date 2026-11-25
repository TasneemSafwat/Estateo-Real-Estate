import { useEffect, useState } from 'react';

/**
 * Tracks vertical scroll position with rAF throttling — used by the sticky
 * navigation bar to switch between transparent and solid states.
 */
export function useScrollPosition(threshold = 12) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frame = 0;

    const handler = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrollY(window.scrollY));
    };

    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handler);
    };
  }, []);

  return { scrollY, isScrolled: scrollY > threshold };
}
