import React, { useState, useEffect, useCallback } from 'react';
import { 
  GitHubConfig, 
  GitHubUser, 
  PhotoItem, 
  UploadMode, 
  HistoryItem 
} from './types';
import { Navbar } from './components/Navbar';
import { DropZone } from './components/DropZone';
import { PhotoCard } from './components/PhotoCard';
import { BatchPermalinksView } from './components/BatchPermalinksView';
import { GitHubSettingsModal } from './components/GitHubSettingsModal';
import { GuideModal } from './components/GuideModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ImageModal } from './components/ImageModal';
import { 
  readImageDimensions, 
  resizeToLongEdge, 
  blobToBase64, 
  sanitizeFilename,
  formatBytes 
} from './utils/imageProcessor';
import { uploadFileToGitHub, verifyGitHubToken } from './services/github';
import { 
  UploadCloud, 
  Trash2, 
  Sparkles, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  HelpCircle,
  FolderGit2,
  Settings,
  ArrowRight
} from 'lucide-react';

const STORAGE_KEY_CONFIG = 'gitpic_config_v1';
const STORAGE_KEY_HISTORY = 'gitpic_history_v1';

const DEFAULT_CONFIG: GitHubConfig = {
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  pathPrefix: 'portfolio/',
  autoTimestamp: true,
  commitMessage: 'Add portfolio photo via GitPic',
  isRemembered: true,
};

export default function App() {
  // Config & User state
  const [config, setConfig] = useState<GitHubConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [user, setUser] = useState<GitHubUser | null>(null);

  // Photos state
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [globalMode, setGlobalMode] = useState<UploadMode>('portfolio');
  const [isUploading, setIsUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<PhotoItem | null>(null);

  // Verify stored token on initial load
  useEffect(() => {
    if (config.token && config.isRemembered) {
      verifyGitHubToken(config.token)
        .then((userData) => setUser(userData))
        .catch((err) => {
          console.warn('Initial token verification failed:', err);
        });
    }
  }, []);

  // Save config to localStorage
  const handleSaveConfig = (newConfig: GitHubConfig, newUser: GitHubUser | null) => {
    setConfig(newConfig);
    setUser(newUser);
    if (newConfig.isRemembered) {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
    } else {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    }
  };

  // Add photos to queue
  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newItems: PhotoItem[] = [];

    for (const file of files) {
      try {
        const dimensions = await readImageDimensions(file);
        const previewUrl = URL.createObjectURL(file);

        let targetWidth = dimensions.width;
        let targetHeight = dimensions.height;
        const longEdge = Math.max(dimensions.width, dimensions.height);

        if (globalMode === 'portfolio' && longEdge > 2000) {
          const ratio = 2000 / longEdge;
          targetWidth = Math.round(dimensions.width * ratio);
          targetHeight = Math.round(dimensions.height * ratio);
        }

        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          originalWidth: dimensions.width,
          originalHeight: dimensions.height,
          originalSize: file.size,
          previewUrl,
          mode: globalMode,
          targetWidth,
          targetHeight,
          status: 'idle',
          progress: 0,
        });
      } catch (err) {
        console.error('Failed to process image file:', file.name, err);
      }
    }

    setPhotos((prev) => [...prev, ...newItems]);
  }, [globalMode]);

  // Remove photo from queue
  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // Clear all pending or completed photos
  const handleClearAllPhotos = () => {
    photos.forEach((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
    });
    setPhotos([]);
  };

  // Clear completed only
  const handleClearCompleted = () => {
    setPhotos((prev) => prev.filter((p) => p.status !== 'success'));
  };

  // Switch mode for individual photo
  const handleTogglePhotoMode = (id: string, newMode: UploadMode) => {
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.id !== id) return photo;

        let targetWidth = photo.originalWidth;
        let targetHeight = photo.originalHeight;
        const longEdge = Math.max(photo.originalWidth, photo.originalHeight);

        if (newMode === 'portfolio' && longEdge > 2000) {
          const ratio = 2000 / longEdge;
          targetWidth = Math.round(photo.originalWidth * ratio);
          targetHeight = Math.round(photo.originalHeight * ratio);
        }

        return {
          ...photo,
          mode: newMode,
          targetWidth,
          targetHeight,
        };
      })
    );
  };

  // Change global mode and apply to all pending items
  const handleGlobalModeChange = (newMode: UploadMode) => {
    setGlobalMode(newMode);
    setPhotos((prev) =>
      prev.map((photo) => {
        if (photo.status === 'success' || photo.status === 'uploading') return photo;

        let targetWidth = photo.originalWidth;
        let targetHeight = photo.originalHeight;
        const longEdge = Math.max(photo.originalWidth, photo.originalHeight);

        if (newMode === 'portfolio' && longEdge > 2000) {
          const ratio = 2000 / longEdge;
          targetWidth = Math.round(photo.originalWidth * ratio);
          targetHeight = Math.round(photo.originalHeight * ratio);
        }

        return {
          ...photo,
          mode: newMode,
          targetWidth,
          targetHeight,
        };
      })
    );
  };

  // Execute upload process
  const handleStartUpload = async () => {
    if (!config.token || !config.owner || !config.repo) {
      setIsSettingsOpen(true);
      return;
    }

    const pendingPhotos = photos.filter((p) => p.status !== 'success');
    if (pendingPhotos.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < pendingPhotos.length; i++) {
      const currentPhoto = pendingPhotos[i];
      setCurrentUploadIndex(i + 1);

      try {
        let blobToUpload: Blob = currentPhoto.file;
        let finalWidth = currentPhoto.originalWidth;
        let finalHeight = currentPhoto.originalHeight;
        let finalSize = currentPhoto.originalSize;

        // Step 1: Resize if mode === 'portfolio'
        if (currentPhoto.mode === 'portfolio') {
          setPhotos((prev) =>
            prev.map((p) => (p.id === currentPhoto.id ? { ...p, status: 'processing' } : p))
          );

          const resizeRes = await resizeToLongEdge(currentPhoto.file, 2000, 0.92);
          blobToUpload = resizeRes.blob;
          finalWidth = resizeRes.width;
          finalHeight = resizeRes.height;
          finalSize = resizeRes.size;
        }

        // Step 2: Convert to Base64
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === currentPhoto.id
              ? {
                  ...p,
                  status: 'uploading',
                  processedBlob: blobToUpload,
                  processedSize: finalSize,
                  targetWidth: finalWidth,
                  targetHeight: finalHeight,
                }
              : p
          )
        );

        const base64Data = await blobToBase64(blobToUpload);

        // Step 3: Determine path
        const sanitizedName = sanitizeFilename(currentPhoto.name, config.autoTimestamp);
        const targetPath = `${config.pathPrefix || 'portfolio/'}${sanitizedName}`;

        // Step 4: Upload to GitHub Contents API
        const result = await uploadFileToGitHub({
          token: config.token,
          owner: config.owner,
          repo: config.repo,
          branch: config.branch || 'main',
          path: targetPath,
          contentBase64: base64Data,
          commitMessage: `Add portfolio photo: ${sanitizedName} via GitPic`,
        });

        // Step 5: Update photo status
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === currentPhoto.id
              ? {
                  ...p,
                  status: 'success',
                  result,
                  targetPath,
                }
              : p
          )
        );

        // Step 6: Append to history
        const newHistoryItem: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          fileName: sanitizedName,
          targetPath,
          mode: currentPhoto.mode,
          repo: config.repo,
          branch: config.branch || 'main',
          owner: config.owner,
          fileSize: finalSize,
          width: finalWidth,
          height: finalHeight,
          uploadedAt: result.uploadedAt,
          result,
        };

        setHistory((prev) => {
          const updated = [newHistoryItem, ...prev];
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated.slice(0, 100)));
          return updated;
        });
      } catch (err: any) {
        console.error('Error uploading photo:', currentPhoto.name, err);
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === currentPhoto.id
              ? {
                  ...p,
                  status: 'error',
                  errorMessage: err.message || '업로드 중 오류가 발생했습니다.',
                }
              : p
          )
        );
      }
    }

    setIsUploading(false);
  };

  const pendingCount = photos.filter((p) => p.status !== 'success').length;
  const completedCount = photos.filter((p) => p.status === 'success').length;
  const isConfigured = Boolean(config.token && config.owner && config.repo);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Navbar */}
      <Navbar
        config={config}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Top Hero / Configuration reminder banner */}
        {!isConfigured && (
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  GitHub 연동 설정이 필요합니다
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  사진을 업로드할 <strong className="text-amber-300">GitHub 리포지토리와 액세스 토큰</strong>을 연결해주세요. 1분이면 설정이 완료됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-teal-400" />
                <span>발급 가이드</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20"
              >
                <Settings className="w-4 h-4" />
                <span>GitHub 설정하기</span>
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights bar (if configured) */}
        {isConfigured && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-teal-400" />
              <span className="text-slate-400">저장 대상:</span>
              <span className="font-mono font-semibold text-white">
                {config.owner}/{config.repo}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-teal-300 font-mono text-[11px]">
                {config.branch}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono">
                폴더: <span className="text-slate-200">{config.pathPrefix}</span>
              </span>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1"
            >
              <span>저장소/폴더 변경</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Upload Drop Zone & Mode Selection */}
        <DropZone
          onFilesSelected={handleFilesSelected}
          currentMode={globalMode}
          onModeChange={handleGlobalModeChange}
          disabled={isUploading}
        />

        {/* Photos Queue Section */}
        {photos.length > 0 && (
          <div className="space-y-4">
            {/* Queue Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>업로드 대기열</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-mono text-teal-300">
                    {photos.length}개
                  </span>
                </h3>
                {pendingCount > 0 && (
                  <span className="text-xs text-slate-400">
                    ({pendingCount}개 업로드 예정)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAllPhotos}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>전체 비우기</span>
                </button>

                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleStartUpload}
                    disabled={isUploading}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/25 disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>업로드 진행 중 ({currentUploadIndex}/{pendingCount})...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-slate-950" />
                        <span>{pendingCount}개 사진 GitHub 업로드 시작</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Photo Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onRemove={handleRemovePhoto}
                  onToggleMode={handleTogglePhotoMode}
                  onViewImage={(p) => setSelectedPhotoForModal(p)}
                  disabled={isUploading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Batch Permalinks Section (Display when at least one completed) */}
        {completedCount > 0 && (
          <BatchPermalinksView
            photos={photos}
            repoName={`${config.owner}/${config.repo}`}
            branch={config.branch}
            onClearCompleted={handleClearCompleted}
            onViewImage={(p) => setSelectedPhotoForModal(p)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950/60 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Lee Jeong-min</span>
            <span>•</span>
            <span>Github 사진 자동 업로드 & Permalink 생성기</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>포트폴리오 장축 2000px 리사이즈</span>
            <span>•</span>
            <span>무손실 원본 업로드</span>
            <span>•</span>
            <span>jsDelivr CDN 지원</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <GitHubSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        currentUser={user}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onUseDirectLink={() => {}}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem(STORAGE_KEY_HISTORY);
        }}
        onDeleteHistoryItem={(id) => {
          setHistory((prev) => {
            const updated = prev.filter((item) => item.id !== id);
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
            return updated;
          });
        }}
      />

      <ImageModal
        photo={selectedPhotoForModal}
        onClose={() => setSelectedPhotoForModal(null)}
      />
    </div>
  );
}
