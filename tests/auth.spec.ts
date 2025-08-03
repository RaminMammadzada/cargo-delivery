import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should auto-login demo user and redirect to dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Should automatically redirect to dashboard with demo user
    await expect(page).toHaveURL('/dashboard');
    
    // Should show logged in user info
    await expect(page.locator('text=Demo Customer')).toBeVisible();
  });

  test('should show login page when accessing /login directly', async ({ page }) => {
    await page.goto('/login');
    
    // Should show login form
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Should show demo credentials
    await expect(page.locator('text=Demo Credentials')).toBeVisible();
  });
});