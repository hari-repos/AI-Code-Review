# Enterprise Framework & Team Coding Standards

This document defines internal coding standards enforced by `@mycompany/ai-capabilities`.

## 1. General TypeScript Standards
- **Strict Typing**: Avoid `any` types. Use explicit interfaces or generics.
- **Asynchronous Code**: Prefer `async/await` over raw promise chains (`.then()`). Always handle errors in async operations.
- **Immutability**: Avoid mutating function parameters directly.

## 2. Security Best Practices
- **Input Validation**: Ensure all external inputs (API params, query strings, headers) are sanitized/validated.
- **Secrets**: Hardcoded API keys, secrets, or tokens are strictly forbidden. Use environment variables.
- **Injection Risks**: Use parameterized queries or ORMs to prevent SQL/command injection.

## 3. Test Automation (Playwright / Jest)
- **Page Object Model**: Encapsulate UI locators and page actions inside POM classes.
- **Locators**: Use resilient user-first locators (`getByRole`, `getByText`, `getByTestId`).
- **Assertions**: Use web-first assertions (`expect(locator).toBeVisible()`). Avoid fixed sleep timeouts (`page.waitForTimeout()`).
