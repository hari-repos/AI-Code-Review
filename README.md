# AI Code Reviewer for Azure DevOps Pull Requests

An automated, internal AI-powered code review tool built with **Node.js**, **TypeScript**, **`azure-devops-node-api`**, **`openai`**, and **`simple-git`**. 

This tool runs directly inside Azure DevOps Pull Request validation pipelines, analyzes git diffs for bugs, security vulnerabilities (OWASP), performance bottlenecks, and team-specific coding standards, and automatically posts inline comments on the affected files and lines.

---

## Features

- 🤖 **Automated PR Code Review**: Scans git diffs upon PR creation/update targeting `main`.
- 🔐 **Security & Quality First**: Identifies security vulnerabilities, logic bugs, and clean-code violations.
- 📐 **Custom Framework & Team Coding Standards**: Enforces custom coding standards defined in `CODING_STANDARDS.md` or via environment variables.
- ⚡ **Azure OpenAI & OpenAI Compatible**: Works with standard OpenAI models (`gpt-4o`, `gpt-4-turbo`) and Azure OpenAI deployments.
- 💬 **Native Azure DevOps Inline Threads**: Posts active comment threads directly on specific files and line numbers.

---

## Repository Structure

```
.
├── ai-reviewer.ts         # Main execution script
├── azure-pipelines.yml    # Azure DevOps PR Pipeline configuration
├── CODING_STANDARDS.md    # Framework and team coding rules template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript Node 20 configuration
└── README.md              # Documentation and setup guide
```

---

## 1. Local Setup & Testing

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### Installation
```bash
# Install dependencies
npm install
```

### Dry-Run / Local Execution
You can test the AI reviewer locally against your git repository changes without posting to Azure DevOps:

```bash
export OPENAI_API_KEY="your-openai-api-key"
npx ts-node ai-reviewer.ts
```

*Note: If Azure DevOps environment variables are not detected, the script operates in **DRY-RUN** mode and prints review feedback directly to the console.*

---

## 2. Azure DevOps Pipeline Secrets Configuration

To pass secrets securely to your pipeline script, configure secret variables in Azure DevOps:

### Option A: Direct Pipeline Variables
1. Open Azure DevOps and navigate to **Pipelines** -> Select your pipeline -> Click **Edit**.
2. Click the **Variables** button in the top right corner.
3. Click **+ Add Variable**.
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-...` (your OpenAI API key)
   - Check **"Keep this value secret"** (lock icon).
4. (Optional for Azure OpenAI):
   - Add `AZURE_OPENAI_ENDPOINT` (e.g., `https://my-resource.openai.azure.com/`)
   - Add `AZURE_OPENAI_API_KEY` (secret)
   - Add `AZURE_OPENAI_DEPLOYMENT` (e.g., `gpt-4o`)
5. Click **Save**.

### Option B: Variable Group (Recommended for Multi-Pipeline Use)
1. Go to **Pipelines** -> **Library** -> **+ Variable Group**.
2. Name the group `AI-Reviewer-Secrets`.
3. Add variable `OPENAI_API_KEY` and lock it as secret.
4. Save and link the variable group in `azure-pipelines.yml`:
   ```yaml
   variables:
     - group: AI-Reviewer-Secrets
   ```

---

## 3. Granting ADO Build Service Permissions

> [!IMPORTANT]
> By default, the Azure DevOps Build Service account does not have permission to post comments on Pull Requests. You **MUST** grant **"Contribute to pull requests"** permission to avoid HTTP 403 Forbidden errors when creating comment threads.

### Step-by-Step Permission Setup Guide

1. Go to your Azure DevOps Organization and open your **Project**.
2. Click on **Project Settings** (gear icon in the bottom left sidebar).
3. Under **Repositories**, click on **Repositories**.
4. Select the specific Git Repository where the AI reviewer will run (or select **All Repositories** for org-wide access).
5. Open the **Security** tab.
6. Under **Users**, locate the Build Service identity for your project:
   - For Project-level scope: `<Project Name> Build Service (<Organization Name>)`
   - For Collection-level scope: `Project Collection Build Service (<Organization Name>)`
7. Click on the Build Service user.
8. Locate the **"Contribute to pull requests"** permission in the list.
9. Change the access value from *Not Set* / *Deny* to **Allow**.
10. Verify that **"Read"** permission is also set to **Allow**.
11. Click **Save Changes**.

---

## 4. Customizing Framework & Coding Standards

You can enforce team-specific coding rules (e.g., React, Angular, Express, TypeScript guidelines) by updating `CODING_STANDARDS.md` in the root of your repository:

```markdown
# Custom Coding Rules
- Do not use `console.log` in production.
- Ensure all API endpoints validate request params with `zod`.
- React components must use named exports, not default exports.
```

The `ai-reviewer.ts` script automatically detects `CODING_STANDARDS.md` and appends its contents into the LLM system prompt.

---

## 5. Verification & Testing Checklist

- [x] Node 20.x TS compilation check: `npm run build`
- [x] Package manifest & lockfile: `package.json`, `package-lock.json`
- [x] `azure-pipelines.yml` syntax validated for Azure DevOps
- [x] Inline thread comment creation using `azure-devops-node-api`
- [x] Dry-run testing completed
