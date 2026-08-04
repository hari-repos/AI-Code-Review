import simpleGit, { SimpleGit } from 'simple-git';
import { Logger } from '../../utils/logger';

/**
 * Extracts git diff for PR changed files using simple-git.
 */
export async function getGitDiff(targetBranchOverride?: string): Promise<string> {
  const git: SimpleGit = simpleGit();

  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    Logger.warn('Current working directory is not a Git repository. Cannot extract git diff.');
    return '';
  }

  const rawTargetBranch = targetBranchOverride || process.env.SYSTEM_PULLREQUEST_TARGETBRANCH || 'main';
  const targetBranch = rawTargetBranch.replace(/^refs\/heads\//, 'origin/');

  Logger.info(`Target branch for diff extraction: ${targetBranch}`);

  try {
    await git.fetch('origin', rawTargetBranch.replace(/^refs\/heads\//, ''));
  } catch (err) {
    Logger.warn(`Fetch warning (proceeding with local refs):`, (err as Error).message);
  }

  // 1. Try diffing against PR target branch
  try {
    const diff = await git.diff([`${targetBranch}...HEAD`]);
    if (diff && diff.trim().length > 0) {
      return diff;
    }
  } catch (err) {
    Logger.warn(`Diff against ${targetBranch}...HEAD failed:`, (err as Error).message);
  }

  // 2. Try diffing working directory / staged changes against HEAD
  try {
    const diff = await git.diff(['HEAD']);
    if (diff && diff.trim().length > 0) {
      return diff;
    }
  } catch (err) {
    Logger.warn(`Local HEAD diff failed:`, (err as Error).message);
  }

  // 3. Fallback to HEAD~1...HEAD
  try {
    const diff = await git.diff(['HEAD~1', 'HEAD']);
    if (diff && diff.trim().length > 0) {
      return diff;
    }
  } catch (err) {
    Logger.warn(`HEAD~1...HEAD diff failed:`, (err as Error).message);
  }

  return '';
}
