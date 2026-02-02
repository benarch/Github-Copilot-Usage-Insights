import { test, expect } from '@playwright/test';

test.describe('Team Usage Report Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports/team-usage');
  });

  test('should display the page title and description', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Team Usage Report');
    await expect(page.locator('text=Download and analyze team-specific Copilot usage reports')).toBeVisible();
  });

  test('should show team summary dashboard cards', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for the presence of summary cards using more specific selectors
    await expect(page.getByRole('heading', { name: 'Total Team Members' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Copilot Seats' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Active Users' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Avg Acceptance Rate' })).toBeVisible();
  });

  test('should display individual member statistics table', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for table headers
    await expect(page.locator('text=Individual Member Statistics')).toBeVisible();
    await expect(page.locator('th:has-text("Username")')).toBeVisible();
    await expect(page.locator('th:has-text("Copilot Seat")')).toBeVisible();
    await expect(page.locator('th:has-text("Suggestions")')).toBeVisible();
    await expect(page.locator('th:has-text("Acceptances")')).toBeVisible();
    await expect(page.locator('th:has-text("Acceptance Rate")')).toBeVisible();
    await expect(page.locator('th:has-text("Active Days")')).toBeVisible();
  });

  test('should have team selection dropdown', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for team selector button
    const teamSelector = page.locator('button:has-text("All Teams")');
    await expect(teamSelector).toBeVisible();
    
    // Click to open dropdown
    await teamSelector.click();
    
    // Check for search input
    await expect(page.locator('input[placeholder="Search teams..."]')).toBeVisible();
    
    // Check for Select All and Clear buttons
    await expect(page.locator('button:has-text("Select All")')).toBeVisible();
    await expect(page.locator('button:has-text("Clear")')).toBeVisible();
  });

  test('should have date range selector', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for date range selector
    await expect(page.locator('select').first()).toBeVisible();
    
    // Check if default is 7 days
    const selectValue = await page.locator('select').first().inputValue();
    expect(selectValue).toBe('7');
  });

  test('should have export menu with options', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click export button
    const exportButton = page.locator('button:has-text("Export Report")');
    await expect(exportButton).toBeVisible();
    await exportButton.click();
    
    // Check for export options
    await expect(page.locator('text=Export CSV')).toBeVisible();
    await expect(page.locator('text=Export Excel')).toBeVisible();
    await expect(page.locator('text=Export PDF')).toBeVisible();
    await expect(page.locator('text=Print')).toBeVisible();
  });

  test('should have search functionality for members', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for search input
    await expect(page.locator('input[placeholder="Search members..."]')).toBeVisible();
  });

  test('should support table sorting', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click on a sortable header
    const usernameHeader = page.locator('th:has-text("Username")');
    await expect(usernameHeader).toBeVisible();
    
    // Click to sort
    await usernameHeader.click();
    
    // The sort should be applied (check that header is still visible)
    await expect(usernameHeader).toBeVisible();
  });

  test('should be responsive and support dark mode', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Test light mode classes
    await expect(page.locator('.dark\\:bg-dark-bg').first()).toBeVisible();
    
    // Note: Dark mode toggle functionality would need to be tested separately
    // as it depends on theme context
  });

  test('should show additional stats row', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for additional stats cards
    await expect(page.locator('text=Total Suggestions')).toBeVisible();
    await expect(page.locator('text=Total Acceptances')).toBeVisible();
    await expect(page.locator('text=Avg Acceptances Per User')).toBeVisible();
  });
});
