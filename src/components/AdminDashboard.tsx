import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  Eye,
  TrendingUp,
  HardDrive,
  CheckCircle,
  Clock,
  Plus,
  Upload,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  School,
  ShieldCheck,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import { SchoolIdentity, AdminUser, NewsArticle, MediaItem } from '../types';
import {
  getAllArticles,
  getAllMedia,
  clearAdminSession
} from '../services/storage';
import { formatFileSize } from '../utils/fileValidation';
import UniversalMediaLibrary from './UniversalMediaLibrary';
import NewsManager from './NewsManager';
import AppearanceCustomizer from './AppearanceCustomizer';
import SchoolSettingsEditor from './SchoolSettingsEditor';
import AdminSecuritySettings from './AdminSecuritySettings';
import AdminGraduationManager from './AdminGraduationManager';

interface AdminDashboardProps {
  adminUser: AdminUser;
  schoolIdentity: SchoolIdentity;
  onUpdateIdentity: (updated: SchoolIdentity) => void;
  onLogout: () => void;
  onGoToPublic: () => void;
  onViewPublicArticle?: (article: NewsArticle) => void;
  onUpdateUser?: (updated: AdminUser) => void;
}

export default function AdminDashboard({
  adminUser,
  schoolIdentity,
  onUpdateIdentity,
  onLogout,
  onGoToPublic,
  onViewPublicArticle,
  onUpdateUser
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'media' | 'graduation' | 'appearance' | 'settings' | 'security'>('overview');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const [artList, medList] = await Promise.all([getAllArticles(), getAllMedia()]);
      setArticles(artList);
      setMediaList(medList);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  // Derived metrics
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;
  const totalViews = articles.reduce((acc, cur) => acc + (cur.views || 0), 0);
  const totalStorage = mediaList.reduce((acc, cur) => acc + cur.size, 0);

  const imagesCount = mediaList.filter((m) => m.type === 'image').length;
  const videosCount = mediaList.filter((m) => m.type === 'video').length;
  const audiosCount = mediaList.filter((m) => m.type === 'audio').length;
  const docsCount = mediaList.filter((m) => m.type === 'document').length;
  const archivesCount = mediaList.filter((m) => m.type === 'archive').length;

  const handleLogoutClick = () => {
    clearAdminSession();
    onLogout();
  };

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white leading-tight truncate">
                  Panel Admin Sekolah
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                  {adminUser.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                {schoolIdentity.schoolName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoToPublic}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors inline-flex items-center gap-1.5"
              title="Buka Website Publik Sekolah"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Lihat Website</span>
            </button>
            <button
              onClick={handleLogoutClick}
              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold rounded-lg border border-rose-500/30 transition-colors inline-flex items-center gap-1.5"
              title="Keluar dari Panel Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 scrollbar-none">
          {[
            { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
            { id: 'news', label: 'Publikasi Berita', icon: FileText, badge: articles.length },
            { id: 'media', label: 'Universal Media Library', icon: FolderOpen, badge: mediaList.length },
            { id: 'graduation', label: 'Pengumuman Kelulusan', icon: GraduationCap },
            { id: 'appearance', label: 'Tampilan & Branding', icon: Palette },
            { id: 'settings', label: 'Identitas Sekolah', icon: Settings },
            { id: 'security', label: 'Keamanan & Akun', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Portal Publikasi Sekolah Terpadu</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Halo, {adminUser.name || 'Administrator'}!
                </h2>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                  Kelola konten berita, publikasikan dokumen pendaftaran (PDF, Word, Excel, PPT), upload audio mars dan video profil, serta sesuaikan logo dan latar belakang website sekolah Anda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('news')}
                  className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Tulis Berita Baru</span>
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className="px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold rounded-xl border border-white/20 transition-all inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Media</span>
                </button>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Published News */}
              <div
                onClick={() => setActiveTab('news')}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Berita Terbit
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{publishedCount}</span>
                  <span className="text-xs text-slate-400 font-medium">Artikel Aktif</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Draf tersimpan: {draftCount}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              {/* Total Universal Media */}
              <div
                onClick={() => setActiveTab('media')}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Media Tersimpan
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{mediaList.length}</span>
                  <span className="text-xs text-slate-400 font-medium">Semua Jenis File</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{imagesCount} Foto • {docsCount} Dok</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              {/* Storage Meter */}
              <div
                onClick={() => setActiveTab('media')}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Kapasitas Terpakai
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HardDrive className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {formatFileSize(totalStorage)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Lokal Browser DB</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-emerald-600 font-semibold">Keamanan Terverifikasi</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              {/* Total Readers */}
              <div
                onClick={() => setActiveTab('news')}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Pembaca
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{totalViews}</span>
                  <span className="text-xs text-slate-400 font-medium">Tayangan Berita</span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Prestasi & Pengumuman</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </div>

            {/* Media Type Breakdown Cards */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span>Rincian Universal Media Terpasang</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                  <span className="text-lg">🖼️</span>
                  <p className="text-xs font-bold text-emerald-900 mt-1">Gambar</p>
                  <p className="text-xs text-emerald-700 font-mono">{imagesCount} file</p>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-center">
                  <span className="text-lg">🎥</span>
                  <p className="text-xs font-bold text-purple-900 mt-1">Video</p>
                  <p className="text-xs text-purple-700 font-mono">{videosCount} file</p>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-center">
                  <span className="text-lg">🎵</span>
                  <p className="text-xs font-bold text-amber-900 mt-1">Audio</p>
                  <p className="text-xs text-amber-700 font-mono">{audiosCount} file</p>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                  <span className="text-lg">📄</span>
                  <p className="text-xs font-bold text-blue-900 mt-1">Dokumen</p>
                  <p className="text-xs text-blue-700 font-mono">{docsCount} file</p>
                </div>
                <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 text-center">
                  <span className="text-lg">📦</span>
                  <p className="text-xs font-bold text-orange-900 mt-1">Arsip ZIP</p>
                  <p className="text-xs text-orange-700 font-mono">{archivesCount} file</p>
                </div>
              </div>
            </div>

            {/* Recent Publications & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Articles */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Publikasi Sekolah Terbaru</h3>
                  <button
                    onClick={() => setActiveTab('news')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Kelola Semua →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {articles.slice(0, 4).map((art) => (
                    <div
                      key={art.id}
                      className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {art.category}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              art.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            ● {art.status === 'published' ? 'Terbit' : 'Draf'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{art.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          {art.createdAt.split(' ')[0]} • Oleh {art.author}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onViewPublicArticle && (
                          <button
                            onClick={() => onViewPublicArticle(art)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                            title="Buka Halaman Publik"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab('news')}
                          className="text-xs font-semibold text-blue-600 hover:underline px-2 py-1"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Pintasan Cepat</h3>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveTab('appearance')}
                    className="w-full p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-left flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Ganti Logo & Background</h4>
                      <p className="text-[10px] text-slate-500">Live Preview tampilan website</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Identitas Sekolah & NPSN</h4>
                      <p className="text-[10px] text-slate-500">Ubah alamat, kontak, visi-misi</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('media')}
                    className="w-full p-3 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-xl text-left flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Upload Dokumen SPMB</h4>
                      <p className="text-[10px] text-slate-500">PDF formulir & berkas pendaftaran</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('security')}
                    className="w-full p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-xl text-left flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Keamanan & Sandi Login</h4>
                      <p className="text-[10px] text-slate-500">Ubah username & password admin</p>
                    </div>
                  </button>

                  <button
                    onClick={onGoToPublic}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-left flex items-center justify-between transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold">Kunjungi Portal Publik</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Publikasi Berita */}
        {activeTab === 'news' && (
          <div className="animate-fade-in">
            <NewsManager onViewPublicArticle={onViewPublicArticle} />
          </div>
        )}

        {/* Tab 3: Universal Media Library */}
        {activeTab === 'media' && (
          <div className="animate-fade-in">
            <UniversalMediaLibrary />
          </div>
        )}

        {/* Tab: Pengumuman Kelulusan */}
        {activeTab === 'graduation' && (
          <div className="animate-fade-in">
            <AdminGraduationManager schoolIdentity={schoolIdentity} />
          </div>
        )}

        {/* Tab 4: Tampilan & Branding */}
        {activeTab === 'appearance' && (
          <div className="animate-fade-in">
            <AppearanceCustomizer
              currentIdentity={schoolIdentity}
              onUpdateIdentity={onUpdateIdentity}
            />
          </div>
        )}

        {/* Tab 5: Pengaturan Identitas */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <SchoolSettingsEditor
              identity={schoolIdentity}
              onUpdateIdentity={onUpdateIdentity}
            />
          </div>
        )}

        {/* Tab 6: Pengaturan Akun & Keamanan */}
        {activeTab === 'security' && (
          <div className="animate-fade-in">
            <AdminSecuritySettings
              adminUser={adminUser}
              onUpdateUser={onUpdateUser}
            />
          </div>
        )}
      </main>
    </div>
  );
}
