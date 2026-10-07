import React, { useRef, useState, useEffect } from 'react';
import { UploadMode } from '../types';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Check, 
  Info,
  Maximize2
} from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  currentMode: UploadMode;
  onModeChange: (mode: UploadMode) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected, disabled]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      }
      // Reset input value so same files can be re-selected if removed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Mode Selector (핵심 요구사항: 포트폴리오 전용 사진 vs 원본 사진) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>업로드 모드 선택</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {currentMode === 'portfolio' ? '⚡ 2000px 자동 리사이즈' : '📦 100% 무손실 원본'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Button 1: 포트폴리오 전용 사진 */}
          <button
            type="button"
            onClick={() => onModeChange('portfolio')}
            className={`relative flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all group ${
              currentMode === 'portfolio'
                ? 'bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/5 border-teal-500/50 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                currentMode === 'portfolio'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                  : 'bg-slate-850 text-slate-400 group-hover:text-teal-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">포트폴리오 전용 사진</span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-teal-500/20 text-teal-300">
                  추천
                </span>
                {currentMode === 'portfolio' && (
                  <Check className="w-4 h-4 text-teal-400 ml-auto shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                장축 <strong className="text-teal-300">2000px 자동 리사이즈</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                웹 포트폴리오에 이상적인 최적 해상도로 용량을 약 80% 절감하고 로딩 속도를 극대화합니다.
              </p>
            </div>
          </button>

          {/* Button 2: 원본 사진 */}
          <button
            type="button"
            onClick={() => onModeChange('original')}
            className={`relative flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all group ${
              currentMode === 'original'
                ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-cyan-500/5 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                currentMode === 'original'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-850 text-slate-400 group-hover:text-cyan-400'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">원본 사진</span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  Original
                </span>
                {currentMode === 'original' && (
                  <Check className="w-4 h-4 text-cyan-400 ml-auto shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                해상도 & 바이트 <strong className="text-cyan-300">원본 그대로 업로드</strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                리사이즈나 압축 변형 없이 원본 파일과 메타데이터를 100% 무손실 상태로 보존합니다.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 select-none overflow-hidden ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-900/30'
            : isDragging
            ? 'border-teal-400 bg-teal-500/10 scale-[1.008] shadow-2xl shadow-teal-500/20'
            : 'border-slate-700 hover:border-teal-500/60 bg-slate-900/40 hover:bg-slate-900/80 shadow-lg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
          multiple
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform ${
              isDragging
                ? 'bg-teal-500 text-slate-950 scale-110 shadow-xl shadow-teal-500/30'
                : 'bg-slate-800/80 border border-slate-700 text-teal-400 group-hover:scale-105'
            }`}
          >
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-white">
              {isDragging ? '여기에 사진들을 놓아주세요!' : '사진 파일을 드래그하거나 클릭하여 업로드'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              다수의 사진을 한 번에 선택할 수 있으며, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">Ctrl+V</kbd> 또는 <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">⌘+V</kbd>로 클립보드 붙여넣기도 가능합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 font-mono">
              JPG / PNG / WebP / GIF
            </span>
            <span>•</span>
            <span className="text-teal-400 font-medium">
              현재 모드: {currentMode === 'portfolio' ? '포트폴리오 (장축 2000px 리사이즈)' : '원본 그대로'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
