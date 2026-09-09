import { useState, useEffect, FormEvent } from 'react';
import {
  X,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { AdminUser, SchoolIdentity } from '../types';
import { setAdminSession, getAdminCredentials } from '../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
  schoolIdentity: SchoolIdentity;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  schoolIdentity
}: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setErrorMsg(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const activeCreds = await getAdminCredentials();
      const inputUser = username.trim().toLowerCase();
      const targetUser = activeCreds.username.toLowerCase();

      // Check against current active credentials or default fallback
      const isValid = inputUser === targetUser && password === activeCreds.password;

      if (isValid) {
        const user: AdminUser = {
          isAuthenticated: true,
          username: activeCreds.username,
          name: activeCreds.name || 'Kepala Humas & IT',
          role: 'admin',
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        setAdminSession(user);
        onLoginSuccess(user);
        onClose();
      } else {
        setErrorMsg('Kredensial tidak cocok. Silakan periksa kembali username dan kata sandi Anda.');
      }
    } catch (err) {
      console.error('Login error', err);
      setErrorMsg('Terjadi kesalahan saat memeriksa kredensial.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="admin-login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="admin-login-modal-container"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>

          <h3 className="text-lg font-black tracking-tight">Login Portal Admin</h3>
          <p className="text-xs text-blue-100/80 mt-0.5 truncate px-4">
            {schoolIdentity.schoolName}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Pengguna / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username admin resmi"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kata Sandi / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi admin"
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Autentikasi Terproteksi: Fitur masuk cepat dinonaktifkan demi keamanan.</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Masuk ke Dashboard Admin</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-center text-slate-400 pt-1">
            Hak cipta terproteksi • Khusus pengelola publikasi sekolah
          </p>
        </form>
      </div>
    </div>
  );
}
