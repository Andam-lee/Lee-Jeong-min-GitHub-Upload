export type UploadMode = 'portfolio' | 'original';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  pathPrefix: string;
  autoTimestamp: boolean;
  commitMessage: string;
  isRemembered: boolean;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  html_url: string;
  public_repos: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  description: string | null;
}

export interface UploadResult {
  path: string;
  sha: string;
  rawUrl: string;
  cdnUrl: string;
  htmlUrl: string;
  pagesUrl?: string;
  markdownSnippet: string;
  htmlSnippet: string;
  uploadedAt: string;
}

export interface PhotoItem {
  id: string;
  file: File;
  name: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  previewUrl: string;
  mode: UploadMode;
  targetWidth?: number;
  targetHeight?: number;
  processedBlob?: Blob;
  processedSize?: number;
  targetPath?: string;
  status: 'idle' | 'processing' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
  result?: UploadResult;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  targetPath: string;
  mode: UploadMode;
  repo: string;
  branch: string;
  owner: string;
  fileSize: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  result: UploadResult;
}
