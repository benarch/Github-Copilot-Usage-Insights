const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'app screenshots');

// All routes to screenshot
const routes = [
  { path: '/overview', name: 'overview', scroll: true },
  { path: '/insights/copilot-usage', name: 'copilot-usage', scroll: true, lightDarkCompare: true },
  { path: '/insights/code-generation', name: 'code-generation', scroll: true },
  { path: '/people', name: 'people', scroll: true },
  { path: '/teams', name: 'teams', scroll: true },
  { path: '/teams/users', name: 'users-in-teams', scroll: true },
  { path: '/organizations', name: 'organizations', scroll: true },
  { path: '/table-view/summary', name: 'table-view-summary', scroll: true },
  { path: '/table-view/detailed', name: 'table-view-detailed', scroll: true },
  { path: '/table-view/teams', name: 'table-view-teams', scroll: true },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, suffix = '') {
  const filename = `${name}${suffix}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  ✓ Saved: ${filename}`);
}

async function scrollAndScreenshot(page, name, suffix = '') {
  // First, full page screenshot
  await takeScreenshot(page, name, suffix);
  
  // Get scroll height
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  
  if (scrollHeight > viewportHeight * 1.5) {
    // Scroll to middle and take screenshot
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await sleep(500);
    await takeScreenshot(page, name, `${suffix}-scrolled-middle`);
    
    // Scroll to bottom and take screenshot
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(500);
    await takeScreenshot(page, name, `${suffix}-scrolled-bottom`);
    
    // Reset scroll
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(300);
  }
}

async function setTheme(page, theme) {
  await page.evaluate((theme) => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, theme);
  await sleep(500);
}

async function run() {
  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // First, navigate to app and set DARK mode in localStorage
    console.log('\nNavigating to app and setting dark theme...');
    await page.goto(`${BASE_URL}/overview`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(500);
    
    // Set dark theme in localStorage first
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
    });
    
    // Reload to apply theme
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(1000);
    
    // Take all screenshots in DARK mode
    console.log('\n=== DARK MODE SCREENSHOTS ===\n');
    
    for (const route of routes) {
      console.log(`📸 ${route.name}`);
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(1500); // Wait for data to load
      
      // Ensure dark theme is applied
      await page.evaluate(() => {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      });
      await sleep(300);
      
      if (route.scroll) {
        await scrollAndScreenshot(page, route.name, '');
      } else {
        await takeScreenshot(page, route.name, '');
      }
    }
    
    // Take ONE light mode screenshot for comparison (Copilot Usage) with scrolling
    console.log('\n=== LIGHT MODE REFERENCE (Copilot Usage) ===\n');
    
    // Set light theme
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    
    await page.goto(`${BASE_URL}/insights/copilot-usage`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    
    // Ensure light theme is applied
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    await sleep(500);
    
    // Take full page and scrolled screenshots
    await scrollAndScreenshot(page, 'copilot-usage-light', '');
    console.log('  ✓ Saved: copilot-usage-light.png (with scroll variants)');
    
    console.log('\n✅ All screenshots completed!');
    console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
    
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

run();
