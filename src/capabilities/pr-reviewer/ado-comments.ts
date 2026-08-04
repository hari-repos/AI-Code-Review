import * as azdev from 'azure-devops-node-api';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import { CodeReviewComment } from './types';
import { Logger } from '../../utils/logger';

/**
 * Posts active inline comment threads to Azure DevOps Pull Requests.
 */
export async function postCommentsToAzureDevOps(comments: CodeReviewComment[], dryRun?: boolean): Promise<void> {
  const token = process.env.SYSTEM_ACCESSTOKEN || process.env.AZURE_DEVOPS_PAT;
  const collectionUri = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI || process.env.SYSTEM_COLLECTIONURI;
  const project = process.env.SYSTEM_TEAMPROJECT;
  const repositoryId = process.env.BUILD_REPOSITORY_ID;
  const pullRequestIdStr = process.env.SYSTEM_PULLREQUEST_PULLREQUESTID;

  if (dryRun || !token || !collectionUri || !project || !repositoryId || !pullRequestIdStr) {
    Logger.info('Azure DevOps environment variables missing or dryRun requested. Operating in DRY-RUN mode.');
    Logger.info('--- AI Review Feedback Summary ---');
    if (comments.length === 0) {
      Logger.info('  -> Clean diff! No issues detected.');
    } else {
      comments.forEach((item, idx) => {
        Logger.info(`  [${idx + 1}] File: ${item.fileName}:${item.lineNumber}`);
        Logger.info(`      Feedback: ${item.comment}`);
      });
    }
    return;
  }

  const pullRequestId = parseInt(pullRequestIdStr, 10);
  if (isNaN(pullRequestId)) {
    throw new Error(`Invalid SYSTEM_PULLREQUEST_PULLREQUESTID: ${pullRequestIdStr}`);
  }

  Logger.info(`Authenticating with Azure DevOps API at ${collectionUri}...`);
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(collectionUri, authHandler);
  const gitApi = await connection.getGitApi();

  Logger.info(`Posting ${comments.length} inline thread comments to PR #${pullRequestId}...`);

  for (const item of comments) {
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
      Logger.info(`  ✓ Posted comment on ${formattedFilePath}:${item.lineNumber} (Thread ID: ${createdThread.id})`);
    } catch (err) {
      Logger.error(`  ✗ Failed to post comment on ${formattedFilePath}:${item.lineNumber}:`, (err as Error).message);
    }
  }

  Logger.info('Completed posting feedback to Azure DevOps PR.');
}
