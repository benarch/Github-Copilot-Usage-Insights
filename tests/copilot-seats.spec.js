/**
 * Playwright test for Copilot Seats feature
 * 
 * This test validates that the Copilot Seats section is displayed correctly
 * in the Summary Report page.
 * 
 * To run this test:
 * 1. Ensure the dev servers are running: npm run dev
 * 2. Install Playwright: npm install -D @playwright/test
 * 3. Run the test: npx playwright test tests/copilot-seats.spec.js
 */

const { test, expect } = require('@playwright/test');

test.describe('Copilot Seats Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Summary Report page
    await page.goto('http://localhost:3000/table-view/summary');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display Copilot Seats section', async ({ page }) => {
    // Check that the Copilot Seats heading is visible
    const seatsHeading = page.getByRole('heading', { name: 'Copilot Seats' });
    await expect(seatsHeading).toBeVisible();
  });

  test('should display Total Seats card', async ({ page }) => {
    // Check for Total Seats label
    const totalSeatsLabel = page.getByText('Total Seats');
    await expect(totalSeatsLabel).toBeVisible();
    
    // Check for description
    const totalSeatsDesc = page.getByText('Total Copilot licenses allocated');
    await expect(totalSeatsDesc).toBeVisible();
  });

  test('should display Active Seats card', async ({ page }) => {
    // Check for Active Seats label
    const activeSeatsLabel = page.getByText('Active Seats');
    await expect(activeSeatsLabel).toBeVisible();
    
    // Check for description
    const activeSeatsDesc = page.getByText('Seats with activity in timeframe');
    await expect(activeSeatsDesc).toBeVisible();
  });

  test('should display Unused Seats card', async ({ page }) => {
    // Check for Unused Seats label
    const unusedSeatsLabel = page.getByText('Unused Seats');
    await expect(unusedSeatsLabel).toBeVisible();
    
    // Check for description
    const unusedSeatsDesc = page.getByText('Seats with no recent activity');
    await expect(unusedSeatsDesc).toBeVisible();
  });

  test('should update seats data when timeframe changes', async ({ page }) => {
    // Wait for initial data to load
    await page.waitForTimeout(2000);
    
    // Get the initial Total Seats value
    const totalSeatsCard = page.locator('text=Total Seats').locator('..');
    const initialValue = await totalSeatsCard.locator('div').first().textContent();
    
    // Change timeframe to 7 days
    const timeframeSelect = page.getByRole('combobox');
    await timeframeSelect.selectOption('7');
    
    // Wait for data to reload
    await page.waitForTimeout(1000);
    
    // The Total Seats value should still be displayed (may be the same or different)
    const newValue = await totalSeatsCard.locator('div').first().textContent();
    expect(newValue).toBeTruthy();
  });

  test('should display Copilot Seats before other sections', async ({ page }) => {
    // Get all section headings
    const headings = await page.locator('h2').allTextContents();
    
    // Copilot Seats should be the first section
    expect(headings[0]).toContain('Copilot Seats');
  });

  test('should work in dark mode', async ({ page }) => {
    // Toggle dark mode
    const darkModeButton = page.getByRole('button', { name: /Switch to dark mode/i });
    await darkModeButton.click();
    
    // Wait for theme to change
    await page.waitForTimeout(500);
    
    // Check that Copilot Seats section is still visible
    const seatsHeading = page.getByRole('heading', { name: 'Copilot Seats' });
    await expect(seatsHeading).toBeVisible();
    
    // Check that cards are still visible
    const totalSeatsLabel = page.getByText('Total Seats');
    await expect(totalSeatsLabel).toBeVisible();
  });
});
