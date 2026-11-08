/**
 * Media compression utilities for JabarPleasure.
 * Uses native HTML5 Canvas for zero-dependency image-to-WebP compression
 * and prepares video files for Supabase Storage uploads.
 */

export interface ProcessedMedia {
  blob: Blob;
  url: string;
  name: string;
  isVideo: boolean;
  sizeKb: number;
}

/**
 * Compresses an image file (JPEG, PNG, HEIC, etc.) to WebP format.
 * Max dimension default 1920px, quality 0.82 (reduces size while preserving sharpness).
 */
export async function compressImageToWebP(
  file: File,
  maxDimension: number = 1920,
  quality: number = 0.82
): Promise<ProcessedMedia> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if dimensions exceed maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2D canvas context for compression.'));
        return;
      }

      // Draw and export to WebP
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to WebP blob.'));
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName}.webp`;
          const previewUrl = URL.createObjectURL(blob);

          resolve({
            blob,
            url: previewUrl,
            name: newFileName,
            isVideo: false,
            sizeKb: Math.round(blob.size / 1024),
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gagal membaca file gambar untuk dikompres.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Processes an uploaded media file:
 * - If image: compresses to WebP.
 * - If video: validates <= 10MB and prepares preview URL.
 */
export async function processMediaFile(file: File): Promise<ProcessedMedia> {
  const isVideo = file.type.startsWith('video/');

  if (isVideo) {
    const maxVideoSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxVideoSize) {
      throw new Error('Ukuran video melebihi batas maksimal 10MB.');
    }

    const previewUrl = URL.createObjectURL(file);
    return {
      blob: file,
      url: previewUrl,
      name: file.name,
      isVideo: true,
      sizeKb: Math.round(file.size / 1024),
    };
  }

  // It's a photo
  const maxPhotoSize = 20 * 1024 * 1024; // allow up to 20MB raw file before compression
  if (file.size > maxPhotoSize) {
    throw new Error('File foto awal terlalu besar untuk diproses.');
  }

  const processed = await compressImageToWebP(file);

  // Validate compressed size against PRD 2MB limit
  if (processed.sizeKb > 2048) {
    // If still > 2MB, try with higher compression quality 0.65
    return await compressImageToWebP(file, 1280, 0.65);
  }

  return processed;
}

/**
 * Revokes a created object URL to prevent memory leaks.
 */
export function revokeMediaUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
}

