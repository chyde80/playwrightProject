import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { isProblemUser, CURRENT_USER } from '../src/fixtures/currentUser';

const problemUserTest = isProblemUser ? test : test.skip;

test.describe('Problem User Detection', () => {
  problemUserTest('should show broken product images for problem_user', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login(CURRENT_USER.username, CURRENT_USER.password);
    await expect(page).toHaveURL(/inventory/);

    const brokenImages = await page.$$eval('.inventory_item_img img', (imgs) =>
      imgs
        .filter((img) => img.getAttribute('src')?.includes('sl-404'))
        .map((img) => img.getAttribute('src')),
    );

    expect(brokenImages.length).toBeGreaterThan(0);
    expect(brokenImages.length).toBe(
      await page.$$eval('.inventory_item_img img', (imgs) => imgs.length),
    );
  });
});
