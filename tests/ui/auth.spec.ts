import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('login fails with invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('invalid@example.com', 'InvalidPassword123!');

  await expect(page).toHaveURL(/\/auth\/login/);

  await expect(loginPage.loginError).toHaveText(
    'Invalid email or password'
  );
});

test('login fails when required fields are empty', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.loginButton.click();

  await expect(page).toHaveURL(/\/auth\/login/);

  await expect(loginPage.emailError).toHaveText('Email is required');
  await expect(loginPage.passwordError).toHaveText('Password is required');
});

test('login succeeds with valid credentials', async ({ page }) => {
  test.skip(
    !!process.env.CI,
    'Cloudflare security verification blocks authentication in CI'
  );

  const loginPage = new LoginPage(page);

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Test user credentials are missing');
  }

  await loginPage.goto();
  await loginPage.login(email, password);

  await expect(page).toHaveURL(/\/account$/);
  await expect(
    page.getByRole('heading', { name: 'My account' })
  ).toBeVisible();
});