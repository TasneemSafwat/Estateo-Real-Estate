import { expect, test } from '@playwright/test';
import { STORAGE_KEYS, readStored } from './helpers';

test.describe('Discovery journey', () => {
  test('renders the landing hero and explores the catalogue', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Find a home that matches your ambition',
    );

    await page.getByRole('link', { name: 'Explore properties', exact: true }).first().click();
    await expect(page).toHaveURL(/\/properties$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Explore properties');
  });

  test('lists properties and opens a detail page', async ({ page }) => {
    await page.goto('/properties');

    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible();

    await firstCard.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/properties\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('shortlisting a property persists to localStorage', async ({ page }) => {
    await page.goto('/properties');

    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible();
    await firstCard
      .getByRole('button', { name: 'Added to your shortlist.', exact: true })
      .click();

    const favorites = (await readStored(page, STORAGE_KEYS.favorites)) as string[] | null;
    expect(Array.isArray(favorites)).toBe(true);
    expect(favorites).not.toHaveLength(0);
  });

  test('search narrows the results and can be cleared', async ({ page }) => {
    await page.goto('/properties');
    await expect(page.locator('article').first()).toBeVisible();

    await page.getByPlaceholder('City, district or property name').fill('zzzz-no-match');
    await expect(page.getByText('No properties found')).toBeVisible({ timeout: 10_000 });
  });

  test('the 404 page offers a route back home', async ({ page }) => {
    await page.goto('/this/route/does-not-exist');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('We lost that address');

    await page.getByRole('link', { name: 'Back to home', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
