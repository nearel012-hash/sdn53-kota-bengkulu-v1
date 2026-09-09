import { useState, useRef, ChangeEvent } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  FileJson,
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Info,
  Cloud,
  CloudCheck
} from 'lucide-react';
import { downloadBackupFile, importFullDatabaseBackup, getSchoolIdentity, getAllArticles } from '../services/storage';
import { syncRemoteSchoolIdentity, syncRemoteArticle } from '../services/firebaseSync';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export default function BackupRestoreModal({
  isOpen,
  onClose,
  onDataRestored
}: BackupRestoreModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCloudSync = async () => {
    try {
      setIsCloudSyncing(true);
      setStatusMessage(null);
      const identity = await getSchoolIdentity();
      await syncRemoteSchoolIdentity(identity);
      const articles = await getAllArticles();
      for (const art of articles) {
        await syncRemoteArticle(art);
      }
      setStatusMessage({
        type: 'success',
        text: 'Data berhasil disinkronkan ke Firebase Cloud! Saat HP atau perangkat lain membuka link website, data terbaru akan otomatis termuat.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Gagal sinkron ke Cloud: ${err?.message || 'Pastikan koneksi internet aktif'}`
      });
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatusMessage(null);
      await downloadBackupFile();
      setStatusMessage({
        type: 'success',
        text: 'File cadangan (.json) berhasil diunduh! Anda dapat mengirimkan file ini ke HP melalui WhatsApp atau Google Drive.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Gagal mengunduh cadangan: ${err?.message || 'Terjadi kesalahan'}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setStatusMessage({ type: 'info', text: 'Memproses dan memulihkan data website...' });
      const text = await file.text();
      const result = await importFullDatabaseBackup(text);

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: 'Data berhasil dipulihkan 100%! Tampilan website sekarang sama persis dengan di laptop.'
        });
        setTimeout(() => {
          onDataRestored();
        }, 1500);
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Gagal membaca file: ${err?.message || 'File tidak valid'}`
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Sinkronisasi & Cadangan Data
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Salin data lengkap website antara Laptop dan HP dengan mudah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Explanation Box: Why it looks different on phone */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4.5 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Mengapa Tampilan di HP Berbeda dengan di Laptop?</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              Saat Anda mengedit nama sekolah, mengganti foto gedung, atau menambah artikel di laptop, data tersebut tersimpan di <strong>memori browser laptop Anda (IndexedDB lokal)</strong>. Ketika link dibuka di HP lain, browser HP memulai dari kondisi kosong sehingga memuat data default awal.
            </p>
            <div className="flex items-center gap-2 pt-1 font-semibold text-amber-800">
              <span className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5" /> Laptop Anda
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span>Unduh File Cadangan</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> Buka di HP & Impor
              </span>
            </div>
          </div>

          {/* Feedback Status */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {/* Action: Cloud Sync with Firebase */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-blue-950 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span>Sinkronisasi Otomatis Cloud (Firebase)</span>
                </h3>
                <p className="text-xs text-blue-900/80 mt-1 leading-relaxed">
                  Kirim perubahan terkini langsung ke Firebase Firestore Cloud. Perangkat lain (termasuk HP yang membuka via Vercel) akan otomatis menerima perubahan tanpa perlu kirim file manual.
                </p>
              </div>

              <button
                onClick={handleCloudSync}
                disabled={isCloudSyncing}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 inline-flex items-center gap-2"
              >
                {isCloudSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
                <span>{isCloudSyncing ? 'Menyinkronkan...' : 'Sinkron ke Cloud'}</span>
              </button>
            </div>
          </div>

          {/* Action 1: Export Backup */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span>Langkah 1: Ekspor Data dari Laptop Anda</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Unduh seluruh data yang sudah Anda atur di laptop (nama sekolah, logo, foto gedung, semua berita, berkas media, dan pengumuman).
                </p>
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 inline-flex items-center gap-2"
              >
                {isExporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isExporting ? 'Mengunduh...' : 'Unduh Cadangan (.JSON)'}</span>
              </button>
            </div>
          </div>

          {/* Action 2: Import Backup */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Langkah 2: Pulihkan di HP atau Perangkat Lain</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kirim file cadangan yang diunduh ke HP Anda (misalnya lewat WhatsApp atau kirim file ke diri sendiri). Kemudian di HP, buka panel Admin ini dan pilih file cadangan tersebut.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 group"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                Klik di sini untuk Memilih File Cadangan (.json)
              </div>
              <p className="text-[11px] text-slate-400">
                Data di perangkat ini akan diperbarui 100% identik dengan file cadangan Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Format cadangan resmi aman & terenkripsi lokal</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
