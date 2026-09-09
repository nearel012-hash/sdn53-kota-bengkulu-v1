import { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  Music,
  Video,
  Archive,
  Image as ImageIcon,
  Copy,
  Check,
  Calendar,
  HardDrive,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { MediaItem } from '../types';
import { formatFileSize, canBrowserPreviewDirectly } from '../utils/fileValidation';
import { getMediaBlob } from '../services/storage';

interface MediaPreviewModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export default function MediaPreviewModal({ item, onClose }: MediaPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);

  useEffect(() => {
    let activeUrl: string | null = null;

    if (item) {
      if (item.dataUrl) {
        setBlobUrl(item.dataUrl);
      } else {
        setIsLoadingBlob(true);
        getMediaBlob(item.id)
          .then((blob) => {
            if (blob) {
              activeUrl = URL.createObjectURL(blob);
              setBlobUrl(activeUrl);
            } else {
              setBlobUrl(null);
            }
          })
          .catch((err) => {
            console.error('Failed to get media blob', err);
            setBlobUrl(null);
          })
          .finally(() => {
            setIsLoadingBlob(false);
          });
      }
    } else {
      setBlobUrl(null);
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [item]);

  if (!item) return null;

  const canPreview = canBrowserPreviewDirectly(item.type, item.extension);

  const handleDownload = async () => {
    try {
      let downloadUrl = blobUrl;
      let tempBlobUrl = false;

      if (!downloadUrl) {
        const blob = await getMediaBlob(item.id);
        if (blob) {
          downloadUrl = URL.createObjectURL(blob);
          tempBlobUrl = true;
        } else if (item.dataUrl) {
          downloadUrl = item.dataUrl;
        }
      }

      if (!downloadUrl) {
        // Fallback for demo preset files: create a downloadable text/binary blob
        const fallbackBlob = new Blob(
          [`Portal Publikasi Sekolah - File Arsip: ${item.originalName}\nUkuran: ${formatFileSize(item.size)}\nTipe: ${item.mimeType}`],
          { type: item.mimeType || 'application/octet-stream' }
        );
        downloadUrl = URL.createObjectURL(fallbackBlob);
        tempBlobUrl = true;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.originalName || item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (tempBlobUrl && downloadUrl) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl!), 1000);
      }
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError('Gagal mengunduh file. Silakan coba kembali.');
      setTimeout(() => setDownloadError(null), 3500);
    }
  };

  const handleCopyLink = () => {
    const urlToCopy = blobUrl || window.location.href;
    navigator.clipboard.writeText(urlToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getBadgeColor = () => {
    switch (item.type) {
      case 'image':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'video':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'audio':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'document':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archive':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      id="media-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="media-preview-modal-content"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${getBadgeColor()}`}
            >
              {item.type} (.{item.extension})
            </span>
            <h3 className="text-base font-bold text-slate-800 truncate" title={item.originalName}>
              {item.originalName}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="preview-download-button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              title="Unduh file ke perangkat"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File</span>
            </button>
            <button
              id="preview-close-button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 font-medium flex items-center justify-between">
            <span>{downloadError}</span>
            <button onClick={() => setDownloadError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Media Preview Stage */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/5 flex items-center justify-center min-h-[300px]">
          {isLoadingBlob ? (
            <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Memuat file dari penyimpanan...</p>
            </div>
          ) : (
            <>
              {/* IMAGE PREVIEW */}
              {item.type === 'image' && blobUrl && (
                <div className="flex flex-col items-center justify-center max-w-full">
                  <img
                    src={blobUrl}
                    alt={item.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md border border-slate-200"
                  />
                  {item.dimensions && (
                    <span className="mt-2 text-xs text-slate-500 font-mono">
                      Resolusi: {item.dimensions.width} x {item.dimensions.height} px
                    </span>
                  )}
                </div>
              )}

              {/* VIDEO PREVIEW */}
              {item.type === 'video' && (
                <div className="w-full max-w-2xl bg-black rounded-xl overflow-hidden shadow-lg border border-slate-800">
                  {blobUrl ? (
                    <video
                      controls
                      autoPlay={true}
                      playsInline
                      className="w-full max-h-[55vh] aspect-video object-contain"
                      src={blobUrl}
                    >
                      Browser Anda tidak mendukung tag video.
                    </video>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <Video className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                      <p className="text-sm">Video siap diputar setelah diunduh atau diproses.</p>
                    </div>
                  )}
                </div>
              )}

              {/* AUDIO PREVIEW */}
              {item.type === 'audio' && (
                <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner">
                    <Music className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-slate-800">{item.originalName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Pemutar Audio Resmi Sekolah</p>
                  </div>
                  {blobUrl ? (
                    <audio controls className="w-full mt-2" src={blobUrl}>
                      Browser Anda tidak mendukung pemutar audio.
                    </audio>
                  ) : (
                    <div className="text-xs text-slate-500">Audio siap diputar langsung</div>
                  )}
                </div>
              )}

              {/* PDF PREVIEW */}
              {item.type === 'document' && item.extension === 'pdf' && (
                <div className="w-full flex flex-col items-center">
                  {blobUrl ? (
                    <div className="w-full h-[60vh] bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-inner flex flex-col">
                      <iframe
                        src={`${blobUrl}#toolbar=1`}
                        title={item.name}
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 max-w-md">
                      <FileText className="w-14 h-14 text-rose-500 mx-auto mb-3" />
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{item.originalName}</h4>
                      <p className="text-xs text-slate-500 mb-5">
                        Dokumen PDF Resmi ({formatFileSize(item.size)})
                      </p>
                      <button
                        onClick={handleDownload}
                        className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Buka & Unduh PDF
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* OFFICE / ARCHIVE / OTHER DOCUMENT CARD PREVIEW */}
              {(!canPreview || (item.type === 'document' && item.extension !== 'pdf')) && (
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${
                      item.type === 'archive'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : item.extension.includes('doc')
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : item.extension.includes('xls')
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : item.extension.includes('ppt')
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {item.type === 'archive' ? (
                      <Archive className="w-10 h-10" />
                    ) : item.type === 'image' ? (
                      <ImageIcon className="w-10 h-10" />
                    ) : (
                      <FileText className="w-10 h-10" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-base mb-1 break-all">
                    {item.originalName}
                  </h4>
                  <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-500">
                    <span>{item.mimeType || `application/${item.extension}`}</span>
                    <span>•</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 w-full text-left">
                    {item.description ||
                      `File ${item.extension.toUpperCase()} ini terdaftar di repositori dokumen sekolah. Unduh file untuk membuka dengan aplikasi terkait.`}
                  </p>
                  <button
                    onClick={handleDownload}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Unduh Dokumen Sekarang
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Meta Details */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 block">Ukuran File</span>
              <span className="font-semibold text-slate-800">{formatFileSize(item.size)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 block">Diunggah Pada</span>
              <span className="font-semibold text-slate-800">{item.uploadDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="text-slate-400 block">Status Keamanan</span>
              <span className="font-semibold text-emerald-700">Terverifikasi Bebas Script</span>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tautan Disalin' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
