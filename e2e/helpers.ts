import { expect, type Page } from '@playwright/test';

/** Namespaced localStorage keys used by the app's persistence layer. */
export const STORAGE_KEYS = {
  favorites: 'estateo:favorites',
  comparison: 'estateo:comparison',
  language: 'estateo:language',
} as const;

/** Signs in through the mock auth screen using the one-click demo accounts. */
export async function signInAs(page: Page, account: 'admin' | 'user'): Promise<void> {
  await page.goto('/login');
  await page
    .getByRole('button', { name: account === 'admin' ? 'Use admin' : 'Use buyer', exact: true })
    .click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

/** Reads a namespaced localStorage entry and parses it as JSON. */
export async function readStored(page: Page, key: string): Promise<unknown> {
  const raw = await page.evaluate((storageKey) => window.localStorage.getItem(storageKey), key);
  return raw ? JSON.parse(raw) : null;
}
