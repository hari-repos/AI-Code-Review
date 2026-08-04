import { OpenAIClientConfig } from '../../client/types';

export interface CodeReviewComment {
  fileName: string;
  lineNumber: number;
  comment: string;
}

export interface ReviewResult {
  reviews: CodeReviewComment[];
}

export interface PRReviewOptions {
  customStandardsPath?: string;
  targetBranch?: string;
  clientConfig?: OpenAIClientConfig;
  dryRun?: boolean;
}
