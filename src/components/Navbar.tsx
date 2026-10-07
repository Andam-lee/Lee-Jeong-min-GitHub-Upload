import React, { useState } from 'react';
import { GitHubUser, GitHubConfig } from '../types';
import { 
  Github, 
  Settings, 
  HelpCircle, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  ChevronRight
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isConfigured = Boolean(config.token && config.owner && config.repo);

  const handleMobileAction = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-900/90 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Github className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent truncate leading-tight">
              Lee Jeong-min
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 tracking-tight truncate leading-tight">
              Github 사진 자동 업로드 &amp; Permalink 생성기
            </p>
          </div>
        </div>

        {/* Desktop Controls (md 이상에서만 표시) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status badge */}
          {isConfigured && user ? (
            <div 
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer text-xs text-slate-300"
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

          {/* 1. 도움말 (토큰 가이드) */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="토큰 발급 30초 가이드"
          >
            <HelpCircle className="w-4 h-4 text-teal-400" />
            <span>도움말</span>
          </button>

          {/* 2. 이력 (업로드 기록) */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors relative"
            title="업로드 기록 확인"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>이력</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-teal-500 text-slate-950">
                {historyCount}
              </span>
            )}
          </button>

          {/* 3. 설정 */}
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

        {/* Mobile Hamburger Button (= 모양 버튼) */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          {/* Compact status indicator dot on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
              isMobileMenuOpen
                ? 'bg-slate-800 border-teal-500 text-teal-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            aria-label="메뉴 열기"
            title="메뉴"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-teal-400" />
            ) : (
              <div className="relative">
                <Menu className="w-5 h-5 text-slate-200" />
                {historyCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-slate-900" />
                )}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu (모바일 전용 = 버튼 클릭 시 표시) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
            {/* Connection Status Card */}
            {isConfigured && user ? (
              <div 
                onClick={() => handleMobileAction(onOpenSettings)}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img 
                    src={user.avatar_url} 
                    alt={user.login} 
                    className="w-7 h-7 rounded-full border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {user.login} / <span className="text-teal-400 font-mono">{config.repo}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="font-mono">{config.branch}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">연동 완료</span>
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleMobileAction(onOpenSettings)}
                className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-left text-amber-300"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold">GitHub 리포지토리 설정 필요</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Menu Buttons (도움말, 이력, 설정) */}
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {/* 1. 도움말 (토큰 가이드) */}
              <button
                type="button"
                onClick={() => handleMobileAction(onOpenGuide)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span>도움말 (토큰 발급 가이드)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* 2. 이력 (업로드 기록) */}
              <button
                type="button"
                onClick={() => handleMobileAction(onOpenHistory)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
                    <History className="w-4 h-4" />
                  </div>
                  <span>이력 (업로드 기록)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {historyCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-500 text-slate-950">
                      {historyCount}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </button>

              {/* 3. 설정 */}
              <button
                type="button"
                onClick={() => handleMobileAction(onOpenSettings)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span>설정 (GitHub 리포지토리/토큰)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
