import React, { useState } from 'react';
import { PhotoItem, UploadMode } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { 
  Sparkles, 
  ImageIcon, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  FileText,
  Maximize2
} from 'lucide-react';

interface PhotoCardProps {
  photo: PhotoItem;
  onRemove: (id: string) => void;
  onToggleMode: (id: string, newMode: UploadMode) => void;
  onUpdateName?: (id: string, newName: string) => void;
  onViewImage?: (photo: PhotoItem) => void;
  disabled?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onRemove,
  onToggleMode,
  onUpdateName,
  onViewImage,
  disabled = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeUrlTab, setActiveUrlTab] = useState<'raw' | 'cdn' | 'markdown' | 'html'>('cdn');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const isResized =
    photo.mode === 'portfolio' &&
    photo.targetWidth &&
    photo.targetHeight &&
    (photo.targetWidth !== photo.originalWidth || photo.targetHeight !== photo.originalHeight);

  const savingsPercent =
    photo.processedSize && photo.originalSize > 0
      ? Math.round(((photo.originalSize - photo.processedSize) / photo.originalSize) * 100)
      : null;

  return (
    <div className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200 shadow-md ${
      photo.status === 'success'
        ? 'border-emerald-500/40 bg-slate-900/90 shadow-emerald-500/5'
        : photo.status === 'error'
        ? 'border-rose-500/50 bg-rose-950/10'
        : photo.status === 'uploading' || photo.status === 'processing'
        ? 'border-teal-500/60 ring-1 ring-teal-500/30'
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top Bar / Content */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row gap-3.5 items-start">
        {/* Thumbnail */}
        <div 
          onClick={() => onViewImage && onViewImage(photo)}
          className="relative w-full sm:w-28 h-36 sm:h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 group cursor-pointer"
        >
          <img
            src={photo.previewUrl}
            alt={photo.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Maximize2 className="w-5 h-5 text-white drop-shadow" />
          </div>
          {/* Status Overlay Badge */}
          {photo.status === 'success' && (
            <div className="absolute bottom-1.5 right-1.5 bg-emerald-500 text-slate-950 p-1 rounded-md shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Info & Options */}
        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          {/* Header row: Name & Remove */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 
                  className="font-bold text-sm text-white truncate max-w-[260px] sm:max-w-[320px]"
                  title={photo.name}
                >
                  {photo.name}
                </h4>
                {/* Mode Pill */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                  photo.mode === 'portfolio'
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {photo.mode === 'portfolio' ? (
                    <>
                      <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                      포트폴리오 (2000px)
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-2.5 h-2.5 text-slate-400" />
                      원본
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Remove button (only when not actively uploading) */}
            {photo.status !== 'uploading' && (
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                disabled={disabled}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="목록에서 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Resolution & Size Specs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Dimensions */}
            <div className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1 font-mono text-[11px]">
              <span className="text-slate-500">원본:</span>
              <span>{photo.originalWidth} × {photo.originalHeight}</span>
              <span className="text-slate-500">({formatBytes(photo.originalSize)})</span>
            </div>

            {/* Converted specs if portfolio mode */}
            {photo.mode === 'portfolio' && (
              <div className="px-2 py-1 rounded-md bg-teal-950/40 border border-teal-500/30 text-teal-300 flex items-center gap-1 font-mono text-[11px]">
                <span className="text-teal-400 font-semibold">리사이즈:</span>
                <span>
                  {photo.targetWidth || (photo.originalWidth > 2000 ? 2000 : photo.originalWidth)} ×{' '}
                  {photo.targetHeight || (photo.originalWidth > 2000 ? Math.round(photo.originalHeight * (2000 / photo.originalWidth)) : photo.originalHeight)}
                </span>
                {photo.processedSize && (
                  <>
                    <span className="text-slate-400 font-sans">➔</span>
                    <span className="font-semibold text-emerald-400">{formatBytes(photo.processedSize)}</span>
                    {savingsPercent && savingsPercent > 0 && (
                      <span className="text-[10px] text-emerald-400 font-sans bg-emerald-500/20 px-1 rounded">
                        -{savingsPercent}%
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Status feedback & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            {/* Mode Switcher buttons */}
            {photo.status !== 'success' && photo.status !== 'uploading' ? (
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => onToggleMode(photo.id, 'portfolio')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    photo.mode === 'portfolio'
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  포트폴리오 (2000px)
                </button>
                <button
                  type="button"
                  onClick={() => onToggleMode(photo.id, 'original')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    photo.mode === 'original'
                      ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  원본 사진
                </button>
              </div>
            ) : null}

            {/* Status indicator */}
            <div className="text-xs ml-auto">
              {photo.status === 'idle' && (
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  업로드 대기
                </span>
              )}
              {photo.status === 'processing' && (
                <span className="text-teal-400 flex items-center gap-1.5 text-[11px] font-medium animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  이미지 2000px 리사이즈 중...
                </span>
              )}
              {photo.status === 'uploading' && (
                <span className="text-teal-300 flex items-center gap-1.5 text-[11px] font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                  GitHub에 커밋 중...
                </span>
              )}
              {photo.status === 'success' && (
                <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  업로드 완료
                </span>
              )}
              {photo.status === 'error' && (
                <span className="text-rose-400 flex items-center gap-1.5 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {photo.errorMessage || '업로드 실패'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permalink Section (When upload is successful) - 요구사항: 업로드 완료 시 Permalink 화면에 표시 */}
      {photo.status === 'success' && photo.result && (
        <div className="p-3.5 bg-slate-950/90 border-t border-emerald-500/20 space-y-2.5">
          {/* Format selector tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveUrlTab('cdn')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeUrlTab === 'cdn'
                    ? 'bg-teal-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="jsDelivr CDN 링크 (웹/포트폴리오용 고속 CDN)"
              >
                CDN 링크 (권장)
              </button>
              <button
                type="button"
                onClick={() => setActiveUrlTab('raw')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeUrlTab === 'raw'
                    ? 'bg-teal-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="GitHub Raw 원본 URL"
              >
                Raw URL
              </button>
              <button
                type="button"
                onClick={() => setActiveUrlTab('markdown')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeUrlTab === 'markdown'
                    ? 'bg-teal-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="마크다운 태그 ![]()"
              >
                Markdown
              </button>
              <button
                type="button"
                onClick={() => setActiveUrlTab('html')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  activeUrlTab === 'html'
                    ? 'bg-teal-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="HTML <img> 태그"
              >
                HTML 태그
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={photo.result.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-400 hover:text-teal-400 flex items-center gap-1 transition-colors"
                title="GitHub 리포지토리에서 보기"
              >
                <span>GitHub 보기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Active URL Copy Box */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <span className="text-slate-500 shrink-0 font-mono text-xs">🔗</span>
            <input
              type="text"
              readOnly
              value={
                activeUrlTab === 'cdn'
                  ? photo.result.cdnUrl
                  : activeUrlTab === 'raw'
                  ? photo.result.rawUrl
                  : activeUrlTab === 'markdown'
                  ? photo.result.markdownSnippet
                  : photo.result.htmlSnippet
              }
              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none flex-1 truncate select-all"
            />
            <button
              type="button"
              onClick={() => {
                const targetText =
                  activeUrlTab === 'cdn'
                    ? photo.result!.cdnUrl
                    : activeUrlTab === 'raw'
                    ? photo.result!.rawUrl
                    : activeUrlTab === 'markdown'
                    ? photo.result!.markdownSnippet
                    : photo.result!.htmlSnippet;
                copyToClipboard(targetText, `${photo.id}-${activeUrlTab}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                copiedKey === `${photo.id}-${activeUrlTab}`
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/30'
              }`}
            >
              {copiedKey === `${photo.id}-${activeUrlTab}` ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Permalink 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
