import { useState, useEffect, FormEvent } from 'react';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
  X,
  FileText,
  Calendar,
  Award,
  ShieldCheck,
  UserCheck,
  Download,
  FileCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { SchoolIdentity, GraduationStudent, GraduationConfig } from '../types';
import {
  getGraduationConfig,
  getGraduationStudents,
  findGraduationStudent,
  downloadStudentSkl,
  DEFAULT_SKL_TEMPLATE
} from '../services/storage';
import { exportStudentSklToPdf } from '../utils/pdfExport';
import { formatFileSize } from '../utils/fileValidation';

interface PublicGraduationProps {
  schoolIdentity: SchoolIdentity;
}

export default function PublicGraduation({ schoolIdentity }: PublicGraduationProps) {
  const [config, setConfig] = useState<GraduationConfig | null>(null);
  const [students, setStudents] = useState<GraduationStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<GraduationStudent | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentForSkl, setSelectedStudentForSkl] = useState<GraduationStudent | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const cfg = await getGraduationConfig();
      const stdList = await getGraduationStudents();
      setConfig(cfg);
      setStudents(stdList);
    };
    loadData();
  }, []);

  const handleDownloadSklPdf = async (student: GraduationStudent) => {
    if (!config) return;
    setIsExportingPdf(true);
    try {
      const customElem = selectedStudentForSkl?.id === student.id ? document.getElementById('printable-skl') : null;
      await exportStudentSklToPdf(student, config, schoolIdentity, customElem);
    } catch (err) {
      console.error('Failed to export SKL as PDF', err);
      // fallback to downloadStudentSkl
      downloadStudentSkl(student, config, schoolIdentity);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const result = await findGraduationStudent(searchQuery);
      setSearchedStudent(result);
    } catch (err) {
      console.error('Failed to search student', err);
      setSearchedStudent(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSelect = async (std: GraduationStudent) => {
    setSearchQuery(std.nisn);
    setIsSearching(true);
    setHasSearched(true);
    setTimeout(() => {
      setSearchedStudent(std);
      setIsSearching(false);
      const resElem = document.getElementById('search-result-box');
      if (resElem) {
        resElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };

  const handlePrintSkl = () => {
    window.print();
  };

  const totalStudents = students.length;
  const passedStudents = students.filter((s) => s.status === 'LULUS').length;
  const passRate = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 100;

  const tpl = config?.sklTemplate || DEFAULT_SKL_TEMPLATE;

  return (
    <div id="public-graduation-portal" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-12 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Portal Kelulusan Online Resmi</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Pengumuman Kelulusan Siswa
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-amber-200 mt-1">
                Tahun Ajaran {config?.academicYear || '2025/2026'}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Selamat datang di sistem pengumuman kelulusan terpadu {schoolIdentity.schoolName}. Masukkan Nomor Induk Siswa Nasional (NISN) atau Nomor Peserta Ujian untuk memeriksa status kelulusan dan mengunduh berkas Surat Keterangan Lulus (SKL) resmi Anda.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Tanggal Penetapan: {config?.letterDate || '5 Mei 2026'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SK: {config?.skNumber || '421.3/SK-089/2026'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stat Card */}
          <div className="w-full sm:w-auto shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center space-y-3 min-w-[220px]">
            <div className="inline-block p-3 rounded-xl bg-blue-600/30 text-blue-300 mb-1">
              <Award className="w-8 h-8 mx-auto text-amber-400" />
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black text-white">{passRate}%</span>
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-0.5">
                Tingkat Kelulusan
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex justify-between px-2">
              <span>Total Peserta:</span>
              <span className="font-bold text-white">{totalStudents} Siswa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Cek Status Kelulusan & Unduh SKL
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Ketik Nomor Induk Siswa Nasional (NISN) atau Nomor Peserta Ujian Anda pada kolom di bawah ini.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan 10 digit NISN atau No. Ujian..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-colors inline-flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Cek Status</span>
            </button>
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Contoh Siswa (Klik untuk coba langsung):</span>
            {students.slice(0, 4).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleQuickSelect(s)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-mono border border-slate-200 transition-colors inline-flex items-center gap-1"
              >
                <span>{s.name.split(' ')[0]}</span>
                {s.sklFile && (
                  <span className="px-1 py-0.2 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">
                    PDF
                  </span>
                )}
              </button>
            ))}
          </div>
        </form>

        {/* Search Result Box */}
        {hasSearched && (
          <div id="search-result-box" className="pt-4 max-w-3xl mx-auto">
            {searchedStudent ? (
              <div className="rounded-3xl border-2 border-emerald-500/80 bg-gradient-to-b from-emerald-50/60 to-white p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Hasil Keputusan Dewan Guru & Satuan Pendidikan
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                        {searchedStudent.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        NISN: {searchedStudent.nisn} • No. Ujian: {searchedStudent.examNumber}
                      </p>
                    </div>
                  </div>

                  <div className="self-start sm:self-auto">
                    <span
                      className={`px-5 py-2.5 rounded-2xl text-white text-sm font-black tracking-wider uppercase shadow-sm inline-flex items-center gap-2 ${
                        searchedStudent.status === 'LULUS'
                          ? 'bg-emerald-600'
                          : searchedStudent.status === 'DITUNDA'
                          ? 'bg-amber-600'
                          : 'bg-rose-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{searchedStudent.status}</span>
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Nomor Induk Siswa (NIS)
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                      {searchedStudent.nis}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Peminatan / Jurusan
                    </span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {searchedStudent.major}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Nilai Rata-rata Ujian
                    </span>
                    <span className="font-black text-emerald-700 text-sm mt-0.5 block font-mono">
                      {searchedStudent.averageScore.toFixed(1)} / 100
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 sm:col-span-2">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Tempat & Tanggal Lahir
                    </span>
                    <span className="font-medium text-slate-800 text-xs mt-0.5 block">
                      {searchedStudent.birthInfo}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Keterangan Prestasi
                    </span>
                    <span className="font-medium text-blue-700 text-xs mt-0.5 block truncate">
                      {searchedStudent.notes || 'Memenuhi Kriteria Kelulusan'}
                    </span>
                  </div>
                </div>

                {/* Subject Scores Table if present */}
                {searchedStudent.scores && searchedStudent.scores.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Rincian Nilai Mata Pelajaran</span>
                      <span className="text-slate-400 font-normal">Transkrip Nilai Sekolah</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {searchedStudent.scores.map((sc, i) => (
                        <div key={i} className="px-4 py-2 flex items-center justify-between text-xs">
                          <span className="text-slate-700 font-medium">{sc.subject}</span>
                          <span className="font-bold text-slate-900 font-mono">{sc.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DEDICATED SKL DOWNLOAD & PRINT ACTION PANEL */}
                {searchedStudent.status === 'LULUS' && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            Surat Keterangan Lulus (SKL) Resmi Anda Siap Diunduh
                          </h4>
                          <p className="text-[11px] text-blue-200">
                            {searchedStudent.sklFile
                              ? `Berkas khusus tersedia: ${searchedStudent.sklFile.fileName} (${formatFileSize(searchedStudent.sklFile.fileSize)})`
                              : 'Diterbitkan otomatis dengan Format SKL Resmi Sekolah yang sah & terverifikasi'}
                          </p>
                        </div>
                      </div>

                      {searchedStudent.sklFile && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto">
                          File PDF Pribadi
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <p className="text-xs text-blue-200 text-center sm:text-left leading-relaxed">
                        SKL ini dapat langsung Anda simpan ke perangkat Anda untuk pendaftaran perguruan tinggi atau dinas.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={isExportingPdf}
                          onClick={() => handleDownloadSklPdf(searchedStudent)}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center justify-center gap-2 active:scale-95"
                        >
                          {isExportingPdf ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Membuat PDF SKL...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Unduh SKL (Format PDF)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedStudentForSkl(searchedStudent)}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Pratinjau & Cetak</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h4 className="text-base font-bold text-rose-900">Data Siswa Tidak Ditemukan</h4>
                <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                  Nomor NISN atau Nomor Peserta Ujian "<strong>{searchQuery}</strong>" tidak terdaftar dalam database kelulusan tahun ini. Pastikan nomor yang dimasukkan sudah benar atau hubungi panitia ujian sekolah.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Maklumat & Sambutan Kepala Sekolah Mengenai Kelulusan */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Foto Kepala Sekolah */}
          <div className="flex flex-col items-center shrink-0 self-center md:self-start">
            <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 p-1 shadow-md overflow-hidden">
              {schoolIdentity.principalPhotoUrl ? (
                <img
                  src={schoolIdentity.principalPhotoUrl}
                  alt={schoolIdentity.principalName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center text-white p-2 text-center">
                  <UserCheck className="w-10 h-10 text-blue-400 mb-1" />
                  <span className="text-[10px] font-bold">Kepala Sekolah</span>
                </div>
              )}
            </div>
            <span className="mt-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              Kepala Sekolah
            </span>
          </div>

          {/* Pesan & Maklumat */}
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Amanat & Maklumat Resmi
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Pesan Kepala Sekolah Kepada Seluruh Wisudawan
              </h3>
              <p className="text-xs text-slate-500">
                Oleh <strong>{schoolIdentity.principalName}</strong> • NIP. {schoolIdentity.principalNip || '-'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed italic relative">
              <span className="text-4xl text-blue-200 font-serif absolute top-2 left-3 pointer-events-none select-none">
                “
              </span>
              <p className="relative z-10 pl-4">
                {config?.headmasterMessage ||
                  'Selamat atas kelulusan seluruh siswa-siswi kami. Teruslah berkarya dan menjunjung tinggi kehormatan almamater di mana pun kalian berada.'}
              </p>
            </div>

            {/* Himbauan Tertib Pasca Kelulusan */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pemberitahuan Tertib & Larangan Pasca Pengumuman</span>
              </div>
              <p className="leading-relaxed text-amber-900/90 text-[11px] pl-6">
                {config?.appealNotice ||
                  'Dihimbau kepada seluruh siswa untuk merayakan kelulusan secara santun dan bersyukur di rumah masing-masing. Dilarang keras konvoi di jalan dan mencoret seragam.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PRATINJAU DOKUMEN SKL UNTUK SISWA */}
      {selectedStudentForSkl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scale-in text-slate-900 max-h-[92vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 no-print sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  Surat Keterangan Lulus (SKL) Resmi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={() => handleDownloadSklPdf(selectedStudentForSkl)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  {isExportingPdf ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Membuat PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh PDF</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrintSkl}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForSkl(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* If student has uploaded file */}
            {selectedStudentForSkl.sklFile ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      PDF
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-950 block">
                        Berkas SKL Resmi Terverifikasi Pihak Sekolah
                      </span>
                      <span className="text-[11px] text-blue-800 font-mono">
                        {selectedStudentForSkl.sklFile.fileName} ({formatFileSize(selectedStudentForSkl.sklFile.fileSize)})
                      </span>
                    </div>
                  </div>
                  <a
                    href={selectedStudentForSkl.sklFile.dataUrl}
                    download={selectedStudentForSkl.sklFile.fileName}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File PDF Asli</span>
                  </a>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 h-[520px]">
                  <iframe
                    src={selectedStudentForSkl.sklFile.dataUrl}
                    title="Berkas SKL"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            ) : (
              /* Print & View Area for the School Template */
              <div id="printable-skl" className="space-y-6 text-xs sm:text-sm font-serif relative">
                {tpl.watermarkText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-5xl font-bold text-slate-900/5 -rotate-45 uppercase tracking-widest">
                      {tpl.watermarkText}
                    </span>
                  </div>
                )}

                {/* Kop Surat Sekolah */}
                <div className="border-b-2 border-double border-slate-900 pb-4 flex items-center gap-4 text-center">
                  {tpl.showLogo && schoolIdentity.logo?.url && (
                    <div className="w-16 h-16 shrink-0">
                      <img
                        src={schoolIdentity.logo.url}
                        alt={schoolIdentity.schoolName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-0.5">
                    {tpl.kopHeader1 && (
                      <span className="text-[10px] font-sans font-bold text-slate-700 uppercase tracking-widest block">
                        {tpl.kopHeader1}
                      </span>
                    )}
                    {tpl.kopHeader2 && (
                      <span className="text-[10px] font-sans font-bold text-slate-700 uppercase tracking-wider block">
                        {tpl.kopHeader2}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-black tracking-tight font-sans text-slate-900 uppercase">
                      {tpl.customSchoolName || schoolIdentity.schoolName}
                    </h3>
                    <p className="text-[10px] font-sans text-slate-600">
                      {tpl.kopAddress || schoolIdentity.address}
                    </p>
                    <p className="text-[10px] font-sans text-slate-600">
                      {tpl.kopContact || `Telp: ${schoolIdentity.phone} • Email: ${schoolIdentity.email}`}
                    </p>
                  </div>
                </div>

                {/* Judul Surat */}
                <div className="text-center space-y-1">
                  <h4 className="text-sm sm:text-base font-black uppercase underline tracking-wider">
                    {tpl.documentTitle}
                  </h4>
                  <p className="text-xs font-mono text-slate-700">
                    Nomor: {selectedStudentForSkl.customSklNumber || tpl.letterNumberPrefix || config?.skNumber}
                  </p>
                </div>

                {/* Isi Surat */}
                <div className="space-y-3 leading-relaxed text-xs sm:text-sm font-sans">
                  <p className="text-justify">{tpl.openingText}</p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-y-2 text-xs">
                    <span className="text-slate-500 font-medium">Nama Siswa</span>
                    <span className="col-span-2 font-bold text-slate-900">: {selectedStudentForSkl.name}</span>

                    <span className="text-slate-500 font-medium">Nomor Induk Siswa Nasional (NISN)</span>
                    <span className="col-span-2 font-mono font-bold">: {selectedStudentForSkl.nisn}</span>

                    {tpl.showNis && selectedStudentForSkl.nis && (
                      <>
                        <span className="text-slate-500 font-medium">Nomor Induk Siswa (NIS)</span>
                        <span className="col-span-2 font-mono">: {selectedStudentForSkl.nis}</span>
                      </>
                    )}

                    {tpl.showExamNumber && selectedStudentForSkl.examNumber && (
                      <>
                        <span className="text-slate-500 font-medium">Nomor Peserta Ujian</span>
                        <span className="col-span-2 font-mono">: {selectedStudentForSkl.examNumber}</span>
                      </>
                    )}

                    {tpl.showBirthInfo && selectedStudentForSkl.birthInfo && (
                      <>
                        <span className="text-slate-500 font-medium">Tempat, Tanggal Lahir</span>
                        <span className="col-span-2">: {selectedStudentForSkl.birthInfo}</span>
                      </>
                    )}

                    {tpl.showMajor && selectedStudentForSkl.major && (
                      <>
                        <span className="text-slate-500 font-medium">Peminatan / Program</span>
                        <span className="col-span-2 font-semibold">: {selectedStudentForSkl.major}</span>
                      </>
                    )}
                  </div>

                  <p className="text-justify">{tpl.declarationText}</p>

                  <div className="text-center py-2">
                    <div className="inline-block px-6 py-2 rounded-xl bg-emerald-600 text-white font-black text-base sm:text-lg tracking-widest uppercase shadow-sm">
                      {selectedStudentForSkl.status}
                    </div>
                    {tpl.showAverageScore && (
                      <p className="text-[11px] text-slate-600 mt-1 font-mono font-bold">
                        Nilai Rata-rata Ujian Sekolah: {selectedStudentForSkl.averageScore.toFixed(1)} / 100
                      </p>
                    )}
                  </div>

                  {/* Scores Table if enabled */}
                  {tpl.showScoresTable && selectedStudentForSkl.scores && selectedStudentForSkl.scores.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden my-3">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 font-bold text-slate-700">
                          <tr>
                            <th className="p-2 text-center w-8">No</th>
                            <th className="p-2">Mata Pelajaran</th>
                            <th className="p-2 text-center w-24">Nilai Akhir</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedStudentForSkl.scores.map((sc, i) => (
                            <tr key={i}>
                              <td className="p-2 text-center text-slate-400">{i + 1}</td>
                              <td className="p-2 font-medium text-slate-800">{sc.subject}</td>
                              <td className="p-2 text-center font-bold font-mono text-slate-900">{sc.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p className="text-justify text-[11px] text-slate-600">
                    {tpl.closingText}
                  </p>
                </div>

                {/* Tanda Tangan & QR Dokumen */}
                <div className="pt-6 flex items-end justify-between font-sans text-xs">
                  {tpl.showQrCode ? (
                    <div className="space-y-1 text-center border border-dashed border-slate-300 p-2 rounded-xl">
                      <span className="text-[9px] text-blue-600 block font-bold font-mono">
                        VERIFIKASI RESMI
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded block my-1">
                        SKL-{selectedStudentForSkl.nisn}-2026
                      </span>
                      <span className="text-[8px] text-slate-400 block font-mono">Divalidasi Sistem Digital</span>
                    </div>
                  ) : (
                    <div />
                  )}

                  <div className="text-right space-y-1 min-w-[200px]">
                    <p className="text-slate-600">
                      {tpl.letterCity}, {tpl.letterDate}
                    </p>
                    <p className="font-semibold text-slate-700">
                      {tpl.signatureTitle}
                    </p>
                    <div className="h-16 flex items-center justify-end relative">
                      {tpl.stampImageUrl && (
                        <img
                          src={tpl.stampImageUrl}
                          alt="Cap Stempel"
                          className="h-16 object-contain absolute right-10 opacity-85 pointer-events-none"
                        />
                      )}
                      {tpl.signatureImageUrl ? (
                        <img
                          src={tpl.signatureImageUrl}
                          alt="Tanda Tangan"
                          className="h-12 object-contain"
                        />
                      ) : (
                        <span className="text-[11px] italic text-slate-400 border-b border-slate-300 pb-0.5">
                          [Ditandatangani Secara Elektronik]
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 underline">
                      {tpl.signatoryName || schoolIdentity.principalName}
                    </p>
                    {tpl.signatoryNip && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        NIP. {tpl.signatoryNip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
