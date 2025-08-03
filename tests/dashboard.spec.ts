import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should display dashboard with demo user logged in', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to dashboard since demo user is auto-logged in
    await expect(page).toHaveURL('/dashboard');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/CargoFlow/);
    
    // Check if the welcome header is visible
    await expect(page.locator('h1')).toContainText('Good');
    await expect(page.locator('h1')).toContainText('Demo');
    
    // Check if stats cards are visible
    await expect(page.locator('[data-testid="stat-card"]').first()).toBeVisible();
    
    // Check if sidebar is visible with navigation items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Orders')).toBeVisible();
    await expect(page.locator('text=Create Order')).toBeVisible();
    
    // Check if quick actions are visible
    await expect(page.locator('text=Quick Actions')).toBeVisible();
  });

  test('should navigate to create order page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on Create Order in sidebar
    await page.click('text=Create Order');
    
    // Should navigate to create order page
    await expect(page).toHaveURL('/orders/create');
    
    // Check if create order form is visible
    await expect(page.locator('h1')).toContainText('Create New Order');
  });

  test('should navigate to orders list page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on Orders in sidebar
    await page.click('text=Orders');
    
    // Should navigate to orders page
    await expect(page).toHaveURL('/orders');
    
    // Check if orders page is loaded
    await expect(page.locator('h1')).toContainText('Orders');
  });

  test('should display user menu in header', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if user menu is visible
    await expect(page.locator('text=Demo Customer')).toBeVisible();
    
    // Click on user menu
    await page.click('text=Demo Customer');
    
    // Check if dropdown menu appears
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
    await expect(page.locator('text=Sign out')).toBeVisible();
  });

  test('should display organization info', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if organization name is displayed in header
    await expect(page.locator('text=Demo Cargo Company')).toBeVisible();
  });
});