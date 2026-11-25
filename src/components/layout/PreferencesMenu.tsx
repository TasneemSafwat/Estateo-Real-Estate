import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Globe, Moon, Sun } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { CURRENCY_OPTIONS } from '@/utils/constants';
import { LANGUAGE_META, SUPPORTED_LANGUAGES } from '@/i18n';
import type { Language } from '@/types';
import { IconButton } from '@/components/common/Button';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

function Segmented<T extends string>({ options, value, onChange, ariaLabel }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-2 gap-1 rounded-xl bg-brand-800/6 p-1 dark:bg-white/8"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[0.8125rem] font-semibold transition-all duration-200',
              selected
                ? 'bg-panel text-ink shadow-soft'
                : 'text-subtle hover:text-ink',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Consolidated theme / language / currency control used in the navigation bar.
 */
export function PreferencesMenu({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <IconButton
        label={t('nav.preferences')}
        variant="ghost"
        size={compact ? 'sm' : 'md'}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <Globe className="h-[18px] w-[18px]" aria-hidden="true" />
      </IconButton>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t('nav.preferences')}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute end-0 top-[calc(100%+0.6rem)] z-50 w-64 rounded-2xl border border-line bg-panel p-4 shadow-lift"
          >
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-subtle">
                  {t('nav.theme')}
                </p>
                <Segmented
                  ariaLabel={t('nav.theme')}
                  value={theme}
                  onChange={setTheme}
                  options={[
                    {
                      value: 'light',
                      label: t('nav.light'),
                      icon: <Sun className="h-3.5 w-3.5" aria-hidden="true" />,
                    },
                    {
                      value: 'dark',
                      label: t('nav.dark'),
                      icon: <Moon className="h-3.5 w-3.5" aria-hidden="true" />,
                    },
                  ]}
                />
              </div>

              <div>
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-subtle">
                  {t('nav.language')}
                </p>
                <Segmented
                  ariaLabel={t('nav.language')}
                  value={language}
                  onChange={(value) => setLanguage(value as Language)}
                  options={SUPPORTED_LANGUAGES.map((code) => ({
                    value: code,
                    label: LANGUAGE_META[code].nativeLabel,
                  }))}
                />
              </div>

              <div>
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-subtle">
                  {t('nav.currency')}
                </p>
                <div className="max-h-44 space-y-1 overflow-y-auto pe-0.5">
                  {CURRENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCurrency(option.value as typeof currency)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-start text-[0.8125rem] font-medium text-ink/85 transition-colors hover:bg-brand-800/6 dark:hover:bg-white/8"
                    >
                      {option.label}
                      {currency === option.value && (
                        <Check className="h-3.5 w-3.5 text-accent-600" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
