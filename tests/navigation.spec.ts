import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should have working sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test navigation to different pages
    const navigationItems = [
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Orders', url: '/orders' },
      { text: 'Create Order', url: '/orders/create' },
      { text: 'Tracking', url: '/tracking' },
      { text: 'Settings', url: '/settings' }
    ];
    
    for (const item of navigationItems) {
      await page.click(`text=${item.text}`);
      await expect(page).toHaveURL(item.url);
      
      // Go back to dashboard for next test
      if (item.url !== '/dashboard') {
        await page.click('text=Dashboard');
        await expect(page).toHaveURL('/dashboard');
      }
    }
  });

  test('should toggle sidebar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Sidebar should be hidden on mobile initially
    const sidebar = page.locator('[data-testid="sidebar"]');
    
    // Click hamburger menu to open sidebar
    await page.click('[data-testid="menu-button"]');
    
    // Sidebar should be visible
    await expect(sidebar).toBeVisible();
  });
});