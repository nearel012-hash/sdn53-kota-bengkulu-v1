import { useState, useEffect } from 'react';
import {
  SchoolIdentity,
  AdminUser,
  NewsArticle
} from './types';
import {
  initializeDatabase,
  getSchoolIdentity,
  getAdminSession,
  DEFAULT_SCHOOL_IDENTITY
} from './services/storage';
import { subscribeToRemoteSchoolIdentity } from './services/firebaseSync';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PublicHome from './components/PublicHome';
import PublicArticleDetail from './components/PublicArticleDetail';
import PublicMediaArchive from './components/PublicMediaArchive';
import PublicProfile from './components/PublicProfile';
import PublicGraduation from './components/PublicGraduation';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentity>(DEFAULT_SCHOOL_IDENTITY);
  const [adminUser, setAdminUser] = useState<AdminUser>({
    isAuthenticated: false,
    username: '',
    name: 'Administrator',
    role: 'admin'
  });

  // Navigation states
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [publicPage, setPublicPage] = useState<'home' | 'news' | 'downloads' | 'profile' | 'graduation'>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Initialize DB & load settings on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        const settings = await getSchoolIdentity();
        setSchoolIdentity(settings);
        const session = getAdminSession();
        setAdminUser(session);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsInitialized(true);
      }
    };
    init();

    // Listen to real-time changes from other devices via Firebase
    const unsub = subscribeToRemoteSchoolIdentity((cloudIdentity) => {
      if (cloudIdentity && cloudIdentity.schoolName) {
        setSchoolIdentity((prev) => ({
          ...prev,
          ...cloudIdentity,
          theme: {
            ...prev.theme,
            ...(cloudIdentity.theme || {})
          }
        }));
      }
    });

    return () => {
      unsub();
    };
  }, []);

  const handleUpdateIdentity = (updated: SchoolIdentity) => {
    setSchoolIdentity(updated);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setViewMode('admin');
  };

  const handleLogout = () => {
    setAdminUser({
      isAuthenticated: false,
      username: '',
      name: 'Administrator',
      role: 'admin'
    });
    setViewMode('public');
  };

  const handleSelectArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: 'home' | 'news' | 'downloads' | 'profile' | 'graduation') => {
    setSelectedArticle(null);
    setPublicPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-base font-bold">Portal Publikasi Sekolah</h2>
          <p className="text-xs text-slate-400 mt-1">Menyiapkan penyimpanan media & sistem...</p>
        </div>
      </div>
    );
  }

  // ----------------- ADMIN DASHBOARD VIEW -----------------
  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        adminUser={adminUser}
        schoolIdentity={schoolIdentity}
        onUpdateIdentity={handleUpdateIdentity}
        onLogout={handleLogout}
        onGoToPublic={() => setViewMode('public')}
        onViewPublicArticle={(article) => {
          setSelectedArticle(article);
          setViewMode('public');
        }}
        onUpdateUser={(updated) => setAdminUser(updated)}
      />
    );
  }

  // ----------------- PUBLIC PORTAL VIEW -----------------
  const { theme } = schoolIdentity;

  return (
    <div
      id="public-portal-root"
      className="min-h-screen flex flex-col text-slate-800 relative selection:bg-blue-600 selection:text-white"
      style={{
        backgroundColor: theme.bgColor || '#f8fafc',
        backgroundImage:
          theme.bgType === 'image' && theme.bgImageUrl
            ? `url(${theme.bgImageUrl})`
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Image Overlay */}
      {theme.bgType === 'image' && theme.bgImageUrl && (
        <div
          className="fixed inset-0 bg-slate-900 pointer-events-none z-0"
          style={{ opacity: (theme.bgOverlayOpacity || 15) / 100 }}
        />
      )}

      {/* Mesh / Dot Pattern Overlay */}
      {theme.bgType === 'pattern' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-40"
          style={{
            backgroundImage:
              theme.bgPattern === 'dots'
                ? 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)'
                : theme.bgPattern === 'grid'
                ? 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)'
                : 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: theme.bgPattern === 'grid' ? '32px 32px' : '20px 20px'
          }}
        />
      )}

      {/* Main Content Container with relative Z-index */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation Bar */}
        <Navbar
          schoolIdentity={schoolIdentity}
          adminUser={adminUser}
          activePage={publicPage}
          onNavigate={handleNavigate}
          onOpenAdminLogin={() => setIsLoginModalOpen(true)}
          onGoToDashboard={() => setViewMode('admin')}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1">
          {selectedArticle ? (
            <PublicArticleDetail
              article={selectedArticle}
              schoolIdentity={schoolIdentity}
              adminUser={adminUser}
              onBack={() => setSelectedArticle(null)}
              onSelectArticle={handleSelectArticle}
            />
          ) : publicPage === 'home' || publicPage === 'news' ? (
            <PublicHome
              schoolIdentity={schoolIdentity}
              onSelectArticle={handleSelectArticle}
              onNavigate={handleNavigate}
            />
          ) : publicPage === 'graduation' ? (
            <PublicGraduation schoolIdentity={schoolIdentity} />
          ) : publicPage === 'downloads' ? (
            <PublicMediaArchive schoolIdentity={schoolIdentity} />
          ) : publicPage === 'profile' ? (
            <PublicProfile schoolIdentity={schoolIdentity} />
          ) : null}
        </main>

        {/* School Footer */}
        <Footer
          schoolIdentity={schoolIdentity}
          onNavigate={handleNavigate}
          onOpenAdminLogin={() => setIsLoginModalOpen(true)}
        />
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        schoolIdentity={schoolIdentity}
      />
    </div>
  );
}
