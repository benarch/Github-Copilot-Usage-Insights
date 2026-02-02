import { test, expect } from '@playwright/test';

test.describe('GitHub Copilot Metrics API Integration', () => {
  test.beforeAll(async () => {
    // Wait a bit for the servers to be fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  test('API should return GitHub sync status', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/usage/github/status');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('configured');
    expect(data).toHaveProperty('lastSyncDate');
    expect(data).toHaveProperty('organization');
  });

  test('API should test GitHub connection when not configured', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/usage/github/test-connection');
    const data = await response.json();
    
    // Should return error if not configured (no env vars in test)
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
  });

  test('API should return appropriate error when syncing without configuration', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/usage/github/sync', {
      data: {}
    });
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
    
    // Should fail if not configured
    if (!data.success) {
      expect(data.message).toContain('GitHub API not configured');
    }
  });

  test('API should accept sync options', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/usage/github/sync', {
      data: {
        since: '2024-01-01',
        until: '2024-01-31',
        clearExisting: false
      }
    });
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('message');
  });

  test('API health check should work', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });

  test('API docs should be accessible', async ({ page }) => {
    await page.goto('http://localhost:3001/api-docs');
    
    // Check if swagger UI is loaded
    await expect(page.locator('.swagger-ui').first()).toBeVisible({ timeout: 10000 });
  });

  test('Frontend should load successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if the page loads without errors
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    
    // The app should have some content
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});

test.describe('GitHub API Integration Documentation', () => {
  test('README should document GitHub API integration', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const readmePath = path.resolve(process.cwd(), 'README.md');
    const readme = fs.readFileSync(readmePath, 'utf-8');
    
    // Check for key documentation elements
    expect(readme).toContain('Direct API Integration');
    expect(readme).toContain('GITHUB_TOKEN');
    expect(readme).toContain('GITHUB_ORG');
    expect(readme).toContain('Benefits');
    expect(readme).toContain('Disadvantages');
    expect(readme).toContain('Real-time or near real-time data access');
    expect(readme).toContain('Requires GitHub API token');
  });

  test('.env.example should exist and contain required variables', async () => {
    const fs = await import('fs');
    const path = await import('path');
    
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBeTruthy();
    
    const envExample = fs.readFileSync(envExamplePath, 'utf-8');
    expect(envExample).toContain('GITHUB_TOKEN');
    expect(envExample).toContain('GITHUB_ORG');
  });
});
