import { expect, test } from '@playwright/test';
import { signInAs } from './helpers';

test.describe('Admin workspace', () => {
  test('an administrator can delete a listing after confirming', async ({ page }) => {
    await signInAs(page, 'admin');
    await page.goto('/admin/properties');

    // Desktop renders a table row action; mobile renders a card button.
    const deleteButton = page
      .locator('button[aria-label="Delete"]:visible, button:text-is("Delete"):visible')
      .first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Property deleted.')).toBeVisible();
  });

  test('an administrator can publish a listing through the wizard', async ({ page }) => {
    await signInAs(page, 'admin');
    await page.goto('/admin/properties/new');

    // Step 1 — basic information.
    await expect(page.getByRole('heading', { name: 'Tell us about the property' })).toBeVisible();
    await page.getByLabel('Listing title').fill('Sunlit Harbour View Apartment');
    await page
      .getByLabel('Description')
      .fill(
        'A bright, generously proportioned apartment overlooking the marina with premium finishes throughout.',
      );
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2 — location.
    await page.getByLabel('Street address').fill('12 Marina Boulevard');
    await page.getByLabel('City').selectOption({ label: 'San Francisco' });
    await page.getByLabel('District or neighbourhood').fill('Marina');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3 — pricing and specifications.
    await page.getByLabel('Price').fill('1250000');
    await page.getByLabel('Area (sq ft)').fill('1450');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 4 — amenities.
    await page.getByRole('button', { name: 'Swimming pool', exact: true }).click();
    await page.getByRole('button', { name: '24/7 security', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 5 — photos.
    await page.setInputFiles('input[type="file"]', {
      name: 'cover.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC',
        'base64',
      ),
    });
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 6 — review and publish.
    await expect(page.getByRole('heading', { name: 'Review before publishing' })).toBeVisible();
    await page.getByRole('button', { name: 'Publish property', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Property published' })).toBeVisible();
  });
});
