import { useState, useEffect } from 'react';
import {
  Download,
  Search,
  Filter,
  Eye,
  FileText,
  Music,
  Video,
  Archive,
  Image as ImageIcon,
  FolderDown,
  ShieldCheck,
  HardDrive,
  Play
} from 'lucide-react';
import { MediaItem, MediaType, SchoolIdentity } from '../types';
import { getAllMedia } from '../services/storage';
import { formatFileSize, canBrowserPreviewDirectly } from '../utils/fileValidation';
import MediaPreviewModal from './MediaPreviewModal';

interface PublicMediaArchiveProps {
  schoolIdentity: SchoolIdentity;
}

export default function PublicMediaArchive({ schoolIdentity }: PublicMediaArchiveProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        const items = await getAllMedia();
        setMediaList(items);
      } catch (err) {
        console.error('Failed to load public media', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const filteredMedia = mediaList.filter((item) => {
    // Restrict access: items marked as not public / private by admin will not appear in Pusat Unduhan & Media
    if (item.isPublic === false || item.accessLevel === 'private') {
      return false;
    }
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.originalName.toLowerCase().includes(q) ||
        item.extension.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getMediaIcon = (type: MediaType, ext: string) => {
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
        if (ext === 'pdf') return <FileText className="w-6 h-6 text-rose-600" />;
        return <FileText className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div id="public-media-archive-view" className="py-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title & Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-3.5 py-1 rounded-full text-xs font-bold border border-blue-200">
            <FolderDown className="w-4 h-4 text-blue-600" />
            <span>Pusat Berkas & Media Sekolah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Repositori Dokumen & Media Resmi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Akses dan unduh formulir pendaftaran SPMB, kalender asesmen sumatif, silabus pembelajaran, audio mars sekolah, video profil, dan arsip panduan siswa secara mudah dan aman.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Semua Berkas' },
              { id: 'document', label: '📄 Dokumen & PDF' },
              { id: 'archive', label: '📦 Arsip ZIP/RAR' },
              { id: 'audio', label: '🎵 Audio Mars' },
              { id: 'video', label: '🎥 Video Liputan' },
              { id: 'image', label: '🖼️ Galeri Foto' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedType === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama dokumen atau berkas..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Media Grid Cards */}
        {filteredMedia.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
            <FolderDown className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <h4 className="font-bold text-slate-700 text-sm">Tidak ada berkas yang sesuai</h4>
            <p className="text-xs text-slate-400 mt-1">
              Silakan periksa kata kunci pencarian atau ganti filter kategori di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMedia.map((item) => {
              const canPreview = canBrowserPreviewDirectly(item.type, item.extension);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {getMediaIcon(item.type, item.extension)}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          .{item.extension}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 font-mono">
                          {formatFileSize(item.size)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug hover:text-blue-600 cursor-pointer"
                        title={item.originalName}
                        onClick={() => setPreviewItem(item)}
                      >
                        {item.originalName}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.description ||
                          `Berkas publikasi resmi ${item.extension.toUpperCase()} dari ${schoolIdentity.schoolName}.`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1.5 transition-colors"
                    >
                      {item.type === 'video' ? (
                        <>
                          <Play className="w-4 h-4 text-purple-600 fill-purple-600" />
                          <span className="text-purple-700 font-bold">Putar Video</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Lihat Preview</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security & Verification Banner */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">Semua File Terverifikasi & Bebas Malware</h4>
              <p className="text-[11px] text-slate-400">
                Sistem secara otomatis memvalidasi jenis file dan menolak file berisiko tinggi (.exe, script berbahaya).
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400 shrink-0">
            Status Repositori: Aktif & Aman
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <MediaPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}
