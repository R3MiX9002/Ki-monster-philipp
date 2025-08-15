const { test, expect } = require('@playwright/test');

test('Login Test', async ({ page }) => {
  await page.goto('https://deine-webapp-url');
  await page.fill('#username', 'demo');
  await page.fill('#password', '1234');
  await page.click('#loginButton');
  await expect(page).toHaveURL(/dashboard/);
});
