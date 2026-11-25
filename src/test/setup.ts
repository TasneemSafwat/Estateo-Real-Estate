import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * Global test environment shims.
 *
 * jsdom implements neither `matchMedia` nor the observer APIs that the UI
 * relies on for responsiveness and lazy reveal animations, so we install
 * lightweight no-op stand-ins. Everything is reset between tests to keep the
 * suite deterministic and independent.
 */

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

class MockObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

vi.stubGlobal('IntersectionObserver', MockObserver);
vi.stubGlobal('ResizeObserver', MockObserver);

/** jsdom does not implement scrollTo — used by ScrollToTop. */
window.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
