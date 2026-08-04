# `@mycompany/ai-capabilities`

An enterprise-grade, modular Node.js/TypeScript **AI Capabilities SDK and CLI** designed to build custom internal AI solutions, automate Azure DevOps Pull Request reviews, and generate automated test suites.

---

## 🌟 Key Capabilities Included

| Capability | Description | CLI Executable | SDK Function |
| :--- | :--- | :--- | :--- |
| **Automated PR Code Reviewer** | Scans git diffs, enforces team standards, and posts active inline comments directly on Azure DevOps PRs. | `npx ai-pr-review` | `runAIReviewer()` |
| **AI Test Case Generator** | Generates production-grade Playwright or unit test suites from source code. | `npx ai-generate-tests` | `generateTestCases()` |
| **Generic Custom AI Prompt Runner** | Reusable typed wrapper for custom internal AI solutions and workflows. | `npx ai-capabilities` | `runCustomAIPrompt()` |
| **Dual AI Client Wrapper** | Seamless support for standard OpenAI (`gpt-4o`) and Azure OpenAI instances. | N/A | `createAIClient()` |

---

## 📦 1. Installation

Publish this package to your internal **Azure Artifacts** or private NPM registry:

```bash
# Install in any project repository
npm install --save-dev @mycompany/ai-capabilities
```

---

## 🚀 2. Usage as a TypeScript/JavaScript SDK (Custom Internal Solutions)

You can import any capability directly into your custom internal applications:

```typescript
import { 
  runAIReviewer, 
  generateTestCases, 
  runCustomAIPrompt, 
  createAIClient 
} from '@mycompany/ai-capabilities';

// Example 1: Trigger PR Review programmatically
await runAIReviewer({
  targetBranch: 'main',
  dryRun: false
});

// Example 2: Generate Playwright Test Suite programmatically
const testResult = await generateTestCases({
  sourceFilePath: './pages/login-page.ts',
  framework: 'playwright'
});
console.log(testResult.testCode);

// Example 3: Execute a Custom Internal AI Task
interface CustomAnalysisResult {
  summary: string;
  riskScore: number;
}

const analysis = await runCustomAIPrompt<CustomAnalysisResult>({
  systemPrompt: 'Analyze the system architecture diagram text and return a JSON risk score.',
  userPrompt: 'Architecture specs: ...'
});
```

---

## ⚙️ 3. Usage as an Azure DevOps Pipeline CLI

To automate Pull Request code reviews across any team repository, add a step in your `azure-pipelines.yml`:

```yaml
name: AI PR Code Reviewer Pipeline

pr:
  branches:
    include:
      - main
      - develop
      - project-main

trigger: none

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'

  - script: |
      npm ci
      npx ai-pr-review
    displayName: 'Run Enterprise AI Code Reviewer'
    env:
      SYSTEM_ACCESSTOKEN: $(System.AccessToken)
      OPENAI_API_KEY: $(OPENAI_API_KEY)
      # Or Azure OpenAI:
      # AZURE_OPENAI_ENDPOINT: '$(AZURE_OPENAI_ENDPOINT)'
      # AZURE_OPENAI_API_KEY: '$(AZURE_OPENAI_API_KEY)'
      # AZURE_OPENAI_DEPLOYMENT: '$(AZURE_OPENAI_DEPLOYMENT)'
```

---

## 📐 4. Customizing Team Coding Standards

Place a `CODING_STANDARDS.md` file in the root of any repository running `@mycompany/ai-capabilities`. The SDK automatically reads local standards and injects them into the AI prompt.

Example `CODING_STANDARDS.md`:
```markdown
# Team Coding Standards
- Do not use `console.log` in production code.
- Ensure all API inputs are validated with `zod`.
- Playwright tests must use Page Object Model (POM) and web-first assertions.
```

---

## 🛠️ Package Structure & Architecture

```
@mycompany/ai-capabilities/
├── dist/                     # Compiled JS and .d.ts type declarations
├── src/
│   ├── index.ts              # SDK root export
│   ├── cli.ts                # CLI entrypoint (npx ai-pr-review)
│   ├── client/               # OpenAI & Azure OpenAI client wrapper
│   │   ├── openai-client.ts
│   │   └── types.ts
│   ├── capabilities/         # Modular AI capabilities
│   │   ├── pr-reviewer/      # Azure DevOps PR Code Reviewer
│   │   ├── test-generator/   # Automated Test Case Generator
│   │   └── custom-prompt/    # Generic Custom AI Prompt Runner
│   └── utils/                # Config loader & logger utilities
├── package.json
└── tsconfig.json
```
