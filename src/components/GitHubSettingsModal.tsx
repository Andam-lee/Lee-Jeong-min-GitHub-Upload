import React, { useState, useEffect } from 'react';
import { GitHubConfig, GitHubRepo, GitHubUser } from '../types';
import { 
  verifyGitHubToken, 
  getRepositories, 
  getRepoBranches 
} from '../services/github';
import { 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FolderGit2, 
  GitBranch, 
  Folder, 
  Save, 
  Trash2, 
  HelpCircle,
  ExternalLink,
  Lock,
  Globe
} from 'lucide-react';

interface GitHubSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GitHubConfig;
  onSaveConfig: (newConfig: GitHubConfig, user: GitHubUser | null) => void;
  currentUser: GitHubUser | null;
  onOpenGuide: () => void;
}

export const GitHubSettingsModal: React.FC<GitHubSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  currentUser,
  onOpenGuide,
}) => {
  const [token, setToken] = useState(config.token);
  const [showToken, setShowToken] = useState(false);
  const [owner, setOwner] = useState(config.owner);
  const [repo, setRepo] = useState(config.repo);
  const [branch, setBranch] = useState(config.branch || 'main');
  const [pathPrefix, setPathPrefix] = useState(config.pathPrefix || 'portfolio/');
  const [autoTimestamp, setAutoTimestamp] = useState(config.autoTimestamp ?? true);
  const [isRemembered, setIsRemembered] = useState(config.isRemembered ?? true);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(currentUser);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [repoSearch, setRepoSearch] = useState('');

  // Sync state when config changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setToken(config.token);
      setOwner(config.owner);
      setRepo(config.repo);
      setBranch(config.branch || 'main');
      setPathPrefix(config.pathPrefix || 'portfolio/');
      setAutoTimestamp(config.autoTimestamp ?? true);
      setIsRemembered(config.isRemembered ?? true);
      setUser(currentUser);
      setVerifyError(null);

      if (config.token && !repos.length) {
        handleVerify(config.token, false);
      }
    }
  }, [isOpen, config, currentUser]);

  // Load branches when repo changes
  useEffect(() => {
    if (token && owner && repo) {
      getRepoBranches(token, owner, repo).then((b) => {
        setBranches(b);
        if (!b.includes(branch) && b.length > 0) {
          // If current branch not in list, fallback to first (or keep main)
          if (b.includes('main')) setBranch('main');
          else if (b.includes('master')) setBranch('master');
          else setBranch(b[0]);
        }
      });
    }
  }, [owner, repo]);

  const handleVerify = async (tokenToVerify?: string, showSuccessAlert = true) => {
    const activeToken = tokenToVerify ?? token;
    if (!activeToken.trim()) {
      setVerifyError('GitHub 토큰을 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const verifiedUser = await verifyGitHubToken(activeToken);
      setUser(verifiedUser);
      setOwner(verifiedUser.login);

      const repoList = await getRepositories(activeToken);
      setRepos(repoList);

      if (!repo && repoList.length > 0) {
        setRepo(repoList[0].name);
        setBranch(repoList[0].default_branch || 'main');
      }
    } catch (err: any) {
      setVerifyError(err.message || '인증에 실패했습니다.');
      setUser(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    if (!token.trim()) {
      setVerifyError('GitHub 토큰을 입력해주세요.');
      return;
    }
    if (!owner.trim()) {
      setVerifyError('저장소 소유자(Owner)를 입력해주세요.');
      return;
    }
    if (!repo.trim()) {
      setVerifyError('저장소(Repository) 이름을 입력하거나 선택해주세요.');
      return;
    }

    const newConfig: GitHubConfig = {
      token: token.trim(),
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
      pathPrefix: pathPrefix.trim().replace(/^\/+|\/+$/g, '') + '/',
      autoTimestamp,
      commitMessage: 'Add photo via GitPic',
      isRemembered,
    };

    onSaveConfig(newConfig, user);
    onClose();
  };

  const handleClear = () => {
    if (confirm('저장된 GitHub 설정 정보를 초기화하시겠습니까?')) {
      const emptyConfig: GitHubConfig = {
        token: '',
        owner: '',
        repo: '',
        branch: 'main',
        pathPrefix: 'portfolio/',
        autoTimestamp: true,
        commitMessage: 'Add photo via GitPic',
        isRemembered: false,
      };
      setToken('');
      setOwner('');
      setRepo('');
      setUser(null);
      setRepos([]);
      onSaveConfig(emptyConfig, null);
      onClose();
    }
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">GitHub 리포지토리 연동 설정</h3>
              <p className="text-xs text-slate-400">사진이 저장될 대상 리포지토리 및 저장 경로를 설정합니다.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Token Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-teal-400" />
                <span>GitHub 개인 액세스 토큰 (PAT)</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={onOpenGuide}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>토큰 발급 방법 (1분)</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx 또는 github_pat_..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isVerifying || !token.trim()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>확인 중...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>연결 확인</span>
                  </>
                )}
              </button>
            </div>

            {verifyError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{verifyError}</span>
              </div>
            )}

            {user && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="w-7 h-7 rounded-full border border-emerald-500/30"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{user.name || user.login}</span>
                      <span className="text-[11px] text-slate-400 font-normal">(@{user.login})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      토큰 인증 완료 (공개 저장소 {user.public_repos}개)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Repository Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-teal-400" />
              <span>대상 리포지토리 (Repository)</span>
              <span className="text-rose-400">*</span>
            </label>

            {repos.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={repo}
                  onChange={(e) => {
                    const selected = repos.find((r) => r.name === e.target.value);
                    setRepo(e.target.value);
                    if (selected?.default_branch) {
                      setBranch(selected.default_branch);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value="" disabled>저장소를 선택하세요</option>
                  {repos.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.private ? '🔒 [Private] ' : '🌐 [Public] '} {r.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  {repos.length}개의 리포지토리가 검색되었습니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="소유자 (Owner)"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="저장소명 (Repo name)"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Branch & Path */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Branch */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-teal-400" />
                <span>브랜치 (Branch)</span>
              </label>
              {branches.length > 0 ? (
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              )}
            </div>

            {/* Folder Path */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-teal-400" />
                <span>저장 폴더 (Folder Path)</span>
              </label>
              <input
                type="text"
                value={pathPrefix}
                onChange={(e) => setPathPrefix(e.target.value)}
                placeholder="portfolio/ 또는 images/"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Quick presets for path */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-slate-400 mr-1">추천 경로:</span>
            {['portfolio/', 'images/', 'assets/photos/', 'uploads/'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPathPrefix(preset)}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                  pathPrefix === preset
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-semibold'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Additional Options */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoTimestamp}
                onChange={(e) => setAutoTimestamp(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-950 border-slate-700"
              />
              <span className="text-xs text-slate-300">
                파일명에 타임스탬프 자동 추가 (<code className="text-teal-300">파일명_YYYYMMDD_HHMMSS.jpg</code>)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRemembered}
                onChange={(e) => setIsRemembered(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 bg-slate-950 border-slate-700"
              />
              <span className="text-xs text-slate-300">
                이 브라우저에 설정 기억하기 (다음 방문 시 자동 연결)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
          {config.token ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>설정 초기화</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>설정 저장하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
