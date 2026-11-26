import { expect, test } from '@playwright/test';
test('sign up is required and greets the signed-in user', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
  await page.getByRole('link', { name: 'Create an account' }).click();
  await page.getByLabel('Full name').fill('Test User');
  await page.getByLabel('Company name').fill('Test Co');
  await page.getByLabel('Work email').fill('test@example.com');
  await page.getByLabel(/Password/).fill('password123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: /Test/ })).toBeVisible();
  await page.getByRole('link', { name: 'Employees', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Employees', exact: true })).toBeVisible();
});
