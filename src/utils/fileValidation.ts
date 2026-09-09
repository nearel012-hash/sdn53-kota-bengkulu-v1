import { MediaType, FileValidationResult } from '../types';

// Dangerous file extensions that pose security risks in public portal uploads
export const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'bash', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh',
  'msc', 'jar', 'com', 'pif', 'scr', 'cpl', 'gadget', 'hta', 'inf', 'reg',
  'ps1', 'ps2', 'php', 'php3', 'php4', 'php5', 'phtml', 'asp', 'aspx', 'jsp',
  'cgi', 'pl', 'py', 'rb', 'msi', 'bin', 'dll', 'sys', 'drv'
]);

export const ALLOWED_EXTENSIONS_BY_TYPE: Record<MediaType, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'],
  video: ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi'],
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'odt', 'ods', 'odp'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
  other: []
};

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB default limit

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts[parts.length - 1].toLowerCase();
}

export function detectMediaType(filename: string, mimeType: string): MediaType {
  const ext = getFileExtension(filename);
  
  // Image check
  if (mimeType.startsWith('image/') || ALLOWED_EXTENSIONS_BY_TYPE.image.includes(ext)) {
    return 'image';
  }
  // Video check
  if (mimeType.startsWith('video/') || ALLOWED_EXTENSIONS_BY_TYPE.video.includes(ext)) {
    return 'video';
  }
  // Audio check
  if (mimeType.startsWith('audio/') || ALLOWED_EXTENSIONS_BY_TYPE.audio.includes(ext)) {
    return 'audio';
  }
  // Archive check
  if (
    mimeType.includes('zip') ||
    mimeType.includes('tar') ||
    mimeType.includes('compressed') ||
    ALLOWED_EXTENSIONS_BY_TYPE.archive.includes(ext)
  ) {
    return 'archive';
  }
  // Document check
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('excel') ||
    mimeType.includes('powerpoint') ||
    mimeType.includes('document') ||
    mimeType.includes('presentation') ||
    mimeType.includes('spreadsheet') ||
    mimeType.startsWith('text/') ||
    ALLOWED_EXTENSIONS_BY_TYPE.document.includes(ext)
  ) {
    return 'document';
  }

  return 'other';
}

export function validateUploadedFile(file: File, maxSizeBytes: number = MAX_FILE_SIZE_BYTES): FileValidationResult {
  const ext = getFileExtension(file.name);

  // 1. Security check: strictly block dangerous extensions
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      type: 'other',
      error: `File dengan ekstensi .${ext} diblokir untuk keamanan sistem sekolah (potensi eksekusi script/malware).`
    };
  }

  // 2. Size check
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      type: detectMediaType(file.name, file.type),
      error: `Ukuran file (${formatFileSize(file.size)}) melebihi batas maksimum ${formatFileSize(maxSizeBytes)}.`
    };
  }

  // 3. Detect type
  const type = detectMediaType(file.name, file.type);

  // 4. Warning for very large files
  let warning: string | undefined;
  if (file.size > 20 * 1024 * 1024) {
    warning = 'File cukup besar (>20MB), proses upload mungkin membutuhkan beberapa detik.';
  }

  return {
    isValid: true,
    type,
    warning
  };
}

export function canBrowserPreviewDirectly(type: MediaType, extension: string): boolean {
  if (type === 'image') return true;
  if (type === 'video' && ['mp4', 'webm', 'ogg'].includes(extension)) return true;
  if (type === 'audio' && ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(extension)) return true;
  if (type === 'document' && ['pdf', 'txt', 'csv'].includes(extension)) return true;
  return false;
}
