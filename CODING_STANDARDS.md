# Framework & Team Coding Standards

This document specifies the custom coding standards and best practices that the AI Code Reviewer will enforce during Pull Request reviews.

## 1. General TypeScript & JavaScript Standards
- **Strict Typing**: Avoid `any` types. Use explicit types, interfaces, or generics.
- **Asynchronous Code**: Prefer `async/await` over raw promise chains (`.then()`). Always handle errors in async operations.
- **Immutability**: Avoid mutating parameters directly. Use `const` by default and prefer immutable patterns.
- **Logging**: Do not use `console.log` in production code. Use structured logging (e.g., `winston` or `pino`) with appropriate log levels.

## 2. Security Best Practices
- **Input Validation**: Ensure all external inputs (API params, body, query strings) are validated/sanitized before processing.
- **Secrets Management**: Hardcoded API keys, passwords, tokens, or credentials are strictly forbidden. Use environment variables.
- **SQL / Injection**: Use parameterized queries or ORMs to prevent SQL injection and command injection.

## 3. Architecture & Clean Code
- **Single Responsibility**: Functions should do one thing well. Break down functions longer than 30 lines.
- **Error Handling**: Throw custom domain errors or standard Error objects; never throw raw strings or objects.
- **Resource Management**: Always close file handles, database connections, and HTTP sockets in `finally` blocks or using disposable patterns.

## 4. Framework-Specific Rules (Node.js / Express / React)
- **Express**: Ensure all route handlers pass unhandled errors to `next(err)`.
- **React**: Ensure hooks follow the Rules of Hooks (no conditional hooks, complete dependency arrays in `useEffect`).
- **Dependencies**: Prefer light, modern libraries over heavy deprecated ones (e.g. `node-fetch` / standard `fetch` over `request`).
