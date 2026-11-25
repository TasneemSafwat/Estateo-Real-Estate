import { useEffect, useState } from 'react';

/**
 * Returns a debounced mirror of `value`, useful for search inputs so that
 * filtering/requests only run once the user pauses typing.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
