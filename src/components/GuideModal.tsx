import React from 'react';
import { 
  X, 
  Key, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck, 
  Copy, 
  ArrowRight,
  FolderLock
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseDirectLink: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const directTokenUrl = 'https://github.com/settings/tokens/new?description=GitPic%20Image%20Uploader&scopes=repo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">GitHub 토큰(PAT) 발급 가이드</h3>
              <p className="text-xs text-slate-400">1분 안에 토큰을 발급받아 리포지토리에 사진을 업로드하세요.</p>
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Quick Action Button */}
          <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent border border-teal-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-teal-300">원클릭 토큰 생성 링크</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium">추천</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                아래 버튼을 누르면 <strong className="text-white">repo 권한이 자동 체크된 페이지</strong>로 바로 이동합니다.
              </p>
            </div>
            <a
              href={directTokenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 transition-colors shadow-md shadow-teal-500/20"
            >
              <span>GitHub 토큰 생성창 열기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">단계별 상세 안내</h4>
            
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <p className="font-medium text-white mb-0.5">GitHub 로그인 및 토큰 발급 페이지 이동</p>
                GitHub 계정으로 로그인한 상태에서 상단 <span className="text-teal-300">원클릭 링크</span>를 누르거나, <br />
                우측 프로필 ➔ <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">Settings</code> ➔ <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">Developer settings</code> ➔ <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">Personal access tokens (classic)</code> 로 이동합니다.
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <p className="font-medium text-white mb-0.5">'repo' 권한 체크 확인</p>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium my-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Select scopes에서 'repo' (Full control of private repositories) 체크</span>
                </div>
                사진을 저장소에 커밋(생성)하기 위해 필요한 최소한의 필수 권한입니다.
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <p className="font-medium text-white mb-0.5">하단 'Generate token' 버튼 클릭 & 복사</p>
                녹색 <strong className="text-white">Generate token</strong> 버튼을 누르면 발급된 토큰(<code className="text-teal-300 bg-slate-800 px-1 py-0.5 rounded">ghp_...</code>)이 표시됩니다. 이를 복사하세요.
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-teal-400 shrink-0 mt-0.5">
                4
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                <p className="font-medium text-white mb-0.5">GitPic 설정창에 토큰 붙여넣기</p>
                GitPic 설정창에 토큰을 붙여넣고 <strong className="text-white">'연결 확인'</strong>을 누르면 사용자의 리포지토리 목록이 자동 로딩됩니다.
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">안전한 브라우저 직접 통신:</strong> 입력하신 토큰은 외부 서버로 전송되지 않으며, 사용자 브라우저에서 GitHub 공식 API(<code className="text-slate-300">api.github.com</code>)로 직접 안전하게 통신합니다. 원하시면 언제든 토큰을 초기화할 수 있습니다.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
