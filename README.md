# Enterprise AI Core Engine & Sample Playwright Integration

This repository is structured into two modular projects:

```
AI-Code-Review/
├── core-engine/                # 📦 Core Engine NPM Package (@mycompany/core-engine)
│   ├── src/
│   │   ├── index.ts            # Root API export
│   │   ├── cli.ts              # CLI executable entrypoint (npx ai-pr-review)
│   │   ├── reviewers/          # AI Code Reviewer capability
│   │   └── generators/         # Test Case Generator capability (future capability)
│   ├── package.json            # Exports "bin": { "ai-pr-review": "./dist/cli.js" }
│   └── tsconfig.json
│
└── sample-playwright-app/      # 🎭 Sample Playwright Test Automation Project
    ├── azure-pipelines-ai-review.yml # Option 3 dedicated PR review pipeline
    ├── CODING_STANDARDS.md     # Playwright-specific coding rules & POM standards
    ├── pages/                  # Sample Page Object Model classes
    ├── tests/                  # Sample Playwright test specs
    └── package.json            # Consumes @mycompany/core-engine package
```

---

## 1. `core-engine` (NPM Package)
- **Role**: Published to internal **Azure Artifacts** feed (`@mycompany/core-engine`).
- **Capabilities**:
  - `ai-reviewer`: Analyzes PR git diffs against OpenAI / Azure OpenAI.
  - `generators`: Placeholder module for future AI automated test case generation.
  - `cli`: Exposes `npx ai-pr-review` CLI command.

### Building & Publishing Core Engine
```bash
cd core-engine
npm install
npm run build
npm publish
```

---

## 2. `sample-playwright-app` (Consuming Project)
- **Role**: Example test automation repository consuming `@mycompany/core-engine`.
- **Features**:
  - Maintains its own Playwright [`CODING_STANDARDS.md`](./sample-playwright-app/CODING_STANDARDS.md).
  - Uses dedicated [`azure-pipelines-ai-review.yml`](./sample-playwright-app/azure-pipelines-ai-review.yml) pipeline targeting `main`, `develop`, `project-main`.
  - Executes `npx ai-pr-review`.

### Running AI Review in Sample App
```bash
cd sample-playwright-app
npm install
export OPENAI_API_KEY="sk-proj-your-key"
npm run ai-review
```
