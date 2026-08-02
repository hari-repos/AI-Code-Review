# Playwright Test Automation Coding Standards

This document defines the team coding standards and best practices for this Playwright test repository. The AI Code Reviewer will automatically enforce these rules during Pull Request reviews.

## 1. Page Object Model (POM) Design
- **Encapsulation**: All UI locators and page interactions must be encapsulated inside Page Object classes located in `pages/`.
- **No Direct Locators in Specs**: Test spec files (`tests/*.spec.ts`) must NOT define raw CSS/XPath selectors or direct element queries. They must use methods on Page Objects.

## 2. Locators & Element Selector Strategy
- **User-First Locators**: Use web-first resilient locators:
  1. `page.getByRole(...)`
  2. `page.getByText(...)`
  3. `page.getByTestId(...)`
- **Forbidden**: Avoid brittle CSS selectors containing deep DOM chains (e.g. `div > div:nth-child(3) > button`) or dynamic XPath selectors containing generated IDs.

## 3. Waiting Strategies & Assertions
- **Web-First Assertions**: Always use web-first assertions from Playwright:
  ```typescript
  await expect(page.getByRole('button')).toBeVisible();
  ```
- **Forbidden Hard Waits**: Never use `page.waitForTimeout(milliseconds)` or fixed `setTimeout`. Always rely on Playwright's automatic waiting and web-first assertions.

## 4. Test Data & State Clean Up
- **Isolation**: Each test case must be completely independent and capable of running in parallel without relying on execution order.
- **Clean Up**: Use `afterEach` or `afterAll` fixtures to clean up created test data.
