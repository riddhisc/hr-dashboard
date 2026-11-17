import { expect, test } from '@playwright/test';
test('overview and employees are reachable', async ({ page }) => { await page.goto('/dashboard'); await expect(page.getByRole('heading', { name: /Good morning, Priya/i })).toBeVisible(); await page.getByRole('link', { name: 'Employees' }).click(); await expect(page.getByRole('heading', { name: 'Employees' })).toBeVisible(); });
