import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(
    'https://practicesoftwaretesting.com/'
  );
  await expect(
    page.locator('[title="Practice Software Testing - Toolshop"]')
  ).toBeVisible();
});