/**
 * Image processing utilities for GitPic
 * Supports resizing long edge to 2000px while preserving aspect ratio
 */

export interface Dimensions {
  width: number;
  height: number;
}

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

/**
 * Read image dimensions from a File or Blob
 */
export async function readImageDimensions(file: File | Blob): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      };
      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 읽을 수 없습니다. 지원되는 이미지 포맷인지 확인해주세요.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Resizes an image so that its longest edge is at most 2000px (or specified maxLongEdge).
 * Maintains aspect ratio and high fidelity rendering.
 */
export async function resizeToLongEdge(
  file: File,
  maxLongEdge = 2000,
  quality = 0.92
): Promise<ResizeResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;
        const longEdge = Math.max(origWidth, origHeight);

        let targetWidth = origWidth;
        let targetHeight = origHeight;

        if (longEdge > maxLongEdge) {
          const ratio = maxLongEdge / longEdge;
          targetWidth = Math.round(origWidth * ratio);
          targetHeight = Math.round(origHeight * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Determine best output mime type
        let mimeType = file.type;
        if (!mimeType || mimeType === 'image/svg+xml') {
          mimeType = 'image/png';
        } else if (mimeType !== 'image/png' && mimeType !== 'image/webp') {
          mimeType = 'image/jpeg';
        }

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error('이미지 변환 중 오류가 발생했습니다.'));
              return;
            }
            resolve({
              blob,
              width: targetWidth,
              height: targetHeight,
              size: blob.size,
            });
          },
          mimeType,
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지 로딩에 실패했습니다.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Converts a Blob to a raw Base64 string (without the data:image/...;base64, prefix)
 * for GitHub Contents API
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Strip data:image/...;base64,
        const base64Index = reader.result.indexOf(';base64,');
        if (base64Index !== -1) {
          resolve(reader.result.slice(base64Index + 8));
        } else {
          resolve(reader.result);
        }
      } else {
        reject(new Error('Base64 변환 실패'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper to format bytes into readable units (KB, MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Generate safe sanitized filename with optional timestamp
 */
export function sanitizeFilename(originalName: string, addTimestamp = false): string {
  const dotIndex = originalName.lastIndexOf('.');
  const name = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
  const ext = dotIndex !== -1 ? originalName.slice(dotIndex) : '';

  // Clean filename for URL/Git friendliness while preserving readable characters
  const cleanName = name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\uAC00-\uD7A3]/g, '');

  const base = cleanName || 'photo';

  if (addTimestamp) {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `${base}_${ts}${ext}`;
  }

  return `${base}${ext}`;
}
