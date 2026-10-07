import { GitHubRepo, GitHubUser, UploadResult } from '../types';

const GITHUB_API_URL = 'https://api.github.com';

function getHeaders(token: string) {
  const cleanToken = token.trim();
  return {
    Authorization: cleanToken.startsWith('github_pat_') || cleanToken.startsWith('ghp_') 
      ? `Bearer ${cleanToken}` 
      : `token ${cleanToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/**
 * Verify GitHub Personal Access Token and return user profile
 */
export async function verifyGitHubToken(token: string): Promise<GitHubUser> {
  if (!token.trim()) {
    throw new Error('GitHub 토큰을 입력해주세요.');
  }

  const response = await fetch(`${GITHUB_API_URL}/user`, {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('유효하지 않은 GitHub 토큰입니다. 올바른 토큰인지 확인해주세요.');
    }
    if (response.status === 403) {
      throw new Error('GitHub API 호출 한도 초과이거나 토큰 권한(repo)이 부족합니다.');
    }
    const errData = await response.json().catch(() => null);
    throw new Error(errData?.message || `GitHub 인증 실패 (${response.status})`);
  }

  const data = await response.json();
  return {
    login: data.login,
    avatar_url: data.avatar_url,
    name: data.name || data.login,
    html_url: data.html_url,
    public_repos: data.public_repos || 0,
  };
}

/**
 * Get list of user's repositories
 */
export async function getRepositories(token: string): Promise<GitHubRepo[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator`,
    {
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(`저장소 목록 조회 실패 (${response.status})`);
  }

  const list = await response.json();
  return list.map((r: any) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    default_branch: r.default_branch || 'main',
    description: r.description,
  }));
}

/**
 * Get list of branches for a given repository
 */
export async function getRepoBranches(
  token: string,
  owner: string,
  repo: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/branches?per_page=100`,
      {
        headers: getHeaders(token),
      }
    );

    if (!response.ok) {
      return ['main', 'master'];
    }

    const branches = await response.json();
    return branches.map((b: any) => b.name);
  } catch {
    return ['main', 'master'];
  }
}

export interface UploadOptions {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  contentBase64: string;
  commitMessage?: string;
  authorName?: string;
}

/**
 * Upload an image file to GitHub via Contents API
 */
export async function uploadFileToGitHub(options: UploadOptions): Promise<UploadResult> {
  const { token, owner, repo, branch, path, contentBase64, commitMessage } = options;

  // Clean path (remove leading/trailing slashes, normalize double slashes)
  const normalizedPath = path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
  const encodedPath = normalizedPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  // 1. Check if the file already exists in repo to get SHA if overwriting
  let existingSha: string | undefined;
  try {
    const checkRes = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
      {
        headers: getHeaders(token),
      }
    );

    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (checkData.sha) {
        existingSha = checkData.sha;
      }
    }
  } catch (e) {
    console.warn('Could not check existing file SHA:', e);
  }

  // 2. Put file to repository
  const fileName = normalizedPath.split('/').pop() || 'photo';
  const message = commitMessage || `Add photo: ${fileName} via GitPic`;

  const payload: any = {
    message,
    content: contentBase64,
    branch,
  };

  if (existingSha) {
    payload.sha = existingSha;
  }

  const putRes = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${encodedPath}`,
    {
      method: 'PUT',
      headers: {
        ...getHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!putRes.ok) {
    const errData = await putRes.json().catch(() => null);
    if (putRes.status === 404) {
      throw new Error(`저장소(${owner}/${repo}) 또는 브랜치(${branch})를 찾을 수 없습니다. 경로와 권한을 확인해주세요.`);
    }
    if (putRes.status === 409) {
      throw new Error('파일 충돌이 발생했습니다. 파일명을 변경하거나 다시 시도해주세요.');
    }
    if (putRes.status === 422) {
      throw new Error(errData?.message || '저장소 권한 부족 또는 잘못된 요청입니다.');
    }
    throw new Error(errData?.message || `GitHub 업로드 실패 (${putRes.status})`);
  }

  const resultData = await putRes.json();
  const sha = resultData.content?.sha || '';

  // Generate permalinks
  // Raw URL (GitHub rawusercontent)
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${normalizedPath}`;
  // jsDelivr CDN URL (High speed CDN for websites and portfolios)
  const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${normalizedPath}`;
  // GitHub Web Blob URL
  const htmlUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${normalizedPath}`;
  // GitHub Pages URL (if applicable)
  const pagesUrl = `https://${owner.toLowerCase()}.github.io/${repo}/${normalizedPath}`;

  const altText = fileName.replace(/\.[^/.]+$/, '');
  const markdownSnippet = `![${altText}](${rawUrl})`;
  const htmlSnippet = `<img src="${cdnUrl}" alt="${altText}" loading="lazy" />`;

  return {
    path: normalizedPath,
    sha,
    rawUrl,
    cdnUrl,
    htmlUrl,
    pagesUrl,
    markdownSnippet,
    htmlSnippet,
    uploadedAt: new Date().toISOString(),
  };
}
