# Sample Playwright Test Automation Project

This repository demonstrates how an enterprise Playwright test automation project consumes the shared **`@mycompany/core-engine`** NPM package to perform automated AI PR code reviews during Azure DevOps Pull Requests.

---

## 📁 Repository Overview

```
sample-playwright-app/
├── azure-pipelines-ai-review.yml # Option 3 dedicated PR review pipeline
├── CODING_STANDARDS.md           # Playwright-specific team rules
├── package.json                  # Consumes @mycompany/core-engine
├── pages/
│   └── login-page.ts             # Page Object Model class
└── tests/
    └── login.spec.ts             # Playwright test spec
```

---

## 🚀 How to Run Local AI PR Review

To test the AI Code Reviewer locally inside this project:

```bash
# 1. Install dependencies
npm install

# 2. Export your OpenAI key
export OPENAI_API_KEY="sk-proj-your-key"

# 3. Run the AI reviewer CLI
npm run ai-review
```

---

## ⚙️ Azure DevOps PR Pipeline Setup

This project includes [`azure-pipelines-ai-review.yml`](./azure-pipelines-ai-review.yml), configured to trigger AI PR reviews whenever a Pull Request targets `main`, `develop`, or `project-main`.

### Pipeline Execution Command
In Azure DevOps, the pipeline executes:
```bash
npx ai-pr-review
```
It reads this project's local [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) file to enforce Playwright-specific rules (POM design, locator strategies, auto-waiting assertions) and posts active thread comments on Azure DevOps PRs.
