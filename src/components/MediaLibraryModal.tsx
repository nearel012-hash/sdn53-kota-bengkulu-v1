import { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  X,
  Upload,
  Search,
  Filter,
  Check,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  AlertCircle,
  Plus,
  Globe,
  Lock
} from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { getAllMedia, saveMediaItem } from '../services/storage';
import {
  validateUploadedFile,
  formatFileSize,
  detectMediaType,
  getFileExtension
} from '../utils/fileValidation';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  allowedTypes?: MediaType[]; // Optional filter e.g. only ['image'] for logo
  title?: string;
  selectedId?: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  allowedTypes,
  title = 'Pilih dari Universal Media Library',
  selectedId
}: MediaLibraryModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadAsPublic, setUploadAsPublic] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    try {
      const items = await getAllMedia();
      setMediaList(items);
    } catch (err) {
      console.error('Failed to load media in modal', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      setUploadError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const file = files[0];
      const validation = validateUploadedFile(file);

      if (!validation.isValid) {
        setUploadError(validation.error || 'File tidak valid');
        setIsUploading(false);
        return;
      }

      if (allowedTypes && !allowedTypes.includes(validation.type)) {
        setUploadError(`Hanya file tipe ${allowedTypes.join(', ')} yang diperbolehkan.`);
        setIsUploading(false);
        return;
      }

      const ext = getFileExtension(file.name);
      const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let dataUrl: string | undefined;

      // For images, read data URL for instant display
      if (validation.type === 'image') {
        dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const newItem: MediaItem = {
        id: mediaId,
        name: file.name,
        originalName: file.name,
        type: validation.type,
        mimeType: file.type || `application/${ext}`,
        extension: ext,
        size: file.size,
        dataUrl,
        uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        tags: [validation.type, ext],
        isPublic: uploadAsPublic,
        accessLevel: uploadAsPublic ? 'public' : 'private'
      };

      await saveMediaItem(newItem, file);
      await loadMedia();
      onSelect(newItem);
      onClose();
    } catch (err) {
      console.error('Upload error in modal:', err);
      setUploadError('Gagal mengunggah file. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredItems = mediaList.filter((item) => {
    // Type constraint from parent
    if (allowedTypes && !allowedTypes.includes(item.type)) {
      return false;
    }
    // Local filter tab
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.originalName.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q)) ||
        item.extension.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderIcon = (type: MediaType, ext: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-6 h-6 text-emerald-600" />;
      case 'video':
        return <Video className="w-6 h-6 text-purple-600" />;
      case 'audio':
        return <Music className="w-6 h-6 text-amber-600" />;
      case 'archive':
        return <Archive className="w-6 h-6 text-orange-600" />;
      default:
        return <FileText className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div
      id="media-library-picker-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="media-library-picker-container"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih media yang sudah ada atau unggah file baru untuk digunakan langsung.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters & Upload Button */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari file berdasarkan nama atau tag..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {['all', 'image', 'video', 'audio', 'document', 'archive'].map((t) => {
                if (allowedTypes && t !== 'all' && !allowedTypes.includes(t as MediaType)) {
                  return null;
                }
                const labels: Record<string, string> = {
                  all: 'Semua',
                  image: 'Gambar',
                  video: 'Video',
                  audio: 'Audio',
                  document: 'Dokumen',
                  archive: 'Arsip'
                };
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      selectedType === t
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 cursor-pointer select-none"
              title="Jika dicentang, file ini juga akan muncul di Pusat Unduhan & Media Publik"
            >
              <input
                type="checkbox"
                checked={uploadAsPublic}
                onChange={(e) => setUploadAsPublic(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer accent-blue-600"
              />
              {uploadAsPublic ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <Globe className="w-3 h-3 text-emerald-600" />
                  Publik di Unduhan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Privat
                </span>
              )}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept={
                allowedTypes?.includes('image') && allowedTypes.length === 1
                  ? 'image/*'
                  : undefined
              }
            />
            <button
              id="upload-direct-media-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah File Baru</span>
                </>
              )}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="px-6 py-2 bg-rose-50 border-b border-rose-100 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Filter className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">Tidak ada file media yang cocok</p>
              <p className="text-xs text-slate-400 mt-1">
                Silakan coba pencarian lain atau unggah file baru menggunakan tombol di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`group relative bg-white rounded-xl border p-2 cursor-pointer transition-all hover:shadow-md hover:border-blue-500 ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="w-full aspect-square rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center relative mb-2">
                      {item.type === 'image' && (item.dataUrl || item.id) ? (
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                          {renderIcon(item.type, item.extension)}
                          <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                            .{item.extension}
                          </span>
                        </div>
                      )}

                      {/* Type Badge */}
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-medium text-white uppercase tracking-wider">
                        {item.type}
                      </span>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="px-1">
                      <p
                        className="text-xs font-semibold text-slate-800 truncate"
                        title={item.originalName}
                      >
                        {item.originalName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredItems.length} media tersedia</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
