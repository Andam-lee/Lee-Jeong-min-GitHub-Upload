import React, { useState } from 'react';
import { PhotoItem, UploadResult } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  FileText, 
  Code, 
  Sparkles, 
  Globe, 
  Layers, 
  Grid, 
  List, 
  Share2,
  CheckCircle2,
  Download,
  Eye
} from 'lucide-react';

interface BatchPermalinksViewProps {
  photos: PhotoItem[];
  repoName: string;
  branch: string;
  onClearCompleted?: () => void;
  onViewImage?: (photo: PhotoItem) => void;
}

export const BatchPermalinksView: React.FC<BatchPermalinksViewProps> = ({
  photos,
  repoName,
  branch,
  onClearCompleted,
  onViewImage,
}) => {
  const completedPhotos = photos.filter((p) => p.status === 'success' && p.result);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [itemCopiedId, setItemCopiedId] = useState<string | null>(null);
  const [viewFormat, setViewFormat] = useState<'cdn' | 'raw' | 'markdown' | 'html'>('cdn');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  if (completedPhotos.length === 0) return null;

  const handleCopyAll = (type: 'cdn' | 'raw' | 'markdown' | 'html' | 'json') => {
    let text = '';
    if (type === 'cdn') {
      text = completedPhotos.map((p) => p.result!.cdnUrl).join('\n');
    } else if (type === 'raw') {
      text = completedPhotos.map((p) => p.result!.rawUrl).join('\n');
    } else if (type === 'markdown') {
      text = completedPhotos.map((p) => p.result!.markdownSnippet).join('\n');
    } else if (type === 'html') {
      text = completedPhotos.map((p) => p.result!.htmlSnippet).join('\n');
    } else if (type === 'json') {
      const data = completedPhotos.map((p) => ({
        name: p.name,
        path: p.result!.path,
        cdnUrl: p.result!.cdnUrl,
        rawUrl: p.result!.rawUrl,
        htmlUrl: p.result!.htmlUrl,
        width: p.targetWidth || p.originalWidth,
        height: p.targetHeight || p.originalHeight,
        size: p.processedSize || p.originalSize,
        uploadedAt: p.result!.uploadedAt,
      }));
      text = JSON.stringify(data, null, 2);
    }

    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2200);
  };

  const handleCopySingle = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setItemCopiedId(id);
    setTimeout(() => setItemCopiedId(null), 1800);
  };

  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-emerald-950/20 space-y-6">
      {/* Title & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">
              업로드 완료된 사진 & 고유 Permalink ({completedPhotos.length}개)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            GitHub <code className="text-teal-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{repoName} ({branch})</code> 리포지토리에 영구 저장되었습니다.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Clear button */}
          {onClearCompleted && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors"
            >
              완료 목록 정리
            </button>
          )}

          {/* Copy All Dropdown/Group */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleCopyAll('cdn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                copiedType === 'cdn'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
              }`}
              title="포트폴리오에 추천하는 jsDelivr 초고속 CDN 링크 일괄 복사"
            >
              {copiedType === 'cdn' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'cdn' ? '전체 복사됨!' : '전체 CDN 복사'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyAll('markdown')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                copiedType === 'markdown'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Markdown ![]() 태그 일괄 복사"
            >
              {copiedType === 'markdown' ? '마크다운 복사됨' : '마크다운 일괄'}
            </button>

            <button
              type="button"
              onClick={() => handleCopyAll('html')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                copiedType === 'html'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="HTML <img> 태그 일괄 복사"
            >
              {copiedType === 'html' ? 'HTML 복사됨' : 'HTML 일괄'}
            </button>
          </div>
        </div>
      </div>

      {/* View & Format controls */}
      <div className="flex items-center justify-between gap-3 text-xs">
        {/* Format selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] hidden sm:inline">표시할 Permalink 형식:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewFormat('cdn')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewFormat === 'cdn'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              jsDelivr CDN (추천)
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('raw')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewFormat === 'raw'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw URL
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('markdown')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewFormat === 'markdown'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Markdown
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('html')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewFormat === 'html'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              HTML
            </button>
          </div>
        </div>

        {/* Layout switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setLayoutMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              layoutMode === 'grid' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
            title="그리드 보기"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              layoutMode === 'list' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'
            }`}
            title="리스트 보기"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Photos Showcase */}
      {layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedPhotos.map((photo) => {
            const urlText =
              viewFormat === 'cdn'
                ? photo.result!.cdnUrl
                : viewFormat === 'raw'
                ? photo.result!.rawUrl
                : viewFormat === 'markdown'
                ? photo.result!.markdownSnippet
                : photo.result!.htmlSnippet;

            return (
              <div
                key={photo.id}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group"
              >
                {/* Image Preview */}
                <div 
                  onClick={() => onViewImage && onViewImage(photo)}
                  className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer"
                >
                  <img
                    src={photo.previewUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/5 transition-colors" />
                  
                  {/* Mode badge */}
                  <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm text-teal-300 border border-teal-500/30">
                    {photo.mode === 'portfolio' ? '장축 2000px' : '원본'}
                  </span>

                  {/* Resolution pill */}
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-slate-300">
                    {photo.targetWidth || photo.originalWidth} × {photo.targetHeight || photo.originalHeight}
                  </span>

                  {/* Size pill */}
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-emerald-400 font-semibold">
                    {formatBytes(photo.processedSize || photo.originalSize)}
                  </span>
                </div>

                {/* Details & Copy */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-white truncate" title={photo.name}>
                      {photo.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5" title={photo.result!.path}>
                      📁 {photo.result!.path}
                    </p>
                  </div>

                  {/* URL copy box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
                      <input
                        type="text"
                        readOnly
                        value={urlText}
                        className="bg-transparent text-[11px] text-slate-300 font-mono focus:outline-none flex-1 truncate select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopySingle(urlText, `${photo.id}-${viewFormat}`)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                          itemCopiedId === `${photo.id}-${viewFormat}`
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950'
                        }`}
                      >
                        {itemCopiedId === `${photo.id}-${viewFormat}` ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>완료</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>복사</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <a
                        href={photo.result!.cdnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 flex items-center gap-1 hover:underline"
                      >
                        <span>새 탭에서 사진 보기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={photo.result!.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-2.5">
          {completedPhotos.map((photo) => {
            const urlText =
              viewFormat === 'cdn'
                ? photo.result!.cdnUrl
                : viewFormat === 'raw'
                ? photo.result!.rawUrl
                : viewFormat === 'markdown'
                ? photo.result!.markdownSnippet
                : photo.result!.htmlSnippet;

            return (
              <div
                key={photo.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 hover:border-slate-700 transition-colors"
              >
                {/* Mini Thumb */}
                <div 
                  onClick={() => onViewImage && onViewImage(photo)}
                  className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 cursor-pointer"
                >
                  <img src={photo.previewUrl} alt={photo.name} className="w-full h-full object-cover" />
                </div>

                {/* Name & specs */}
                <div className="min-w-0 sm:w-48 shrink-0 text-center sm:text-left">
                  <h5 className="font-bold text-xs text-white truncate" title={photo.name}>
                    {photo.name}
                  </h5>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{photo.targetWidth || photo.originalWidth}×{photo.targetHeight || photo.originalHeight}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{formatBytes(photo.processedSize || photo.originalSize)}</span>
                  </div>
                </div>

                {/* URL Input */}
                <div className="flex-1 min-w-0 w-full flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
                  <input
                    type="text"
                    readOnly
                    value={urlText}
                    className="bg-transparent text-xs text-slate-300 font-mono focus:outline-none flex-1 truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopySingle(urlText, `${photo.id}-${viewFormat}`)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                      itemCopiedId === `${photo.id}-${viewFormat}`
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950'
                    }`}
                  >
                    {itemCopiedId === `${photo.id}-${viewFormat}` ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>복사</span>
                      </>
                    )}
                  </button>
                </div>

                {/* External links */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={photo.result!.cdnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-teal-300 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                    title="새 탭에서 열기"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
