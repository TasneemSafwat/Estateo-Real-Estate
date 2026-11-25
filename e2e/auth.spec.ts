import { expect, test } from '@playwright/test';
import { signInAs } from './helpers';

test.describe('Authentication', () => {
  test('guests are redirected from protected areas to the sign-in screen', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome back');
  });

  test('rejects invalid credentials with an inline error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill('nobody@example.com');
    await page.getByLabel('Password').fill('not-the-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.getByRole('alert')).toContainText('do not match');
  });

  test('a buyer can sign in, reach the dashboard and sign out', async ({ page }) => {
    await signInAs(page, 'user');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome back');

    await page.getByRole('button', { name: 'Account', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  });

  test('an administrator reaches the admin overview', async ({ page }) => {
    await signInAs(page, 'admin');
    await page.goto('/admin');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Admin overview');
  });
});
