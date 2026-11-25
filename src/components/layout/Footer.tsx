import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import { Container } from '@/components/common/Section';
import { APP, ROUTES } from '@/utils/constants';
import { Logo } from './Logo';

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  Instagram: Instagram,
  LinkedIn: Linkedin,
  X: Mail,
  YouTube: Youtube,
};

interface FooterLink {
  label: string;
  to: string;
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="mb-4 text-2xs font-semibold uppercase tracking-wider text-subtle">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={`${link.to}-${link.label}`}>
            <Link
              to={link.to}
              className="link-underline text-sm text-ink/75 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Site footer: brand summary, working navigational shortcuts and contact
 * details. Every link resolves to a real route, anchor or contact channel.
 */
export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const exploreLinks: FooterLink[] = [
    { label: t('explore.buy'), to: `${ROUTES.explore}?listingType=sale` },
    { label: t('explore.rent'), to: `${ROUTES.explore}?listingType=rent` },
    { label: t('nav.compare'), to: ROUTES.compare },
    { label: t('nav.saved'), to: ROUTES.dashboardSaved },
    { label: t('nav.addProperty'), to: ROUTES.adminPropertyNew },
  ];

  const companyLinks: FooterLink[] = [
    { label: t('nav.about'), to: `${ROUTES.home}#why-estateo` },
    { label: t('home.testimonialsTitle'), to: `${ROUTES.home}#testimonials` },
    { label: t('home.locationsTitle'), to: `${ROUTES.home}#locations` },
    { label: t('home.newsletterTitle'), to: `${ROUTES.home}#newsletter` },
    { label: t('nav.dashboard'), to: ROUTES.dashboard },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-panel">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:pe-10">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-subtle">
              {t('footer.aboutBody')}
            </p>
            <ul className="mt-6 flex items-center gap-2.5">
              {APP.social.map((item) => {
                const Icon = SOCIAL_ICONS[item.label] ?? Mail;
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={item.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-subtle transition-colors hover:border-brand-800/30 hover:text-ink"
                    >
                      <Icon className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <FooterColumn title={t('footer.explore')} links={exploreLinks} />
            <FooterColumn title={t('footer.company')} links={companyLinks} />

            <div className="col-span-2 sm:col-span-1">
              <h3 className="mb-4 text-2xs font-semibold uppercase tracking-wider text-subtle">
                {t('footer.contact')}
              </h3>
              <ul className="space-y-3.5 text-sm text-ink/75">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                  <span>{APP.address}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                  <a href={`tel:${APP.supportPhone.replace(/[^+\d]/g, '')}`} className="link-underline">
                    {APP.supportPhone}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                  <a href={`mailto:${APP.supportEmail}`} className="link-underline break-all">
                    {APP.supportEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {APP.name}. {t('footer.rights')}
          </p>
          <p className="text-subtle/80">{t('footer.builtWith')}</p>
        </div>
      </Container>
    </footer>
  );
}
