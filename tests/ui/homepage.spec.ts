import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL('/');

  await expect(
    page.locator('[title="Practice Software Testing - Toolshop"]')
  ).toBeVisible();
});