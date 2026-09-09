import { useState, useEffect } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Check,
  RotateCcw,
  Sliders,
  Layers,
  Save,
  Shield,
  Monitor
} from 'lucide-react';
import { SchoolIdentity, SchoolTheme } from '../types';
import { saveSchoolIdentity, DEFAULT_SCHOOL_IDENTITY } from '../services/storage';
import MediaLibraryModal from './MediaLibraryModal';
import ConfirmModal from './ConfirmModal';

interface AppearanceCustomizerProps {
  currentIdentity: SchoolIdentity;
  onUpdateIdentity: (updated: SchoolIdentity) => void;
}

const COLOR_PRESETS = [
  { name: 'Biru Kemdikbud', hex: '#1d4ed8', bg: 'from-blue-50 via-slate-50 to-indigo-50' },
  { name: 'Hijau Madani', hex: '#047857', bg: 'from-emerald-50 via-teal-50 to-slate-50' },
  { name: 'Merah Marun Prestasi', hex: '#b91c1c', bg: 'from-rose-50 via-slate-50 to-orange-50' },
  { name: 'Indigo Modern', hex: '#4338ca', bg: 'from-indigo-50 via-purple-50 to-slate-50' },
  { name: 'Emas Unggul', hex: '#d97706', bg: 'from-amber-50 via-yellow-50 to-slate-50' },
  { name: 'Teal Edukasi', hex: '#0f766e', bg: 'from-teal-50 via-cyan-50 to-slate-50' }
];

export default function AppearanceCustomizer({
  currentIdentity,
  onUpdateIdentity
}: AppearanceCustomizerProps) {
  const [themeDraft, setThemeDraft] = useState<SchoolTheme>({ ...currentIdentity.theme });
  const [logoDraft, setLogoDraft] = useState({ ...currentIdentity.logo });

  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setThemeDraft({ ...currentIdentity.theme });
    setLogoDraft({ ...currentIdentity.logo });
  }, [currentIdentity]);

  const handleSaveAll = async () => {
    const updated: SchoolIdentity = {
      ...currentIdentity,
      theme: themeDraft,
      logo: logoDraft
    };

    try {
      await saveSchoolIdentity(updated);
      onUpdateIdentity(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save appearance settings', err);
    }
  };

  const handleResetDefaults = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    setThemeDraft({ ...DEFAULT_SCHOOL_IDENTITY.theme });
    setLogoDraft({ ...DEFAULT_SCHOOL_IDENTITY.logo });
    setShowResetConfirm(false);
  };

  return (
    <div id="appearance-customizer-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">Kustomisasi Tampilan & Branding</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              Live Preview
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Ubah logo sekolah, latar belakang website, warna aksen, dan pantau hasilnya secara langsung sebelum disimpan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Tampilan</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Tampilan sekolah berhasil diperbarui dan diterapkan ke seluruh halaman publik!</span>
        </div>
      )}

      {/* Main Grid: Controls (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="xl:col-span-6 space-y-6">
          {/* LOGO SEKOLAH */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Ganti & Atur Logo Sekolah</span>
            </h3>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div
                className={`flex items-center justify-center bg-white border border-slate-200 p-2 shadow-xs shrink-0 ${
                  logoDraft.shape === 'circle'
                    ? 'rounded-full'
                    : logoDraft.shape === 'square'
                    ? 'rounded-xl'
                    : 'rounded-none'
                }`}
                style={{ width: `${logoDraft.height + 16}px`, height: `${logoDraft.height + 16}px` }}
              >
                <img
                  src={logoDraft.url}
                  alt="School Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowLogoPicker(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Pilih Logo dari Media Library</span>
                </button>
                <p className="text-[11px] text-slate-500">
                  Disarankan file SVG transparan atau PNG persegi resolusi minimal 200x200px.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bentuk Bingkai Logo
                </label>
                <select
                  value={logoDraft.shape}
                  onChange={(e) =>
                    setLogoDraft({ ...logoDraft, shape: e.target.value as any })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="circle">Lingkaran (Bulat)</option>
                  <option value="square">Persegi Rounded</option>
                  <option value="original">Asli (Transparan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ukuran Tinggi Logo ({logoDraft.height}px)
                </label>
                <input
                  type="range"
                  min={36}
                  max={72}
                  value={logoDraft.height}
                  onChange={(e) =>
                    setLogoDraft({ ...logoDraft, height: Number(e.target.value) })
                  }
                  className="w-full mt-2 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* BACKGROUND WEBSITE */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Ganti Background Website</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Tipe Latar Belakang
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'pattern', label: 'Pola Mesh / Pola' },
                  { id: 'gradient', label: 'Gradien Lembut' },
                  { id: 'image', label: 'Gambar Foto' },
                  { id: 'color', label: 'Warna Solid' }
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() =>
                      setThemeDraft({ ...themeDraft, bgType: bg.id as any })
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      themeDraft.bgType === bg.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* If Image background chosen */}
            {themeDraft.bgType === 'image' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Gambar Latar Belakang</span>
                  <button
                    type="button"
                    onClick={() => setShowBgPicker(true)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Pilih Gambar
                  </button>
                </div>

                {themeDraft.bgImageUrl ? (
                  <div className="relative rounded-lg overflow-hidden h-28 border border-slate-200 bg-slate-200">
                    <img
                      src={themeDraft.bgImageUrl}
                      alt="Background preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setShowBgPicker(true)}
                        className="px-3 py-1 bg-white/90 text-slate-800 text-xs font-semibold rounded shadow-sm hover:bg-white"
                      >
                        Ganti Gambar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowBgPicker(true)}
                    className="p-6 border-2 border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:border-blue-500"
                  >
                    <p className="text-xs text-slate-500 font-semibold">Pilih dari Media Library</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-600 mb-1">
                    Lapisan Redup / Overlay ({themeDraft.bgOverlayOpacity}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={themeDraft.bgOverlayOpacity}
                    onChange={(e) =>
                      setThemeDraft({
                        ...themeDraft,
                        bgOverlayOpacity: Number(e.target.value)
                      })
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Pattern selection */}
            {themeDraft.bgType === 'pattern' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Gaya Pola Grafis
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mesh', label: 'Mesh Geometris' },
                    { id: 'dots', label: 'Titik Grid (Dots)' },
                    { id: 'grid', label: 'Garis Koordinat' }
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() =>
                        setThemeDraft({ ...themeDraft, bgPattern: pat.id as any })
                      }
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        themeDraft.bgPattern === pat.id
                          ? 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* WARNA TEMA & AKSEN */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>Warna Identitas Sekolah</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = themeDraft.accentColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setThemeDraft({
                        ...themeDraft,
                        accentColor: preset.hex,
                        accentName: preset.name,
                        bgGradient: preset.bg
                      })
                    }
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{preset.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{preset.hex}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom hex input */}
            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs font-semibold text-slate-700">Warna Kustom:</label>
              <input
                type="color"
                value={themeDraft.accentColor}
                onChange={(e) =>
                  setThemeDraft({
                    ...themeDraft,
                    accentColor: e.target.value,
                    accentName: 'Kustom'
                  })
                }
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
              />
              <span className="text-xs font-mono text-slate-600">{themeDraft.accentColor}</span>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="xl:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">
                Live Preview (Pratinjau Langsung Website)
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActivePreviewTab('desktop')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  activePreviewTab === 'desktop'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('mobile')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  activePreviewTab === 'mobile'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                HP / Mobile
              </button>
            </div>
          </div>

          {/* Device Mockup Box */}
          <div className="bg-slate-900 p-4 rounded-3xl shadow-xl flex justify-center items-center overflow-hidden">
            <div
              className={`transition-all duration-300 bg-white rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative flex flex-col ${
                activePreviewTab === 'mobile'
                  ? 'w-[320px] h-[580px]'
                  : 'w-full h-[580px]'
              }`}
            >
              {/* Fake browser top bar */}
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1 bg-white rounded-md text-[10px] text-slate-500 px-2 py-0.5 text-center truncate border border-slate-200 font-mono">
                  https://sman1teladannusantara.sch.id
                </div>
              </div>

              {/* Fake Website Body with applied Live Preview Styles */}
              <div
                className="flex-1 overflow-y-auto relative text-slate-800 text-xs select-none"
                style={{
                  backgroundColor: themeDraft.bgColor,
                  backgroundImage:
                    themeDraft.bgType === 'image' && themeDraft.bgImageUrl
                      ? `url(${themeDraft.bgImageUrl})`
                      : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Overlay if image bg */}
                {themeDraft.bgType === 'image' && themeDraft.bgImageUrl && (
                  <div
                    className="absolute inset-0 bg-slate-900 pointer-events-none"
                    style={{ opacity: themeDraft.bgOverlayOpacity / 100 }}
                  />
                )}

                {/* Mesh pattern overlay */}
                {themeDraft.bgType === 'pattern' && (
                  <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
                )}

                {/* Content Container */}
                <div className="relative z-10">
                  {/* Live Navbar */}
                  <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between sticky top-0 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`overflow-hidden bg-white border border-slate-200 p-0.5 shrink-0 ${
                          logoDraft.shape === 'circle'
                            ? 'rounded-full'
                            : logoDraft.shape === 'square'
                            ? 'rounded-md'
                            : 'rounded-none'
                        }`}
                        style={{ height: `${Math.min(logoDraft.height * 0.75, 42)}px` }}
                      >
                        <img
                          src={logoDraft.url}
                          alt="Logo"
                          className="h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[11px] leading-tight text-slate-900 truncate">
                          {currentIdentity.schoolName}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-medium block truncate max-w-[170px]">
                          {currentIdentity.tagline}
                        </span>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: themeDraft.accentColor }}
                    >
                      SPMB 2026
                    </span>
                  </header>

                  {/* Live Hero Header */}
                  <div className="p-4 sm:p-6 text-center space-y-2">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: themeDraft.accentColor }}
                    >
                      Portal Publikasi Resmi
                    </span>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                      Selamat Datang di Portal Publikasi Sekolah
                    </h2>
                    <p className="text-[10px] text-slate-600 max-w-sm mx-auto">
                      Pusat informasi berita, prestasi siswa, unduhan dokumen akademik, dan galeri kegiatan.
                    </p>
                  </div>

                  {/* Live News Cards Grid */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900">Berita Terkini</span>
                      <span
                        className="text-[10px] font-semibold hover:underline"
                        style={{ color: themeDraft.accentColor }}
                      >
                        Lihat Semua →
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-1.5">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white inline-block"
                          style={{ backgroundColor: themeDraft.accentColor }}
                        >
                          Pengumuman
                        </span>
                        <h5 className="font-bold text-[11px] text-slate-900 leading-tight">
                          Seleksi Penerimaan Murid Baru (SPMB) 2026/2027 Resmi Dibuka
                        </h5>
                        <p className="text-[9px] text-slate-500 line-clamp-2">
                          Pendaftaran jalur zonasi, prestasi, afirmasi, dan perpindahan tugas orang tua telah dimulai.
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs space-y-1.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 inline-block">
                          Prestasi
                        </span>
                        <h5 className="font-bold text-[11px] text-slate-900 leading-tight">
                          Siswa SMAN 1 Teladan Raih 3 Medali Emas di OSN 2026
                        </h5>
                        <p className="text-[9px] text-slate-500 line-clamp-2">
                          Medali emas diperoleh pada cabang Informatika, Kimia Terapan, dan Fisika Teori.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Footer */}
                  <div className="mt-6 bg-slate-900 text-slate-400 p-4 text-[9px] text-center space-y-1">
                    <p className="font-semibold text-white">{currentIdentity.schoolName}</p>
                    <p>{currentIdentity.address}</p>
                    <p className="text-[8px] text-slate-500">
                      NPSN: {currentIdentity.npsn} • Akreditasi: {currentIdentity.accreditation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Media Picker Modal */}
      <MediaLibraryModal
        isOpen={showLogoPicker}
        onClose={() => setShowLogoPicker(false)}
        allowedTypes={['image']}
        title="Pilih Gambar untuk Logo Sekolah"
        onSelect={(item) => {
          setLogoDraft({
            ...logoDraft,
            url: item.dataUrl || item.name,
            mediaId: item.id
          });
        }}
      />

      {/* Background Image Picker Modal */}
      <MediaLibraryModal
        isOpen={showBgPicker}
        onClose={() => setShowBgPicker(false)}
        allowedTypes={['image']}
        title="Pilih Gambar untuk Latar Belakang Website"
        onSelect={(item) => {
          setThemeDraft({
            ...themeDraft,
            bgImageUrl: item.dataUrl || item.name,
            bgMediaId: item.id,
            bgType: 'image'
          });
        }}
      />

      {/* Confirm Reset Modal */}
      {showResetConfirm && (
        <ConfirmModal
          isOpen={true}
          title="Kembalikan Tampilan Bawaan"
          message="Apakah Anda yakin ingin mengembalikan logo, warna tema, dan konfigurasi latar belakang ke setelan bawaan sistem? Perubahan yang belum disimpan akan digantikan."
          confirmText="Ya, Setel Ulang"
          cancelText="Batal"
          isDestructive={false}
          onConfirm={handleConfirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}
