import imageCompression from 'browser-image-compression';

interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

export async function compressImage(
  file: File,
  options?: CompressOptions
): Promise<File> {
  const { maxSizeMB = 1, maxWidthOrHeight = 1200 } = options || {};

  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  });
}
