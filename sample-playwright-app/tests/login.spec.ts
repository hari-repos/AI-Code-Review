import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';

test.describe('User Authentication', () => {
  test('should successfully log in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});
