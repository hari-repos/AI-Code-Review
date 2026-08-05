import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login Functionality', () => {
  test('should display error message on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid_user', 'wrong_password');
    await loginPage.verifyErrorMessage('Invalid username or password.');
  });
});
