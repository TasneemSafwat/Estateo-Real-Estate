import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/app/AppProviders';
import { AppRoutes } from '@/routes';

/**
 * Application root: global providers wrap the router, which renders the
 * lazily-loaded route tree.
 */
export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
