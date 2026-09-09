import { useState, useEffect, useRef, DragEvent, ChangeEvent, MouseEvent } from 'react';
import {
  Upload,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  AlertCircle,
  HardDrive,
  ShieldCheck,
  ArrowUpDown,
  FileSpreadsheet,
  FileCode,
  FolderOpen,
  Play,
  Globe,
  Lock,
  EyeOff
} from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import {
  getAllMedia,
  saveMediaItem,
  deleteMediaItem,
  getMediaBlob,
  updateMediaItemVisibility
} from '../services/storage';
import {
  validateUploadedFile,
  formatFileSize,
  getFileExtension,
  canBrowserPreviewDirectly
} from '../utils/fileValidation';
import MediaPreviewModal from './MediaPreviewModal';
import ConfirmModal from './ConfirmModal';

export default function UniversalMediaLibrary() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // Uploading state & notifications
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Visibility / Access control
  const [uploadAsPublic, setUploadAsPublic] = useState(true);
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');

  // Confirm delete modal states
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const items = await getAllMedia();
      setMediaList(items);
    } catch (err) {
      console.error('Failed to load media', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleToggleVisibility = async (item: MediaItem, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    const nextVal = item.isPublic === false ? true : false;
    try {
      await updateMediaItemVisibility(item.id, nextVal);
      setMediaList((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, isPublic: nextVal, accessLevel: nextVal ? 'public' : 'private' } : m
        )
      );
      setUploadSuccess(
        nextVal
          ? `Berkas "${item.originalName}" kini DITAMPILKAN di Pusat Unduhan & Media Publik.`
          : `Berkas "${item.originalName}" kini DISEMBUNYIKAN (Privat) dari Pusat Unduhan & Media.`
      );
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to toggle visibility', err);
      setUploadError('Gagal memperbarui visibilitas berkas.');
      setTimeout(() => setUploadError(null), 3000);
    }
  };

  const handleBulkSetVisibility = async (makePublic: boolean) => {
    if (selectedIds.size === 0) return;
    const ids: string[] = Array.from(selectedIds);
    try {
      for (const id of ids) {
        await updateMediaItemVisibility(id, makePublic);
      }
      setMediaList((prev) =>
        prev.map((m) =>
          selectedIds.has(m.id) ? { ...m, isPublic: makePublic, accessLevel: makePublic ? 'public' : 'private' } : m
        )
      );
      setUploadSuccess(
        makePublic
          ? `${ids.length} berkas diatur menjadi PUBLIK (Muncul di Pusat Unduhan & Media).`
          : `${ids.length} berkas diatur menjadi PRIVAT (Disembunyikan dari Pusat Unduhan & Media).`
      );
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err) {
      console.error('Bulk visibility error', err);
      setUploadError('Gagal memperbarui visibilitas berkas terpilih.');
      setTimeout(() => setUploadError(null), 3000);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploadSuccess(null);
    let successCount = 0;
    const errors: string[] = [];

    setUploadProgress(`Memproses ${files.length} file...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateUploadedFile(file);

      if (!validation.isValid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        const ext = getFileExtension(file.name);
        const mediaId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        let dataUrl: string | undefined;

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
        successCount++;
      } catch (err) {
        console.error('Failed to save media', err);
        errors.push(`${file.name}: Gagal menyimpan file.`);
      }
    }

    setUploadProgress(null);
    await fetchMedia();

    if (successCount > 0) {
      setUploadSuccess(`Berhasil mengunggah ${successCount} file ke Universal Media Library.`);
      setTimeout(() => setUploadSuccess(null), 4000);
    }

    if (errors.length > 0) {
      setUploadError(errors.join(' | '));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleConfirmSingleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMediaItem(deleteTarget.id);
      await fetchMedia();
      if (selectedIds.has(deleteTarget.id)) {
        const updated = new Set(selectedIds);
        updated.delete(deleteTarget.id);
        setSelectedIds(updated);
      }
      setUploadSuccess(`File "${deleteTarget.name}" berhasil dihapus.`);
      setTimeout(() => setUploadSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to delete media', err);
      setUploadError('Gagal menghapus file.');
      setTimeout(() => setUploadError(null), 3500);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      const idsToDelete: string[] = Array.from(selectedIds);
      for (const id of idsToDelete) {
        await deleteMediaItem(id);
      }
      const count = idsToDelete.length;
      setSelectedIds(new Set());
      await fetchMedia();
      setUploadSuccess(`Berhasil menghapus ${count} file terpilih.`);
      setTimeout(() => setUploadSuccess(null), 3500);
    } catch (err) {
      console.error('Bulk delete error', err);
      setUploadError('Gagal menghapus beberapa file.');
      setTimeout(() => setUploadError(null), 3500);
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  const handleDownload = async (item: MediaItem) => {
    try {
      let downloadUrl = item.dataUrl;
      let isTemp = false;

      if (!downloadUrl) {
        const blob = await getMediaBlob(item.id);
        if (blob) {
          downloadUrl = URL.createObjectURL(blob);
          isTemp = true;
        }
      }

      if (!downloadUrl) {
        const fallbackBlob = new Blob(
          [`Portal Sekolah - File ${item.originalName}\nUkuran: ${formatFileSize(item.size)}`],
          { type: item.mimeType }
        );
        downloadUrl = URL.createObjectURL(fallbackBlob);
        isTemp = true;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (isTemp && downloadUrl) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl!), 1000);
      }
    } catch (err) {
      console.error('Download error', err);
      setUploadError('Gagal mengunduh file.');
      setTimeout(() => setUploadError(null), 3000);
    }
  };

  const handleCopyTag = (item: MediaItem) => {
    // Generates a markdown or reuse code snippet
    let tag = '';
    if (item.type === 'image') {
      tag = `![${item.originalName}](${item.dataUrl || item.name})`;
    } else {
      tag = `[Lampiran Dokumen: ${item.originalName}](${item.name})`;
    }
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Filter & Sort
  const filteredList = mediaList
    .filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      if (visibilityFilter === 'public' && item.isPublic === false) {
        return false;
      }
      if (visibilityFilter === 'private' && item.isPublic !== false) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.originalName.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q)) ||
          item.extension.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      }
      if (sortBy === 'name') {
        return a.originalName.localeCompare(b.originalName);
      }
      if (sortBy === 'size') {
        return b.size - a.size;
      }
      return 0;
    });

  // Calculate storage usage
  const totalStorageBytes = mediaList.reduce((acc, cur) => acc + cur.size, 0);

  const getMediaIcon = (type: MediaType, ext: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-emerald-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-amber-500" />;
      case 'archive':
        return <Archive className="w-8 h-8 text-orange-500" />;
      case 'document':
        if (ext === 'pdf') return <FileText className="w-8 h-8 text-rose-500" />;
        if (ext.includes('xls') || ext === 'csv')
          return <FileSpreadsheet className="w-8 h-8 text-emerald-600" />;
        return <FileCode className="w-8 h-8 text-blue-500" />;
      default:
        return <FileText className="w-8 h-8 text-slate-500" />;
    }
  };

  return (
    <div id="universal-media-library-view" className="space-y-6">
      {/* Top Header & Storage Stats Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">Universal Media Library</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {mediaList.length} Media
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Pusat penyimpanan terintegrasi untuk gambar, video profil, audio mars, dokumen sekolah (PDF, Word, Excel, PPT), dan arsip zip.
          </p>
        </div>

        {/* Quick Storage Meter */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
          <HardDrive className="w-5 h-5 text-slate-400" />
          <div className="text-xs">
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <span>Total Penyimpanan:</span>
              <span className="text-blue-600">{formatFileSize(totalStorageBytes)}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Maksimum per file 50MB • Validasi Keamanan Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Banner */}
      <div
        id="media-upload-dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
            : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          multiple
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Tarik & Lepas File ke Sini, atau <span className="text-blue-600 underline">Pilih File</span>
        </h3>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Mendukung Gambar (JPG, PNG, WebP, SVG), Video (MP4, WebM), Audio (MP3, WAV), Dokumen (PDF, Word, Excel, PowerPoint), serta Arsip (ZIP, RAR).
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Filter Script Berbahaya Otomatis
          </span>
          <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
            Maks 50MB/file
          </span>
        </div>

        {/* Upload Access Control Setting */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl w-full cursor-default"
        >
          <div className="text-left">
            <span className="text-xs font-bold text-slate-800 block">
              Pengaturan Akses Berkas yang Diunggah:
            </span>
            <span className="text-[11px] text-slate-500">
              Tentukan apakah file ini boleh diakses publik di menu "Pusat Unduhan & Media"
            </span>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs shrink-0">
            <button
              type="button"
              onClick={() => setUploadAsPublic(true)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                uploadAsPublic
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Publik di Unduhan</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadAsPublic(false)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                !uploadAsPublic
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privat (Sembunyikan)</span>
            </button>
          </div>
        </div>

        {uploadProgress && (
          <div className="mt-4 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>{uploadProgress}</span>
          </div>
        )}
      </div>

      {/* Alert Banners */}
      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{uploadError}</div>
          <button onClick={() => setUploadError(null)} className="text-rose-400 hover:text-rose-600">
            &times;
          </button>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Search, Filter Tabs & Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua', count: mediaList.length },
            { id: 'image', label: '🖼️ Gambar', count: mediaList.filter((m) => m.type === 'image').length },
            { id: 'video', label: '🎥 Video', count: mediaList.filter((m) => m.type === 'video').length },
            { id: 'audio', label: '🎵 Audio', count: mediaList.filter((m) => m.type === 'audio').length },
            { id: 'document', label: '📄 Dokumen', count: mediaList.filter((m) => m.type === 'document').length },
            { id: 'archive', label: '📦 Arsip', count: mediaList.filter((m) => m.type === 'archive').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedType === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedType === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama file..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="name">Nama (A-Z)</option>
              <option value="size">Ukuran (Besar)</option>
            </select>
          </div>

          {/* Visibility Quick Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                visibilityFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setVisibilityFilter('public')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                visibilityFilter === 'public'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Hanya tampilkan file publik yang muncul di Pusat Unduhan"
            >
              <Globe className="w-3 h-3" />
              <span>Publik</span>
            </button>
            <button
              onClick={() => setVisibilityFilter('private')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                visibilityFilter === 'private'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Hanya tampilkan file privat (tersembunyi dari Pusat Unduhan)"
            >
              <Lock className="w-3 h-3" />
              <span>Privat</span>
            </button>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleBulkSetVisibility(true)}
                title="Tampilkan file yang dipilih di Pusat Unduhan & Media"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Jadikan Publik</span>
              </button>
              <button
                onClick={() => handleBulkSetVisibility(false)}
                title="Sembunyikan file yang dipilih dari Pusat Unduhan & Media"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Jadikan Privat</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus ({selectedIds.size})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media Grid Cards */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <h4 className="font-semibold text-slate-700 text-sm">Tidak ada file media ditemukan</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tidak ada file yang sesuai kriteria pencarian. Unggah file baru menggunakan kotak di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredList.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const canPreview = canBrowserPreviewDirectly(item.type, item.extension);

            return (
              <div
                key={item.id}
                className={`group bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col overflow-hidden ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/90'
                }`}
              >
                {/* Thumbnail Preview Area */}
                <div
                  onClick={() => setPreviewItem(item)}
                  className="relative w-full aspect-video bg-slate-100 flex items-center justify-center cursor-pointer overflow-hidden border-b border-slate-100"
                >
                  {item.type === 'image' && (item.dataUrl || item.id) ? (
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : item.type === 'video' ? (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-3 text-center group-hover:bg-slate-950 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      </div>
                      <span className="text-[11px] font-semibold text-purple-200 mt-2">
                        Klik untuk Putar Video
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      {getMediaIcon(item.type, item.extension)}
                      <span className="text-xs font-mono font-bold uppercase text-slate-600 mt-1">
                        .{item.extension}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white uppercase tracking-wider">
                      {item.extension}
                    </span>
                    {item.isPreset && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-600/80 backdrop-blur-xs text-[9px] font-medium text-white">
                        Bawaan
                      </span>
                    )}
                  </div>

                  {/* Multi-select Checkbox */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = new Set(selectedIds);
                      if (updated.has(item.id)) {
                        updated.delete(item.id);
                      } else {
                        updated.add(item.id);
                      }
                      setSelectedIds(updated);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/90 backdrop-blur-xs border border-slate-300 flex items-center justify-center hover:bg-white cursor-pointer shadow-xs"
                  >
                    {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                  </div>

                  {/* Hover Overlay with Preview prompt */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 text-xs font-semibold shadow-md inline-flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Preview File
                    </span>
                  </div>
                </div>

                {/* Card Content & Metadata */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4
                      className="text-xs font-bold text-slate-800 truncate mb-1 hover:text-blue-600 cursor-pointer"
                      title={item.originalName}
                      onClick={() => setPreviewItem(item)}
                    >
                      {item.originalName}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{formatFileSize(item.size)}</span>
                      <span>{item.uploadDate.split(' ')[0]}</span>
                    </div>

                    {/* Visibility Access Badge */}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleVisibility(item, e)}
                        title={
                          item.isPublic === false
                            ? 'Status: PRIVAT (Tersembunyi dari Pusat Unduhan). Klik untuk jadikan Publik!'
                            : 'Status: PUBLIK (Muncul di Pusat Unduhan). Klik untuk jadikan Privat!'
                        }
                        className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-between gap-1 ${
                          item.isPublic === false
                            ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          {item.isPublic === false ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">Privat (Hanya Admin)</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">Publik di Unduhan</span>
                            </>
                          )}
                        </div>
                        <span className="text-[9px] underline opacity-75 font-normal shrink-0">Ubah</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat / Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Unduh File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyTag(item)}
                        className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Salin Kode Sematan / Link"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, item.originalName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Browser Preview Modal */}
      <MediaPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />

      {/* Single Item Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Hapus Berkas Media"
          message={`Apakah Anda yakin ingin menghapus file "${deleteTarget.name}" dari Universal Media Library? Berkas ini tidak akan dapat diakses lagi dari berita.`}
          confirmText="Ya, Hapus File"
          cancelText="Batal"
          isDestructive={true}
          onConfirm={handleConfirmSingleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Bulk Delete Confirm Modal */}
      {showBulkDeleteConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Hapus Masal Berkas Media"
          message={`Apakah Anda yakin ingin menghapus ${selectedIds.size} file terpilih dari Universal Media Library? Tindakan ini akan menghapus semua file yang dipilih secara permanen.`}
          confirmText={`Hapus ${selectedIds.size} File Terpilih`}
          cancelText="Batal"
          isDestructive={true}
          onConfirm={handleConfirmBulkDelete}
          onCancel={() => setShowBulkDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
