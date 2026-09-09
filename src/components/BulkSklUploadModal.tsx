import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Trash2,
  Check,
  Sparkles,
  FileCheck,
  UserCheck,
  HelpCircle,
  FolderArchive
} from 'lucide-react';
import { GraduationStudent } from '../types';
import { formatFileSize } from '../utils/fileValidation';

interface BulkSklUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: GraduationStudent[];
  onSaveBulkSkl: (updates: { studentId: string; file: File; dataUrl: string }[]) => Promise<void>;
}

interface StagedFileItem {
  id: string;
  file: File;
  matchedStudentId: string | null;
  matchMethod: 'nisn' | 'nis' | 'exam' | 'name' | 'manual' | 'none';
  matchDescription: string;
}

export default function BulkSklUploadModal({
  isOpen,
  onClose,
  students,
  onSaveBulkSkl
}: BulkSklUploadModalProps) {
  const [stagedFiles, setStagedFiles] = useState<StagedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'unmatched' | 'matched'>('all');
  const [searchTable, setSearchTable] = useState('');
  const [overwriteExisting, setOverwriteExisting] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Matching algorithm
  const matchFileToStudent = (file: File): { studentId: string | null; method: StagedFileItem['matchMethod']; desc: string } => {
    const rawName = file.name.toLowerCase();
    const cleanName = rawName.replace(/[^a-z0-9]/g, ' ');

    // 1. Try matching by exact 10-digit NISN
    for (const std of students) {
      if (std.nisn && (rawName.includes(std.nisn.toLowerCase()) || cleanName.includes(std.nisn.toLowerCase()))) {
        return {
          studentId: std.id,
          method: 'nisn',
          desc: `Cocok Otomatis via NISN (${std.nisn})`
        };
      }
    }

    // 2. Try matching by NIS
    for (const std of students) {
      if (std.nis && std.nis.length >= 4 && rawName.includes(std.nis.toLowerCase())) {
        return {
          studentId: std.id,
          method: 'nis',
          desc: `Cocok Otomatis via NIS (${std.nis})`
        };
      }
    }

    // 3. Try matching by Nomor Peserta Ujian
    for (const std of students) {
      if (std.examNumber) {
        const cleanExam = std.examNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanRaw = rawName.replace(/[^a-z0-9]/g, '');
        if (cleanExam.length >= 5 && cleanRaw.includes(cleanExam)) {
          return {
            studentId: std.id,
            method: 'exam',
            desc: `Cocok via No. Ujian (${std.examNumber})`
          };
        }
      }
    }

    // 4. Try matching by Student Name (Full or at least 2 distinct words)
    for (const std of students) {
      const stdNameClean = std.name.toLowerCase().trim();
      if (stdNameClean.length >= 3 && cleanName.includes(stdNameClean)) {
        return {
          studentId: std.id,
          method: 'name',
          desc: `Cocok via Nama Siswa ("${std.name}")`
        };
      }

      // Check if multi-word name matches words
      const nameParts = stdNameClean.split(/\s+/).filter((p) => p.length >= 3);
      if (nameParts.length >= 2) {
        const allPartsMatch = nameParts.every((part) => cleanName.includes(part));
        if (allPartsMatch) {
          return {
            studentId: std.id,
            method: 'name',
            desc: `Cocok via Nama Lengkap Siswa ("${std.name}")`
          };
        }
      }
    }

    return {
      studentId: null,
      method: 'none',
      desc: 'Belum terhubung ke siswa (Pilih manual di bawah)'
    };
  };

  const handleProcessIncomingFiles = (incomingList: FileList | File[]) => {
    const newItems: StagedFileItem[] = [];

    Array.from(incomingList).forEach((file) => {
      // Validate file extension
      const validExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validExtensions.includes(ext)) {
        return;
      }

      const match = matchFileToStudent(file);
      newItems.push({
        id: `bulk-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        file,
        matchedStudentId: match.studentId,
        matchMethod: match.method,
        matchDescription: match.desc
      });
    });

    setStagedFiles((prev) => [...prev, ...newItems]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessIncomingFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveStagedItem = (id: string) => {
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleManualAssign = (stagedId: string, studentId: string) => {
    setStagedFiles((prev) =>
      prev.map((item) => {
        if (item.id === stagedId) {
          if (!studentId) {
            return {
              ...item,
              matchedStudentId: null,
              matchMethod: 'none',
              matchDescription: 'Belum terhubung ke siswa'
            };
          }
          const targetStudent = students.find((s) => s.id === studentId);
          return {
            ...item,
            matchedStudentId: studentId,
            matchMethod: 'manual',
            matchDescription: `Dipilih Manual: ${targetStudent?.name} (${targetStudent?.nisn})`
          };
        }
        return item;
      })
    );
  };

  const handleClearAll = () => {
    if (confirm('Kosongkan semua daftar file yang diantrekan?')) {
      setStagedFiles([]);
    }
  };

  const matchedCount = stagedFiles.filter((f) => !!f.matchedStudentId).length;
  const unmatchedCount = stagedFiles.length - matchedCount;

  // Detect duplicate assignments to the same student
  const studentMatchCount = new Map<string, number>();
  stagedFiles.forEach((item) => {
    if (item.matchedStudentId) {
      studentMatchCount.set(item.matchedStudentId, (studentMatchCount.get(item.matchedStudentId) || 0) + 1);
    }
  });
  const hasDuplicates = Array.from(studentMatchCount.values()).some((c) => c > 1);

  // Filter items for table
  const displayedItems = stagedFiles.filter((item) => {
    if (filterMode === 'matched' && !item.matchedStudentId) return false;
    if (filterMode === 'unmatched' && !!item.matchedStudentId) return false;

    if (searchTable.trim()) {
      const q = searchTable.toLowerCase();
      const student = students.find((s) => s.id === item.matchedStudentId);
      const studentName = student ? student.name.toLowerCase() : '';
      const studentNisn = student ? student.nisn.toLowerCase() : '';
      return (
        item.file.name.toLowerCase().includes(q) ||
        studentName.includes(q) ||
        studentNisn.includes(q)
      );
    }
    return true;
  });

  const handleApplyBulkUpload = async () => {
    if (matchedCount === 0) {
      alert('Belum ada file yang terhubung dengan data siswa. Hubungkan file terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    setProcessProgress('Mempersiapkan data dan membaca file...');

    try {
      const validItems = stagedFiles.filter((item) => !!item.matchedStudentId);
      const updates: { studentId: string; file: File; dataUrl: string }[] = [];

      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        setProcessProgress(`Mengonversi berkas ${i + 1} dari ${validItems.length}: ${item.file.name}...`);

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        updates.push({
          studentId: item.matchedStudentId!,
          file: item.file,
          dataUrl
        });
      }

      setProcessProgress('Menyimpan ke basis data kelulusan...');
      await onSaveBulkSkl(updates);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Bulk upload error', err);
      alert('Terjadi kesalahan saat memproses file. Silakan coba kembali.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="bulk-skl-upload-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="bulk-skl-upload-modal-container"
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <FolderArchive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Upload Kolektif Berkas SKL Siswa</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  Batch Multi-File
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Pilih atau seret puluhan file SKL (PDF/DOC) sekaligus. Sistem otomatis mencocokkan nama file dengan data siswa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold">Tips Penamaan File Agar Otomatis Terhubung 100%:</h4>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Sertakan <strong>NISN</strong>, <strong>NIS</strong>, <strong>Nomor Ujian</strong>, atau <strong>Nama Siswa</strong> pada nama file PDF.
                Contoh nama file yang didukung: <br />
                <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[10px] border border-blue-200 text-blue-900">0054231890.pdf</code>,{' '}
                <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[10px] border border-blue-200 text-blue-900">SKL_0054231890_Ahmad_Rizky.pdf</code>,{' '}
                <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-[10px] border border-blue-200 text-blue-900">212210001_Budi_Santoso.pdf</code>.
              </p>
            </div>
          </div>

          {/* Drag & Drop Multi-file Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[0.99]'
                : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              Pilih Banyak File Sekaligus atau Tarik & Lepas ke Sini
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Mendukung banyak file PDF, Dokumen Word, atau Scan SKL. Maksimal 20MB per file.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium text-slate-600">
                Pilih sekaligus (Ctrl+A atau seleksi banyak)
              </span>
            </div>
          </div>

          {/* Staged Files Section */}
          {stagedFiles.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4">
              {/* Toolbar summary & search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Total Berkas: {stagedFiles.length}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {matchedCount} Terhubung
                  </span>
                  {unmatchedCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      {unmatchedCount} Belum Terhubung
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Filter Chips */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setFilterMode('all')}
                      className={`px-2 py-1 rounded-md font-semibold ${
                        filterMode === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setFilterMode('matched')}
                      className={`px-2 py-1 rounded-md font-semibold ${
                        filterMode === 'matched' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      Terhubung ({matchedCount})
                    </button>
                    <button
                      onClick={() => setFilterMode('unmatched')}
                      className={`px-2 py-1 rounded-md font-semibold ${
                        filterMode === 'unmatched' ? 'bg-white shadow-xs text-amber-700' : 'text-slate-500'
                      }`}
                    >
                      Perlu Pilih ({unmatchedCount})
                    </button>
                  </div>

                  {/* Search table */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTable}
                      onChange={(e) => setSearchTable(e.target.value)}
                      placeholder="Cari file..."
                      className="pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-36 sm:w-44"
                    />
                  </div>

                  <button
                    onClick={handleClearAll}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Kosongkan daftar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Duplicate Detection Warning Banner */}
              {hasDuplicates && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Peringatan Duplikasi Siswa:</strong>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Terdapat berkas berbeda yang terhubung ke satu siswa yang sama. Mohon periksa baris yang bertanda kuning untuk memastikan berkas tidak tertukar sebelum menyimpan.
                    </p>
                  </div>
                </div>
              )}

              {/* Table of Matched Files */}
              <div className="max-h-72 overflow-y-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3">Nama Berkas</th>
                      <th className="py-2.5 px-3">Ukuran</th>
                      <th className="py-2.5 px-3">Status Pencocokan</th>
                      <th className="py-2.5 px-3">Hubungkan ke Siswa</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedItems.map((item) => {
                      const matchedStudent = students.find((s) => s.id === item.matchedStudentId);
                      const isDuplicate = item.matchedStudentId
                        ? (studentMatchCount.get(item.matchedStudentId) || 0) > 1
                        : false;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            !item.matchedStudentId
                              ? 'bg-amber-50/30'
                              : isDuplicate
                              ? 'bg-amber-50/60 border-l-4 border-l-amber-500'
                              : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[200px] truncate">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="truncate" title={item.file.name}>
                                {item.file.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {formatFileSize(item.file.size)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="space-y-1">
                              {item.matchMethod === 'nisn' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>100% Akurat (NISN)</span>
                                </span>
                              ) : item.matchMethod === 'exam' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                                  <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />
                                  <span>Akurat (No. Ujian)</span>
                                </span>
                              ) : item.matchMethod === 'nis' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                                  <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                                  <span>Akurat (NIS)</span>
                                </span>
                              ) : item.matchMethod === 'name' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-300">
                                  <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span>Cocok (Nama Siswa)</span>
                                </span>
                              ) : item.matchMethod === 'manual' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                                  <UserCheck className="w-3 h-3 text-slate-600 shrink-0" />
                                  <span>Pilihan Manual Admin</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>Belum Terhubung</span>
                                </span>
                              )}

                              {isDuplicate && (
                                <div className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />
                                  <span>Ada {studentMatchCount.get(item.matchedStudentId!)} file untuk siswa ini</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={item.matchedStudentId || ''}
                              onChange={(e) => handleManualAssign(item.id, e.target.value)}
                              className={`text-xs p-1.5 rounded-lg border focus:outline-none w-full max-w-xs ${
                                item.matchedStudentId
                                  ? isDuplicate
                                    ? 'bg-amber-50 border-amber-400 text-slate-900 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-800'
                                  : 'bg-amber-50/80 border-amber-300 text-amber-900 font-semibold'
                              }`}
                            >
                              <option value="">-- Pilih Siswa Penerima --</option>
                              {students.map((std) => (
                                <option key={std.id} value={std.id}>
                                  {std.name} (NISN: {std.nisn}) {std.sklFile ? '• [Sudah Ada SKL]' : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleRemoveStagedItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus dari antrean"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress Bar while saving */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="flex-1 text-xs font-semibold text-blue-900">
                {processProgress}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {stagedFiles.length === 0 ? (
              <span>Silakan pilih atau seret file SKL di atas untuk memulai.</span>
            ) : (
              <span>
                Siap menerapkan <strong>{matchedCount} berkas SKL</strong> ke profil kelulusan siswa.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApplyBulkUpload}
              disabled={isProcessing || matchedCount === 0}
              className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center justify-center gap-2 ${
                isProcessing || matchedCount === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Simpan & Terapkan ({matchedCount} SKL)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
