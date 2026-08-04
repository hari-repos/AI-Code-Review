import { PRReviewOptions, CodeReviewComment, ReviewResult } from './types';
import { getGitDiff } from './git-diff';
import { postCommentsToAzureDevOps } from './ado-comments';
import { loadCustomCodingStandards } from '../../utils/config-loader';
import { executeAICompletion } from '../../client/openai-client';
import { Logger } from '../../utils/logger';

/**
 * Executes Automated PR Code Review capability.
 */
export async function runAIReviewer(options?: PRReviewOptions): Promise<CodeReviewComment[]> {
  Logger.info('=====================================================');
  Logger.info('    @mycompany/ai-capabilities: PR Code Reviewer     ');
  Logger.info('=====================================================');

  const customStandards = loadCustomCodingStandards(options?.customStandardsPath);

  const diff = await getGitDiff(options?.targetBranch);
  if (!diff || diff.trim().length === 0) {
    Logger.info('Git diff is empty. Skipping code review.');
    return [];
  }

  Logger.info(`Extracted Git Diff (${diff.length} bytes). Processing review with AI...`);

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

  const parsed = await executeAICompletion<ReviewResult>({
    systemPrompt,
    userPrompt: `Here is the Git Diff for review:\n\n${diff}`,
    temperature: 0.2,
    config: options?.clientConfig
  });

  const comments = Array.isArray(parsed?.reviews) ? parsed.reviews : [];
  await postCommentsToAzureDevOps(comments, options?.dryRun);
  return comments;
}
