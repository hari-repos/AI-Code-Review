import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import OpenAI from 'openai';
import * as azdev from 'azure-devops-node-api';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';

interface CodeReviewComment {
  fileName: string;
  lineNumber: number;
  comment: string;
}

interface ReviewResult {
  reviews: CodeReviewComment[];
}

/**
 * Loads custom coding standards from CODING_STANDARDS.md or env variable if present.
 */
function loadCustomCodingStandards(): string {
  const envStandards = process.env.CUSTOM_CODING_STANDARDS;
  if (envStandards && envStandards.trim().length > 0) {
    return envStandards.trim();
  }

  const standardsFilePath = path.join(process.cwd(), 'CODING_STANDARDS.md');
  if (fs.existsSync(standardsFilePath)) {
    try {
      const content = fs.readFileSync(standardsFilePath, 'utf-8');
      return content.trim();
    } catch (err) {
      console.warn(`[AI Reviewer] Warning: Could not read ${standardsFilePath}:`, err);
    }
  }

  return '';
}

/**
 * Extracts git diff for PR changed files using simple-git.
 */
async function getGitDiff(): Promise<string> {
  const git: SimpleGit = simpleGit();

  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    console.warn('[AI Reviewer] Current directory is not a Git repository. Cannot perform git diff.');
    return '';
  }

  // Determine target branch from Azure DevOps env or default to origin/main
  const rawTargetBranch = process.env.SYSTEM_PULLREQUEST_TARGETBRANCH || 'main';
  const targetBranch = rawTargetBranch.replace(/^refs\/heads\//, 'origin/');

  console.log(`[AI Reviewer] Target branch for diff: ${targetBranch}`);

  try {
    // Attempt fetching target branch to ensure local availability
    await git.fetch('origin', rawTargetBranch.replace(/^refs\/heads\//, ''));
  } catch (err) {
    console.warn(`[AI Reviewer] Fetch warning (proceeding with local refs):`, (err as Error).message);
  }

  // 1. Try diffing against PR target branch
  try {
    const diff = await git.diff([`${targetBranch}...HEAD`]);
    if (diff && diff.trim().length > 0) {
      return diff;
    }
  } catch (err) {
    console.warn(`[AI Reviewer] Diff against ${targetBranch}...HEAD failed:`, (err as Error).message);
  }

  // 2. Try diffing working directory / staged changes
  try {
    const diff = await git.diff();
    if (diff && diff.trim().length > 0) {
      return diff;
    }
  } catch (err) {
    console.warn(`[AI Reviewer] Local diff failed:`, (err as Error).message);
  }

  // 3. Fallback to HEAD~1...HEAD
  try {
    const diff = await git.diff(['HEAD~1', 'HEAD']);
    if (diff && diff.trim().length > 0) {
      return diff;
    }
  } catch (err) {
    console.warn(`[AI Reviewer] HEAD~1...HEAD diff failed:`, (err as Error).message);
  }

  return '';
}

/**
 * Initializes OpenAI client with support for OpenAI standard and Azure OpenAI.
 */
function createOpenAIClient(): { client: OpenAI; model: string } {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Please set OPENAI_API_KEY or AZURE_OPENAI_API_KEY environment variable.');
  }

  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-06-01';

  if (azureEndpoint) {
    console.log(`[AI Reviewer] Configuring Azure OpenAI Client (Endpoint: ${azureEndpoint}, Deployment: ${azureDeployment})`);
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${azureDeployment}`,
      defaultQuery: { 'api-version': apiVersion },
      defaultHeaders: { 'api-key': apiKey }
    });
    return { client, model: azureDeployment };
  } else {
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    const baseURL = process.env.OPENAI_BASE_URL;
    console.log(`[AI Reviewer] Configuring Standard OpenAI Client (Model: ${model}${baseURL ? `, BaseURL: ${baseURL}` : ''})`);
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL || undefined
    });
    return { client, model };
  }
}

/**
 * Sends the git diff to OpenAI to receive structured feedback.
 */
async function analyzeDiffWithAI(diff: string, customStandards: string): Promise<CodeReviewComment[]> {
  const { client, model } = createOpenAIClient();

  let systemPrompt = `You are an expert Lead Platform Engineer and Security Architect conducting an automated Pull Request Code Review.

Your task is to analyze the provided Git Diff and identify:
1. Critical Security Vulnerabilities (OWASP top 10, injection risks, exposed secrets, insecure deserialization, etc.)
2. Bugs and Potential Runtime Failures (null pointers, race conditions, uncaught exceptions, resource leaks)
3. Performance and Clean Code Violations (redundant computations, improper async handling, dead code)
`;

  if (customStandards) {
    systemPrompt += `\n### MANDATORY FRAMEWORK & TEAM CODING STANDARDS ###\nYou MUST enforce the following team coding standards in your review:\n${customStandards}\n`;
  }

  systemPrompt += `\nOUTPUT REQUIREMENTS:
- You MUST return a strictly valid JSON object matching the JSON schema below.
- Do NOT include any intro, outro, or markdown code block formatting outside the JSON object.
- Only flag substantial issues. Do not comment on trivial whitespace or style preference unless it violates explicit standards.
- Calculate exact line numbers as seen in the added/modified lines (+) of the diff.

JSON Schema format:
{
  "reviews": [
    {
      "fileName": "path/to/file.ext",
      "lineNumber": 42,
      "comment": "Concise description of issue and recommended resolution."
    }
  ]
}`;

  console.log(`[AI Reviewer] Sending git diff (${diff.length} bytes) to AI model...`);

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is the Git Diff for review:\n\n${diff}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn('[AI Reviewer] Received empty response from OpenAI.');
      return [];
    }

    const parsed: ReviewResult = JSON.parse(content);
    if (parsed && Array.isArray(parsed.reviews)) {
      return parsed.reviews;
    } else if (Array.isArray(parsed)) {
      return parsed as CodeReviewComment[];
    }

    console.warn('[AI Reviewer] Unexpected JSON structure returned by OpenAI:', content);
    return [];
  } catch (err) {
    console.error('[AI Reviewer] Error communicating with OpenAI API:', err);
    throw err;
  }
}

/**
 * Posts inline thread comments to Azure DevOps Pull Request using azure-devops-node-api.
 */
async function postCommentsToAzureDevOps(comments: CodeReviewComment[]): Promise<void> {
  const token = process.env.SYSTEM_ACCESSTOKEN || process.env.AZURE_DEVOPS_PAT;
  const collectionUri = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI || process.env.SYSTEM_COLLECTIONURI;
  const project = process.env.SYSTEM_TEAMPROJECT;
  const repositoryId = process.env.BUILD_REPOSITORY_ID;
  const pullRequestIdStr = process.env.SYSTEM_PULLREQUEST_PULLREQUESTID;

  if (!token || !collectionUri || !project || !repositoryId || !pullRequestIdStr) {
    console.log('\n[AI Reviewer] Azure DevOps environment variables missing. Operating in DRY-RUN / LOCAL MODE.');
    console.log('[AI Reviewer] AI Review Feedback Summary:');
    if (comments.length === 0) {
      console.log('  -> No issues detected! Clean diff.');
    } else {
      comments.forEach((item, idx) => {
        console.log(`  [${idx + 1}] File: ${item.fileName}:${item.lineNumber}`);
        console.log(`      Comment: ${item.comment}`);
      });
    }
    return;
  }

  const pullRequestId = parseInt(pullRequestIdStr, 10);
  if (isNaN(pullRequestId)) {
    throw new Error(`Invalid SYSTEM_PULLREQUEST_PULLREQUESTID: ${pullRequestIdStr}`);
  }

  console.log(`[AI Reviewer] Authenticating with Azure DevOps API at ${collectionUri}...`);
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(collectionUri, authHandler);
  const gitApi = await connection.getGitApi();

  console.log(`[AI Reviewer] Posting ${comments.length} inline thread comments to PR #${pullRequestId}...`);

  for (const item of comments) {
    // Azure DevOps file paths in threadContext require leading slash
    const formattedFilePath = item.fileName.startsWith('/') ? item.fileName : `/${item.fileName}`;

    const thread: GitInterfaces.GitPullRequestCommentThread = {
      comments: [
        {
          parentCommentId: 0,
          content: `🤖 **AI Code Review Feedback**\n\n${item.comment}`,
          commentType: GitInterfaces.CommentType.Text
        }
      ],
      status: GitInterfaces.CommentThreadStatus.Active,
      threadContext: {
        filePath: formattedFilePath,
        rightFileStart: { line: item.lineNumber, offset: 1 },
        rightFileEnd: { line: item.lineNumber, offset: 1 }
      }
    };

    try {
      const createdThread = await gitApi.createThread(thread, repositoryId, pullRequestId, project);
      console.log(`  ✓ Posted comment on ${formattedFilePath}:${item.lineNumber} (Thread ID: ${createdThread.id})`);
    } catch (err) {
      console.error(`  ✗ Failed to post comment on ${formattedFilePath}:${item.lineNumber}:`, (err as Error).message);
    }
  }

  console.log('[AI Reviewer] Completed posting feedback to Azure DevOps PR.');
}

/**
 * Main Execution Function
 */
async function main() {
  console.log('=====================================================');
  console.log('       Azure DevOps Automated AI Code Reviewer      ');
  console.log('=====================================================');

  try {
    const customStandards = loadCustomCodingStandards();
    if (customStandards) {
      console.log('[AI Reviewer] Loaded custom coding standards.');
    } else {
      console.log('[AI Reviewer] No custom coding standards file found. Using default security/clean code rules.');
    }

    const diff = await getGitDiff();
    if (!diff || diff.trim().length === 0) {
      console.log('[AI Reviewer] Git diff is empty. Skipping review.');
      return;
    }

    console.log(`[AI Reviewer] Extracted Git Diff snippet:\n${diff.substring(0, 300)}...\n`);

    const comments = await analyzeDiffWithAI(diff, customStandards);
    await postCommentsToAzureDevOps(comments);
  } catch (err) {
    console.error('[AI Reviewer] Execution failed:', err);
    process.exit(1);
  }
}

main();
