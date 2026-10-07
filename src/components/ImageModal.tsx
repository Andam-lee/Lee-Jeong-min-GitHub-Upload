import React from 'react';
import { PhotoItem } from '../types';
import { formatBytes } from '../utils/imageProcessor';
import { X, ExternalLink, Download, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ImageModalProps {
  photo: PhotoItem | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ photo, onClose }) => {
  if (!photo) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="min-w-0 pr-4">
            <h4 className="font-bold text-sm text-white truncate">{photo.name}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{photo.originalWidth} × {photo.originalHeight}</span>
              <span>•</span>
              <span>{formatBytes(photo.originalSize)}</span>
              <span>•</span>
              <span className="text-teal-400 flex items-center gap-1 font-medium">
                {photo.mode === 'portfolio' ? '포트폴리오 (장축 2000px)' : '원본 사진'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {photo.result && (
              <a
                href={photo.result.cdnUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 text-xs font-semibold flex items-center gap-1.5 border border-teal-500/30 transition-colors"
              >
                <span>원본 링크 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60 min-h-[300px]">
          <img
            src={photo.result?.cdnUrl || photo.previewUrl}
            alt={photo.name}
            className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
