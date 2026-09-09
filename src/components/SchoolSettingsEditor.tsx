import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
  Globe,
  Plus,
  Trash2,
  Save,
  Check,
  FileCheck,
  Instagram,
  Youtube,
  Facebook,
  AlertTriangle,
  UserCheck,
  Upload,
  FolderOpen,
  Image as ImageIcon,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SchoolIdentity, MediaItem } from '../types';
import { saveSchoolIdentity, saveMediaItem } from '../services/storage';
import MediaLibraryModal from './MediaLibraryModal';

interface SchoolSettingsEditorProps {
  identity: SchoolIdentity;
  onUpdateIdentity: (updated: SchoolIdentity) => void;
}

export default function SchoolSettingsEditor({
  identity,
  onUpdateIdentity
}: SchoolSettingsEditorProps) {
  const [formData, setFormData] = useState<SchoolIdentity>({ ...identity });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      await saveSchoolIdentity(formData);
      onUpdateIdentity(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save school identity', err);
      setSaveError('Gagal menyimpan identitas sekolah.');
      setTimeout(() => setSaveError(null), 3500);
    }
  };

  const handlePhotoFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('File harus berupa gambar (JPG, PNG, WebP).');
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSaveError('Ukuran gambar terlalu besar. Maksimal 10 MB.');
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const updated = {
          ...formData,
          principalPhotoUrl: dataUrl
        };
        setFormData(updated);

        // Also save to Media Library so it's safely archived
        const newMediaItem: MediaItem = {
          id: `media-kepsek-${Date.now()}`,
          name: `Foto Kepala Sekolah - ${formData.principalName || 'Resmi'}`,
          originalName: file.name,
          type: 'image',
          mimeType: file.type,
          extension: file.name.split('.').pop()?.toLowerCase() || 'jpg',
          size: file.size,
          dataUrl: dataUrl,
          uploadDate: new Date().toISOString(),
          tags: ['kepala-sekolah', 'foto-resmi', 'identitas']
        };
        await saveMediaItem(newMediaItem, file);

        setUploadFeedback('Foto kepala sekolah berhasil diunggah!');
        setTimeout(() => setUploadFeedback(null), 3500);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to process image file', err);
      setSaveError('Gagal memproses file foto.');
    }
  };

  const handleSelectMediaForPrincipal = (item: MediaItem) => {
    if (item.dataUrl) {
      setFormData({
        ...formData,
        principalPhotoUrl: item.dataUrl,
        principalPhotoMediaId: item.id
      });
      setShowMediaModal(false);
      setUploadFeedback(`Foto terpilih dari pustaka: ${item.name}`);
      setTimeout(() => setUploadFeedback(null), 3500);
    }
  };

  const handleRemovePrincipalPhoto = () => {
    setFormData({
      ...formData,
      principalPhotoUrl: '',
      principalPhotoMediaId: undefined
    });
    setUploadFeedback('Foto kepala sekolah telah dihapus.');
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  const handleAddMission = () => {
    setFormData({
      ...formData,
      missions: [...formData.missions, '']
    });
  };

  const handleUpdateMission = (index: number, val: string) => {
    const updated = [...formData.missions];
    updated[index] = val;
    setFormData({ ...formData, missions: updated });
  };

  const handleRemoveMission = (index: number) => {
    const updated = formData.missions.filter((_, i) => i !== index);
    setFormData({ ...formData, missions: updated });
  };

  return (
    <form id="school-settings-form" onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">Pengaturan Identitas Sekolah</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              Data Resmi
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Kelola nama resmi, NPSN, akreditasi, data pimpinan, kontak, dan visi-misi sekolah yang tampil di seluruh website publik.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan Identitas</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Informasi identitas sekolah berhasil diperbarui!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Kustomisasi Judul Utama Portal & Headline Beranda */}
      <div className="bg-white rounded-2xl p-6 border-2 border-blue-200/80 shadow-xs space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Judul Utama Portal & Headline Beranda</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah teks judul utama yang tampil di bagian atas halaman beranda publik (misalnya mengganti frasa <em>"Portal Informasi & Warta Resmi SMA Negeri 1 Teladan Nusantara"</em> sesuai kebutuhan).
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            Tampil di Beranda Publik
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Judul Lengkap Portal Web (Headline Beranda) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      portalTitle: `Portal Informasi & Warta Resmi ${formData.schoolName}`
                    })
                  }
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                >
                  Gunakan Format Standar
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      portalTitle: 'Portal Informasi & Warta Resmi SMA Negeri 1 Teladan Nusantara'
                    })
                  }
                  className="text-[11px] text-slate-500 hover:text-slate-700 hover:underline"
                >
                  Reset Bawaan
                </button>
              </div>
            </div>
            <input
              type="text"
              value={formData.portalTitle !== undefined ? formData.portalTitle : `Portal Informasi & Warta Resmi ${formData.schoolName}`}
              onChange={(e) => setFormData({ ...formData, portalTitle: e.target.value })}
              placeholder="Contoh: Portal Informasi & Warta Resmi SMA Negeri 1 Teladan Nusantara"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Anda dapat mengubah judul ini secara bebas, baik nama sekolah, singkatan instansi, maupun teks pengantar portal.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-bold text-slate-800">
                Teks Badge Pengumuman Hero (Pill Beranimasi)
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    portalBadge: `SPMB 2026/2027 Resmi Dibuka • Akreditasi ${formData.accreditation}`
                  })
                }
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
              >
                Set Badge SPMB
              </button>
            </div>
            <input
              type="text"
              value={formData.portalBadge !== undefined ? formData.portalBadge : `SPMB 2026/2027 Resmi Dibuka • Akreditasi ${formData.accreditation}`}
              onChange={(e) => setFormData({ ...formData, portalBadge: e.target.value })}
              placeholder="Contoh: SPMB 2026/2027 Resmi Dibuka • Akreditasi A (Unggul)"
              className="w-full px-3.5 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Pratinjau Langsung (Live Preview) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pratinjau Tampilan Beranda:
            </span>
            <div className="text-center py-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2 px-3">
              <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span>
                  {formData.portalBadge || `SPMB 2026/2027 Resmi Dibuka • Akreditasi ${formData.accreditation}`}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {formData.portalTitle || `Portal Informasi & Warta Resmi ${formData.schoolName}`}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-md mx-auto">
                {formData.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Identitas Pokok */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Informasi Pokok Sekolah</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Sekolah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Slogan / Tagline Sekolah
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NPSN (Nomor Pokok Sekolah Nasional)
            </label>
            <input
              type="text"
              value={formData.npsn}
              onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Akreditasi
            </label>
            <input
              type="text"
              value={formData.accreditation}
              onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Profil & Foto Kepala Sekolah */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Profil & Foto Kepala Sekolah</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Foto resmi pimpinan dan sambutan sekolah yang tampil di menu publik Profil & Identitas serta dokumen pengumuman resmi.
            </p>
          </div>
          <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
            Tampil di Menu Profil & Identitas
          </span>
        </div>

        {uploadFeedback && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{uploadFeedback}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Foto Kepala Sekolah Box */}
          <div className="flex flex-col items-center sm:items-start gap-3 shrink-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Foto Resmi Kepala Sekolah
            </label>

            <div className="relative group">
              <div className="w-36 h-44 sm:w-40 sm:h-48 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden shadow-sm flex flex-col items-center justify-center text-center p-2 relative">
                {formData.principalPhotoUrl ? (
                  <img
                    src={formData.principalPhotoUrl}
                    alt={formData.principalName || 'Kepala Sekolah'}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-slate-400">
                    <UserCheck className="w-12 h-12 text-slate-300 mb-2" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      Foto Masih Kosong
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Belum ada foto kepala sekolah
                    </span>
                  </div>
                )}
              </div>

              {formData.principalPhotoUrl && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold shadow-xs">
                  Foto Aktif
                </span>
              )}
            </div>

            {/* Tombol Aksi Upload */}
            <div className="flex flex-wrap gap-2 w-full max-w-xs">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Foto</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMediaModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors inline-flex items-center justify-center gap-1.5"
                title="Pilih dari Universal Media Library"
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Pustaka</span>
              </button>

              {formData.principalPhotoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePrincipalPhoto}
                  className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200 transition-colors inline-flex items-center justify-center"
                  title="Hapus foto saat ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-400 max-w-[200px] leading-tight text-center sm:text-left">
              Disarankan foto formal pakaian dinas resmi / berjas, format JPG, PNG, atau WebP (maks 10 MB).
            </p>
          </div>

          {/* Form Isian Data Pimpinan */}
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Kepala Sekolah Beserta Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  placeholder="Contoh: Drs. H. Bambang Suryono, M.Pd."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIP (Nomor Induk Pegawai) Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.principalNip || ''}
                  onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                  placeholder="Contoh: 19680512 199403 1 004"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Resmi
                </label>
                <input
                  type="text"
                  disabled
                  value="Kepala Sekolah / Penanggung Jawab Satuan Pendidikan"
                  className="w-full px-3.5 py-2 text-xs bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teks Sambutan Resmi Kepala Sekolah
              </label>
              <textarea
                rows={4}
                value={
                  formData.principalGreeting ||
                  'Pendidikan bukan sekadar proses transfer ilmu pengetahuan, melainkan ruang pembentukan karakter luhur, daya nalar kritis, dan kepedulian sosial. Melalui portal publikasi digital ini, kami membuka pintu kolaborasi yang seluas-luasnya bagi seluruh orang tua, peserta didik, dan masyarakat untuk bersama-sama melahirkan generasi masa depan yang berdaya saing global.'
                }
                onChange={(e) => setFormData({ ...formData, principalGreeting: e.target.value })}
                placeholder="Tuliskan kata sambutan atau amanat dari kepala sekolah untuk pengunjung portal..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white leading-relaxed resize-y"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Teks ini akan ditampilkan berdampingan dengan foto kepala sekolah pada menu publik <strong>Profil & Identitas</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kontak & Lokasi */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Kontak & Lokasi Resmi</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Sekolah
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Resmi Sekolah
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
            />
          </div>
        </div>

        {/* Media Sosial */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-800 mb-3">Tautan Akun Media Sosial</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-1">
                <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
              </label>
              <input
                type="text"
                value={formData.socialMedia.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-1">
                <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube Channel
              </label>
              <input
                type="text"
                value={formData.socialMedia.youtube}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, youtube: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-1">
                <Facebook className="w-3.5 h-3.5 text-blue-600" /> Halaman Facebook
              </label>
              <input
                type="text"
                value={formData.socialMedia.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-1">
                <span>🎵</span> TikTok Resmi
              </label>
              <input
                type="text"
                value={formData.socialMedia.tiktok}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialMedia: { ...formData.socialMedia, tiktok: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visi & Misi */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600" />
          <span>Visi & Misi Sekolah</span>
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Visi Pendidikan Sekolah
          </label>
          <textarea
            rows={2}
            value={formData.vision}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">Misi Sekolah</label>
            <button
              type="button"
              onClick={handleAddMission}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Butir Misi</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.missions.map((mission, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-5 text-center text-xs font-bold text-slate-400">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={mission}
                  onChange={(e) => handleUpdateMission(index, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMission(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Library Modal for Principal Photo */}
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleSelectMediaForPrincipal}
        allowedTypes={['image']}
        title="Pilih Foto Kepala Sekolah dari Universal Media Library"
      />
    </form>
  );
}
