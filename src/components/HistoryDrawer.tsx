import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { 
  X, 
  History, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  FolderGit2, 
  Sparkles,
  ImageIcon
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter(
    (item) =>
      item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetPath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.repo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">업로드 기록</h3>
              <p className="text-[11px] text-slate-400">총 {history.length}개의 사진</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('모든 업로드 기록을 삭제하시겠습니까? (GitHub의 실제 파일은 삭제되지 않습니다)')) {
                    onClearHistory();
                  }
                }}
                className="text-[11px] text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="전체 기록 삭제"
              >
                전체 삭제
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        {history.length > 0 && (
          <div className="p-3 border-b border-slate-800 bg-slate-900/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="파일명, 저장소 또는 경로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-xs">아직 업로드된 사진 기록이 없습니다.</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2 hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-xs text-white truncate" title={item.fileName}>
                        {item.fileName}
                      </h5>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        item.mode === 'portfolio'
                          ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.mode === 'portfolio' ? '2000px' : '원본'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono">{item.owner}/{item.repo}</span>
                      <span>•</span>
                      <span>{formatBytes(item.fileSize)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="기록에서 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Permalink Copy Box */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <input
                    type="text"
                    readOnly
                    value={item.result.cdnUrl}
                    className="bg-transparent text-[10px] text-slate-300 font-mono focus:outline-none flex-1 truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(item.result.cdnUrl, item.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                      copiedId === item.id
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950'
                    }`}
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === item.id ? '완료' : '복사'}</span>
                  </button>
                </div>

                {/* Bottom link */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>{new Date(item.uploadedAt).toLocaleString()}</span>
                  <a
                    href={item.result.cdnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 hover:text-teal-300 flex items-center gap-1 hover:underline"
                  >
                    <span>새 탭 보기</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
