import { Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Marketing / content shell: sticky navigation, routed page body and footer.
 */
export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
