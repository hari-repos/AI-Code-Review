# Playwright Test Suite Coding Standards

## 1. Page Object Model (POM)
- Encapsulate all UI selectors and interactions in Page Object classes under `pages/`.
- Test files in `tests/` must only call high-level page methods, not raw locators.

## 2. Locator Best Practices
- Prefer resilient, user-visible locators: `getByRole`, `getByText`, `getByTestId`.
- Avoid brittle XPath or long CSS chains (e.g. `div > span > input`).

## 3. Web-First Assertions
- Use async assertions: `await expect(locator).toBeVisible()`.
- Never use fixed delays like `page.waitForTimeout(5000)`.

## 4. Code Quality & Security
- Strict TypeScript: Do not use `any`.
- Keep credentials out of source code. Use environment variables.
