import React from 'react';
import { GitHubUser, GitHubConfig } from '../types';
import { 
  Github, 
  Settings, 
  HelpCircle, 
  History, 
  CheckCircle2, 
  AlertCircle,
  FolderGit2,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  config: GitHubConfig;
  user: GitHubUser | null;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  user,
  onOpenSettings,
  onOpenGuide,
  onOpenHistory,
  historyCount,
}) => {
  const isConfigured = Boolean(config.token && config.owner && config.repo);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Github className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent truncate">
                Lee Jeong-min
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight truncate">
              Github 사진 자동 업로드 & Permalink 생성기
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status badge */}
          {isConfigured && user ? (
            <div 
              onClick={onOpenSettings}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer text-xs text-slate-300"
              title="GitHub 연결 설정 변경"
            >
              <img 
                src={user.avatar_url} 
                alt={user.login} 
                className="w-5 h-5 rounded-full border border-slate-600"
              />
              <span className="font-medium text-slate-200">{user.login}</span>
              <span className="text-slate-500">/</span>
              <span className="text-teal-400 font-mono font-medium">{config.repo}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                {config.branch}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
            </div>
          ) : (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>GitHub 설정 필요</span>
            </button>
          )}

          {/* Guide button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="토큰 발급 30초 가이드"
          >
            <HelpCircle className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">토큰 가이드</span>
          </button>

          {/* History button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors relative"
            title="업로드 기록 확인"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">업로드 기록</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-teal-500 text-slate-950">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${
              !isConfigured
                ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-teal-500/20'
                : 'text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>설정</span>
          </button>
        </div>
      </div>
    </header>
  );
};
