import { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  User,
  Eye,
  Paperclip,
  ArrowRight,
  Sparkles,
  Download,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
  Volume2,
  Bell,
  Clock,
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { NewsArticle, NewsCategory, SchoolIdentity, MediaItem } from '../types';
import { getAllArticles, getAllMedia, getCommentsCountMap } from '../services/storage';
import { subscribeToRemoteArticles } from '../services/firebaseSync';

interface PublicHomeProps {
  schoolIdentity: SchoolIdentity;
  onSelectArticle: (article: NewsArticle) => void;
  onNavigate: (page: 'home' | 'news' | 'downloads' | 'profile' | 'graduation') => void;
}

export default function PublicHome({
  schoolIdentity,
  onSelectArticle,
  onNavigate
}: PublicHomeProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [arts, media, comms] = await Promise.all([
          getAllArticles(),
          getAllMedia(),
          getCommentsCountMap()
        ]);
        if (isMounted) {
          // Only show published articles to public
          const published = arts.filter((a) => a.status === 'published');
          setArticles(published);
          setMediaList(media);
          setCommentsMap(comms);
        }
      } catch (err) {
        console.error('Failed to load public data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();

    // Real-time listener: when Device A publishes an article, Device B updates immediately
    const unsub = subscribeToRemoteArticles((updatedArticles) => {
      if (isMounted) {
        const published = updatedArticles.filter((a) => a.status === 'published');
        setArticles(published);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const featuredArticle = articles.length > 0 ? articles[0] : null;

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
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

  const quickDocuments = mediaList
    .filter((m) => m.type === 'document' || m.type === 'archive')
    .slice(0, 4);

  const { theme } = schoolIdentity;

  return (
    <div id="public-home-view" className="space-y-12 pb-16 animate-fade-in">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-12 pb-16 sm:py-20 text-center"
        style={{
          backgroundColor: theme.bgType === 'color' ? theme.bgColor : undefined
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 border border-slate-200 shadow-xs">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme.accentColor }}
            />
            <span>{schoolIdentity.portalBadge || `SPMB 2026/2027 Resmi Dibuka • Akreditasi ${schoolIdentity.accreditation}`}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {schoolIdentity.portalTitle ? (
              <span>{schoolIdentity.portalTitle}</span>
            ) : (
              <>
                Portal Informasi & Warta Resmi{' '}
                <span
                  className="block sm:inline"
                  style={{ color: theme.accentColor }}
                >
                  {schoolIdentity.schoolName}
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {schoolIdentity.tagline}
          </p>

          {/* Quick Hero Actions */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('graduation')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-transform hover:scale-105 inline-flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Pengumuman Kelulusan Siswa</span>
            </button>

            <button
              onClick={() => onNavigate('news')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-transform hover:scale-105 inline-flex items-center gap-2"
              style={{ backgroundColor: theme.accentColor }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Jelajahi Warta Sekolah</span>
            </button>

            <button
              onClick={() => onNavigate('downloads')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Unduh Formulir SPMB</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area: Headline + Articles Grid + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Featured Headline Banner */}
        {featuredArticle && (
          <div
            onClick={() => onSelectArticle(featuredArticle)}
            className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-7 aspect-video lg:aspect-auto relative overflow-hidden bg-slate-900/5">
              {featuredArticle.featuredImageUrl ? (
                <img
                  src={featuredArticle.featuredImageUrl}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <BookOpen className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span
                  className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-xs"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  Sorotan Utama • {featuredArticle.category}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{featuredArticle.publishedAt || featuredArticle.createdAt}</span>
                  </span>
                  <span>•</span>
                  <span>Oleh {featuredArticle.author}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {featuredArticle.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{featuredArticle.views} Dibaca</span>
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{commentsMap[featuredArticle.id] || 0} Komentar</span>
                  </span>
                </div>
                <span
                  className="inline-flex items-center gap-1 transition-transform group-hover:translate-x-1"
                  style={{ color: theme.accentColor }}
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading with Search & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Publikasi & Kabar Sekolah Terbaru</h2>
              <p className="text-xs text-slate-500">
                Informasi aktual mengenai kegiatan belajar mengajar, lomba prestasi, dan edaran dinas.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berita..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Semua Kategori' },
              { id: 'Pengumuman', label: 'Pengumuman' },
              { id: 'Prestasi', label: 'Prestasi' },
              { id: 'Akademik', label: 'Akademik' },
              { id: 'Kegiatan', label: 'Kegiatan' },
              { id: 'Ekstrakurikuler', label: 'Ekstrakurikuler' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: theme.accentColor } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid: Articles (Left 8 cols) + Sidebar (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Articles Grid */}
          <div className="lg:col-span-8 space-y-6">
            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <h4 className="font-bold text-slate-700 text-sm">Tidak ada berita ditemukan</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Coba kata kunci lain atau pilih filter kategori lainnya.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredArticles.map((article) => {
                  const attachedCount = article.attachedMediaIds?.length || 0;

                  return (
                    <div
                      key={article.id}
                      onClick={() => onSelectArticle(article)}
                      className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-slate-100 overflow-hidden">
                          {article.featuredImageUrl ? (
                            <img
                              src={article.featuredImageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <BookOpen className="w-10 h-10" />
                            </div>
                          )}

                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                            {article.category}
                          </span>

                          {attachedCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-blue-600/90 backdrop-blur-xs text-[10px] font-bold text-white inline-flex items-center gap-1 shadow-xs">
                              <Paperclip className="w-3 h-3" />
                              <span>{attachedCount}</span>
                            </span>
                          )}
                        </div>

                        {/* Article Text */}
                        <div className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{article.publishedAt?.split(' ')[0] || article.createdAt.split(' ')[0]}</span>
                            <span>•</span>
                            <span>{article.author}</span>
                          </div>

                          <h3
                            className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                            title={article.title}
                          >
                            {article.title}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{article.views}</span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{commentsMap[article.id] || 0}</span>
                          </span>
                        </div>
                        <span
                          className="font-bold inline-flex items-center group-hover:translate-x-0.5 transition-transform"
                          style={{ color: theme.accentColor }}
                        >
                          Baca Artikel →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Downloads Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Unduhan Berkas Resmi</span>
                </h3>
                <button
                  onClick={() => onNavigate('downloads')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Semua
                </button>
              </div>

              <div className="space-y-2.5">
                {quickDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onNavigate('downloads')}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h5
                          className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600"
                          title={doc.originalName}
                        >
                          {doc.originalName}
                        </h5>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          .{doc.extension}
                        </span>
                      </div>
                    </div>

                    <span className="p-1 text-slate-400 group-hover:text-blue-600">
                      <Download className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* School Quick Contacts */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Layanan Informasi Sekolah</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Butuh bantuan terkait SPMB atau informasi kurikulum? Hubungi staf humas kami:
              </p>
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1">
                <span className="text-slate-500 block">Nomor Telepon / WhatsApp:</span>
                <span className="font-bold text-blue-900 text-sm font-mono block">
                  {schoolIdentity.phone}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Jam Kerja: Senin - Jumat (07.30 - 15.30 WIB)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
