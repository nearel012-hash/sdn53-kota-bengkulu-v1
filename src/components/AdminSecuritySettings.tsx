import { useState, useEffect, FormEvent } from 'react';
import {
  ShieldCheck,
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { AdminUser, AdminCredentials } from '../types';
import {
  getAdminCredentials,
  saveAdminCredentials,
  setAdminSession,
  DEFAULT_ADMIN_CREDENTIALS
} from '../services/storage';
import ConfirmModal from './ConfirmModal';

interface AdminSecuritySettingsProps {
  adminUser: AdminUser;
  onUpdateUser?: (updated: AdminUser) => void;
}

export default function AdminSecuritySettings({
  adminUser,
  onUpdateUser
}: AdminSecuritySettingsProps) {
  const [currentCreds, setCurrentCreds] = useState<AdminCredentials>(DEFAULT_ADMIN_CREDENTIALS);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI helpers
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset confirmation modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const loadCreds = async () => {
      try {
        setIsLoading(true);
        const creds = await getAdminCredentials();
        setCurrentCreds(creds);
        setName(creds.name || adminUser.name || 'Kepala Humas & IT');
        setUsername(creds.username);
      } catch (err) {
        console.error('Failed to load admin credentials', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreds();
  }, [adminUser]);

  const isDefaultCredentials =
    currentCreds.username === DEFAULT_ADMIN_CREDENTIALS.username &&
    currentCreds.password === DEFAULT_ADMIN_CREDENTIALS.password;

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Kosong', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Lemah', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Sedang', color: 'bg-amber-500' };
    return { score: 3, label: 'Sangat Kuat', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanUsername = username.trim();
    const cleanName = name.trim() || 'Administrator';

    // Validation
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username harus memiliki minimal 3 karakter.');
      return;
    }

    if (/\s/.test(cleanUsername)) {
      setErrorMessage('Username tidak boleh mengandung spasi.');
      return;
    }

    // Verify current password
    if (currentPassword !== currentCreds.password) {
      setErrorMessage('Kata sandi saat ini salah. Silakan periksa kembali kata sandi lama Anda.');
      return;
    }

    // Determine final password to save
    let finalPassword = currentCreds.password;
    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
        return;
      }
      finalPassword = newPassword;
    }

    try {
      setIsSubmitting(true);
      const now = new Date();
      const timestamp = `${now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

      const updatedCreds: AdminCredentials = {
        username: cleanUsername,
        password: finalPassword,
        name: cleanName,
        updatedAt: timestamp
      };

      await saveAdminCredentials(updatedCreds);
      setCurrentCreds(updatedCreds);

      // Update current admin session
      const updatedUser: AdminUser = {
        ...adminUser,
        username: cleanUsername,
        name: cleanName
      };
      setAdminSession(updatedUser);
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      // Reset sensitive password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setSuccessMessage('Kredensial login admin berhasil diperbarui! Gunakan data ini untuk login berikutnya.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to save admin credentials', err);
      setErrorMessage('Gagal menyimpan kredensial. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setIsResetting(true);
      const defaultWithDate: AdminCredentials = {
        ...DEFAULT_ADMIN_CREDENTIALS,
        updatedAt: new Date().toLocaleDateString('id-ID')
      };

      await saveAdminCredentials(defaultWithDate);
      setCurrentCreds(defaultWithDate);
      setUsername(defaultWithDate.username);
      setName(defaultWithDate.name);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      const updatedUser: AdminUser = {
        ...adminUser,
        username: defaultWithDate.username,
        name: defaultWithDate.name
      };
      setAdminSession(updatedUser);
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      setIsResetModalOpen(false);
      setSuccessMessage('Kredensial telah direset ke default: username "admin" dan sandi "admin123".');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to reset admin credentials', err);
      setErrorMessage('Gagal mereset kredensial.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Memuat konfigurasi keamanan akun...</p>
      </div>
    );
  }

  return (
    <div id="admin-security-settings-section" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <KeyRound className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Pengaturan Akun & Keamanan Login</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ubah username dan kata sandi login admin untuk menjaga keamanan akses portal berita sekolah.
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border bg-slate-50 text-xs">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isDefaultCredentials ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <div>
            <span className="font-bold text-slate-800">
              {isDefaultCredentials ? 'Kredensial Default' : 'Kredensial Kustom Aktif'}
            </span>
            <p className="text-[10px] text-slate-400">
              {isDefaultCredentials
                ? 'Disarankan segera ubah kata sandi'
                : `Diperbarui: ${currentCreds.updatedAt || 'Tersimpan'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-3 shadow-xs animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Akun */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Profil Pengelola Admin</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identitas pengguna yang ditampilkan pada dashboard dan status publikasi berita.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username Login <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all font-mono font-medium"
                  placeholder="Masukkan username baru (contoh: admin_sman1)"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Username digunakan saat login. Huruf kecil, angka, atau garis bawah tanpa spasi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Pengelola / Jabatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all"
                placeholder="Contoh: Kepala Humas & IT SMAN 1"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Nama lengkap atau seksi yang mengelola publikasi sekolah.
              </p>
            </div>
          </div>
        </div>

        {/* Keamanan & Perubahan Kata Sandi */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Ganti Kata Sandi</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Masukkan kata sandi saat ini untuk otentikasi, lalu isi kata sandi baru.
            </p>
          </div>

          <div className="space-y-4">
            {/* Kata Sandi Saat Ini */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi Saat Ini <span className="text-rose-500">*</span>
              </label>
              <div className="relative max-w-md">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all font-mono"
                  placeholder={
                    isDefaultCredentials
                      ? 'Kata sandi saat ini adalah "admin123"'
                      : 'Masukkan kata sandi aktif Anda'
                  }
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isDefaultCredentials && (
                <p className="text-[10px] text-blue-600 mt-1">
                  💡 Tips: Karena masih default, kata sandi saat ini adalah <strong>admin123</strong>.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all font-mono"
                    placeholder="Kosongkan jika tidak ingin mengubah sandi"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Kekuatan Sandi:</span>
                      <span className="font-bold text-slate-700">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                          strength.score >= 1 ? 'w-1/3' : 'w-0'
                        }`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                          strength.score >= 2 ? 'w-1/3' : 'w-0'
                        }`}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color} ${
                          strength.score >= 3 ? 'w-1/3' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!newPassword}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 disabled:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all font-mono"
                    placeholder="Ketik ulang kata sandi baru"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-rose-500 mt-1">Konfirmasi sandi belum cocok.</p>
                )}
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Kata sandi cocok.</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Kembalikan ke Default (admin / admin123)</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-101"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Simpan Kredensial Baru</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security Best Practice Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-blue-400">
          <Info className="w-5 h-5 shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Catatan Penting Keamanan Web Sekolah</h4>
        </div>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5 leading-relaxed">
          <li>
            Setelah mengubah username atau password, pastikan Anda mencatatnya di tempat yang aman.
          </li>
          <li>
            Kredensial tersimpan secara aman di dalam penyimpanan database browser sekolah Anda.
          </li>
          <li>
            Jika sewaktu-waktu Anda lupa kata sandi kustom, Anda dapat menggunakan opsi reset ke default di atas selama Anda masih login di sesi browser ini.
          </li>
        </ul>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Kredensial Admin ke Default?"
        message="Username akan dikembalikan menjadi 'admin' dan kata sandi menjadi 'admin123'. Anda dapat mengubahnya kembali sewaktu-waktu."
        confirmText="Ya, Reset ke Default"
        cancelText="Batal"
        isDestructive={false}
        onConfirm={handleResetToDefault}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
}
