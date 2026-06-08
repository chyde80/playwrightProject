import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { CURRENT_USER, isPerformanceUser } from '../src/fixtures/currentUser';

const performanceTest = isPerformanceUser ? test : test.skip;

test.describe('Performance Glitch User Detection', () => {
  performanceTest(
    'should detect slow inventory load for performance_glitch_user',
    async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.navigate();

      const start = Date.now();
      await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);
      await expect(page).toHaveURL(/inventory/, { timeout: 10000 });
      await expect(page.locator('.inventory_list')).toBeVisible({ timeout: 10000 });
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThan(2000);
    },
  );
});
