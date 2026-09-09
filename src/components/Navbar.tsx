import { useState } from 'react';
import {
  School,
  Menu,
  X,
  Lock,
  DownloadCloud,
  Home,
  BookOpen,
  Info,
  ShieldCheck,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { SchoolIdentity, AdminUser } from '../types';

interface NavbarProps {
  schoolIdentity: SchoolIdentity;
  adminUser: AdminUser;
  activePage: 'home' | 'news' | 'downloads' | 'profile' | 'graduation';
  onNavigate: (page: 'home' | 'news' | 'downloads' | 'profile' | 'graduation') => void;
  onOpenAdminLogin: () => void;
  onGoToDashboard: () => void;
}

export default function Navbar({
  schoolIdentity,
  adminUser,
  activePage,
  onNavigate,
  onOpenAdminLogin,
  onGoToDashboard
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logo, theme } = schoolIdentity;

  const getLogoShapeClass = () => {
    switch (logo.shape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-xl';
      default:
        return 'rounded-none';
    }
  };

  const navLinks = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'news', label: 'Berita & Pengumuman', icon: BookOpen },
    { id: 'graduation', label: 'Pengumuman Kelulusan', icon: GraduationCap },
    { id: 'downloads', label: 'Pusat Unduhan & Media', icon: DownloadCloud },
    { id: 'profile', label: 'Profil & Identitas', icon: Info }
  ] as const;

  return (
    <>
      {/* Top Admin Bar if Authenticated */}
      {adminUser.isAuthenticated && (
        <div className="bg-slate-900 text-white text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800 z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-300">
                Mode Admin Aktif ({adminUser.name})
              </span>
            </div>
            <button
              onClick={onGoToDashboard}
              className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[11px] shadow-xs transition-colors inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Buka Dashboard Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & School Name */}
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <div
                className={`overflow-hidden bg-white border border-slate-200/90 p-1 shadow-xs shrink-0 transition-transform group-hover:scale-105 ${getLogoShapeClass()}`}
                style={{ height: `${logo.height || 52}px`, width: `${logo.height || 52}px` }}
              >
                <img
                  src={logo.url}
                  alt={schoolIdentity.schoolName}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight group-hover:text-blue-700 transition-colors truncate max-w-[200px] sm:max-w-md">
                  {schoolIdentity.schoolName}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-md mt-0.5">
                  {schoolIdentity.tagline}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activePage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    style={isActive ? { backgroundColor: theme.accentColor } : {}}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}

              {/* Admin Button */}
              <div className="ml-2 pl-2 border-l border-slate-200">
                {adminUser.isAuthenticated ? (
                  <button
                    onClick={onGoToDashboard}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs inline-flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dashboard Admin</span>
                  </button>
                ) : (
                  <button
                    id="nav-login-admin-btn"
                    onClick={onOpenAdminLogin}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 hover:border-slate-900 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Login Admin</span>
                  </button>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Menu navigasi"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-xl animate-fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 transition-colors ${
                    isActive
                      ? 'text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  style={isActive ? { backgroundColor: theme.accentColor } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100 mt-2">
              {adminUser.isAuthenticated ? (
                <button
                  onClick={() => {
                    onGoToDashboard();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Buka Panel Dashboard Admin</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAdminLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-800 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Login Pengelola Sekolah</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
