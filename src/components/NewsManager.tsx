import { useState, useEffect, FormEvent } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileCheck,
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Paperclip,
  Calendar,
  User,
  ArrowLeft,
  Share2,
  X,
  ExternalLink,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { NewsArticle, NewsCategory, ArticleStatus, MediaItem } from '../types';
import { getAllArticles, saveArticle, deleteArticle, getAllMedia, getCommentsCountMap } from '../services/storage';
import { subscribeToRemoteArticles } from '../services/firebaseSync';
import MediaLibraryModal from './MediaLibraryModal';
import ConfirmModal from './ConfirmModal';

const CATEGORIES: NewsCategory[] = [
  'Pengumuman',
  'Akademik',
  'Prestasi',
  'Kegiatan',
  'Ekstrakurikuler',
  'Agenda'
];

interface NewsManagerProps {
  onViewPublicArticle?: (article: NewsArticle) => void;
}

export default function NewsManager({ onViewPublicArticle }: NewsManagerProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<NewsArticle>>({});
  const [showFeaturedImagePicker, setShowFeaturedImagePicker] = useState(false);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);

  // Deletion modal state & toast
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const [artList, mediaList, commMap] = await Promise.all([
        getAllArticles(),
        getAllMedia(),
        getCommentsCountMap()
      ]);
      setArticles(artList);
      setAllMedia(mediaList);
      setCommentsMap(commMap);
    } catch (err) {
      console.error('Failed to load articles', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();

    // Listen for real-time article changes from other devices
    const unsub = subscribeToRemoteArticles((updatedList) => {
      setArticles(updatedList);
      setIsLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

  const handleCreateNew = () => {
    setEditingArticle({
      id: `art-${Date.now()}`,
      title: '',
      slug: '',
      status: 'published',
      category: 'Pengumuman',
      excerpt: '',
      content: '',
      author: 'Admin Sekolah',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      publishedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      views: 0,
      attachedMediaIds: []
    });
    setIsEditing(true);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle({ ...article });
    setIsEditing(true);
  };

  const handleDelete = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteArticle(deleteTarget.id);
      await fetchArticles();
      setToastMessage(`Berita "${deleteTarget.title}" berhasil dihapus.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to delete article', err);
      setToastMessage('Gagal menghapus berita.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!editingArticle.title?.trim()) {
      setFormError('Judul berita wajib diisi.');
      return;
    }

    const slug =
      editingArticle.slug ||
      editingArticle.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const articleToSave: NewsArticle = {
      id: editingArticle.id || `art-${Date.now()}`,
      title: editingArticle.title,
      slug,
      status: editingArticle.status || 'published',
      category: editingArticle.category || 'Pengumuman',
      excerpt: editingArticle.excerpt || '',
      content: editingArticle.content || '',
      featuredImageUrl: editingArticle.featuredImageUrl,
      featuredMediaId: editingArticle.featuredMediaId,
      author: editingArticle.author || 'Admin Sekolah',
      createdAt: editingArticle.createdAt || now,
      updatedAt: now,
      publishedAt: editingArticle.status === 'published' ? editingArticle.publishedAt || now : undefined,
      views: editingArticle.views || 0,
      attachedMediaIds: editingArticle.attachedMediaIds || []
    };

    try {
      await saveArticle(articleToSave);
      await fetchArticles();
      setIsEditing(false);
      setEditingArticle({});
      setToastMessage('Berita berhasil disimpan.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save article', err);
      setFormError('Gagal menyimpan berita. Silakan coba kembali.');
    }
  };

  const toggleStatus = async (article: NewsArticle) => {
    const nextStatus: ArticleStatus = article.status === 'published' ? 'draft' : 'published';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated: NewsArticle = {
      ...article,
      status: nextStatus,
      updatedAt: now,
      publishedAt: nextStatus === 'published' ? article.publishedAt || now : undefined
    };

    try {
      await saveArticle(updated);
      await fetchArticles();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  // Filtered List
  const filteredArticles = articles.filter((art) => {
    if (filterCategory !== 'all' && art.category !== filterCategory) return false;
    if (filterStatus !== 'all' && art.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        art.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryBadgeClass = (category: NewsCategory) => {
    switch (category) {
      case 'Pengumuman':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Prestasi':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Akademik':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Kegiatan':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Ekstrakurikuler':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // ----------------- FORM VIEW (EDITOR) -----------------
  if (isEditing) {
    const attachedMediaList = allMedia.filter((m) =>
      editingArticle.attachedMediaIds?.includes(m.id)
    );

    return (
      <div id="news-editor-container" className="space-y-6">
        {/* Editor Top Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingArticle.id ? 'Sunting Berita Sekolah' : 'Tulis Publikasi Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi rincian berita, pilih gambar unggulan, dan lampirkan dokumen/media terkait.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              form="news-form"
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              <span>Simpan & Publikasikan</span>
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
            <span className="font-semibold">{formError}</span>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="p-1 text-rose-600 hover:text-rose-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Editor Form */}
        <form id="news-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (Title, Excerpt, Content) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Berita / Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="Contoh: Seleksi Penerimaan Murid Baru (SPMB) 2026/2027 Resmi Dibuka"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ringkasan Singkat (Excerpt)
                </label>
                <textarea
                  rows={3}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, excerpt: e.target.value })
                  }
                  placeholder="Ringkasan 1-2 kalimat yang tampil di kartu berita beranda..."
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Isi Lengkap Berita (Mendukung Format Teks & Paragraf)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Gunakan baris baru untuk paragraf, ### untuk subjudul
                  </span>
                </div>
                <textarea
                  rows={14}
                  required
                  value={editingArticle.content || ''}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, content: e.target.value })
                  }
                  placeholder="Tuliskan berita lengkap sekolah di sini..."
                  className="w-full p-4 text-xs font-sans leading-relaxed bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Attached Universal Media Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span>Media & Dokumen Terlampir dalam Berita</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    File ini akan muncul di artikel publik (misal: PDF formulir, Audio mars, Video kegiatan, file Word).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAttachmentPicker(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lampirkan File</span>
                </button>
              </div>

              {attachedMediaList.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  Belum ada file media yang dilampirkan. Klik "Lampirkan File" untuk memilih dari Universal Media Library.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachedMediaList.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600">
                          {m.type === 'document' ? (
                            <FileText className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Paperclip className="w-4 h-4 text-blue-500" />
                          )}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate" title={m.originalName}>
                            {m.originalName}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase">
                            .{m.extension} • {m.type}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingArticle.attachedMediaIds || []).filter(
                            (id) => id !== m.id
                          );
                          setEditingArticle({ ...editingArticle, attachedMediaIds: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Lepas lampiran"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Settings Column */}
          <div className="space-y-6">
            {/* Publication Status & Meta */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Status Publikasi
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingArticle.status || 'published'}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      status: e.target.value as ArticleStatus
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="published">Terbit (Ditampilkan ke Publik)</option>
                  <option value="draft">Draf (Disimpan Internal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                <select
                  value={editingArticle.category || 'Pengumuman'}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      category: e.target.value as NewsCategory
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penulis / Bagian
                </label>
                <input
                  type="text"
                  value={editingArticle.author || ''}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, author: e.target.value })
                  }
                  placeholder="Misal: Humas SMAN 1 Teladan"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Featured Image Picker */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Gambar Utama Berita</span>
                {editingArticle.featuredImageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingArticle({
                        ...editingArticle,
                        featuredImageUrl: undefined,
                        featuredMediaId: undefined
                      })
                    }
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Hapus
                  </button>
                )}
              </h3>

              {editingArticle.featuredImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 group aspect-video bg-slate-100">
                  <img
                    src={editingArticle.featuredImageUrl}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={() => setShowFeaturedImagePicker(true)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-semibold"
                  >
                    Ganti Gambar
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setShowFeaturedImagePicker(true)}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50"
                >
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Pilih Gambar Utama</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dari Universal Media Library
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Featured Image Selector Modal */}
        <MediaLibraryModal
          isOpen={showFeaturedImagePicker}
          onClose={() => setShowFeaturedImagePicker(false)}
          allowedTypes={['image']}
          title="Pilih Gambar Utama untuk Berita"
          onSelect={(item) => {
            setEditingArticle({
              ...editingArticle,
              featuredImageUrl: item.dataUrl || item.name,
              featuredMediaId: item.id
            });
          }}
        />

        {/* Attachment Selector Modal */}
        <MediaLibraryModal
          isOpen={showAttachmentPicker}
          onClose={() => setShowAttachmentPicker(false)}
          title="Pilih Media / Dokumen untuk Dilampirkan"
          onSelect={(item) => {
            const currentIds = editingArticle.attachedMediaIds || [];
            if (!currentIds.includes(item.id)) {
              setEditingArticle({
                ...editingArticle,
                attachedMediaIds: [...currentIds, item.id]
              });
            }
          }}
        />
      </div>
    );
  }

  // ----------------- LIST VIEW -----------------
  return (
    <div id="news-manager-view" className="space-y-6">
      {/* Header with Stats & Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">Kelola Publikasi & Berita</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {articles.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Publikasikan pengumuman sekolah, prestasi siswa, liputan kegiatan, dan jadwal akademik.
          </p>
        </div>

        <button
          id="btn-add-news"
          onClick={handleCreateNew}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'published', label: 'Terbit' },
            { id: 'draft', label: 'Draf' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[280px]">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul berita..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <h4 className="font-semibold text-slate-700 text-sm">Tidak ada berita yang ditemukan</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Belum ada publikasi berita yang sesuai dengan filter. Klik tombol "Tulis Berita Baru" untuk mulai membuat publikasi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((article) => {
            const isPublished = article.status === 'published';
            const attachedCount = article.attachedMediaIds?.length || 0;

            return (
              <div
                key={article.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {article.featuredImageUrl ? (
                      <img
                        src={article.featuredImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryBadgeClass(
                          article.category
                        )}`}
                      >
                        {article.category}
                      </span>
                      <button
                        onClick={() => toggleStatus(article)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Klik untuk ubah status Draf / Terbit"
                      >
                        {isPublished ? '● Terbit' : '○ Draf'}
                      </button>
                      {attachedCount > 0 && (
                        <span className="text-[10px] text-slate-500 inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                          <Paperclip className="w-3 h-3 text-blue-600" />
                          <span>{attachedCount} Lampiran</span>
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => handleEdit(article)}
                      className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                      title={article.title}
                    >
                      {article.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {article.author}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {article.createdAt.split(' ')[0]}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {article.views} dibaca
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600">
                        <MessageSquare className="w-3 h-3" /> {commentsMap[article.id] || 0} komentar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {onViewPublicArticle && (
                    <button
                      onClick={() => onViewPublicArticle(article)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Lihat Tampilan Publik"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Edit Berita"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id, article.title)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Hapus Berita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Hapus Berita"
          message={`Apakah Anda yakin ingin menghapus berita "${deleteTarget.title}"? Publikasi ini akan dihapus dari website dan tidak dapat dipulihkan.`}
          confirmText="Ya, Hapus Berita"
          cancelText="Batal"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
