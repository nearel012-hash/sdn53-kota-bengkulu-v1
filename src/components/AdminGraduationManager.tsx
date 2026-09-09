import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import {
  GraduationCap,
  Save,
  Check,
  Plus,
  Trash2,
  Edit2,
  Search,
  RotateCcw,
  FileText,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  X,
  Upload,
  Download,
  Eye,
  FileCheck,
  Sliders,
  Printer,
  Sparkles,
  Award,
  AlertCircle,
  FolderArchive,
  Files
} from 'lucide-react';
import {
  GraduationStudent,
  GraduationConfig,
  SchoolIdentity,
  SklTemplateConfig
} from '../types';
import {
  getGraduationConfig,
  saveGraduationConfig,
  getGraduationStudents,
  saveGraduationStudents,
  resetGraduationData,
  DEFAULT_SKL_TEMPLATE,
  downloadStudentSkl
} from '../services/storage';
import { formatFileSize } from '../utils/fileValidation';
import BulkSklUploadModal from './BulkSklUploadModal';

interface AdminGraduationManagerProps {
  schoolIdentity: SchoolIdentity;
}

type TabType = 'students' | 'template' | 'config';

export default function AdminGraduationManager({ schoolIdentity }: AdminGraduationManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [config, setConfig] = useState<GraduationConfig | null>(null);
  const [students, setStudents] = useState<GraduationStudent[]>([]);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'uploaded' | 'template' | 'passed'>('all');

  // Student Edit / Add Modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<GraduationStudent | null>(null);
  const [studentForm, setStudentForm] = useState<GraduationStudent>({
    id: '',
    nisn: '',
    examNumber: '',
    name: '',
    nis: '',
    birthInfo: '',
    major: 'MIPA (Matematika & IPA)',
    status: 'LULUS',
    averageScore: 90.0,
    notes: '',
    sklFile: undefined,
    customSklNumber: ''
  });

  // Preview SKL Modal
  const [previewStudent, setPreviewStudent] = useState<GraduationStudent | null>(null);

  // Bulk SKL upload modal
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Hidden File Input for quick row upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quickUploadStudentId, setQuickUploadStudentId] = useState<string | null>(null);

  const loadAllData = async () => {
    const cfg = await getGraduationConfig();
    const stdList = await getGraduationStudents();
    
    // Ensure template exists
    if (!cfg.sklTemplate) {
      cfg.sklTemplate = { ...DEFAULT_SKL_TEMPLATE };
    }
    setConfig(cfg);
    setStudents(stdList);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (msg: string) => {
    setSavedSuccess(msg);
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  const handleSaveBulkSkl = async (updates: { studentId: string; file: File; dataUrl: string }[]) => {
    const updateMap = new Map<string, { file: File; dataUrl: string }>();
    updates.forEach((u) => updateMap.set(u.studentId, { file: u.file, dataUrl: u.dataUrl }));

    const nowStr = new Date().toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const updatedList = students.map((std) => {
      const hit = updateMap.get(std.id);
      if (hit) {
        return {
          ...std,
          sklFile: {
            fileName: hit.file.name,
            fileType: hit.file.type || 'application/pdf',
            fileSize: hit.file.size,
            dataUrl: hit.dataUrl,
            uploadedAt: nowStr
          }
        };
      }
      return std;
    });

    setStudents(updatedList);
    await saveGraduationStudents(updatedList);
    showNotification(`Berhasil mengunggah dan memasangkan ${updates.length} berkas SKL siswa secara kolektif!`);
  };

  const handleSaveConfig = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!config) return;
    try {
      await saveGraduationConfig(config);
      showNotification('Pengaturan dan Format SKL berhasil disimpan!');
    } catch (err) {
      console.error('Failed to save graduation config', err);
    }
  };

  const handleUpdateTemplate = (updates: Partial<SklTemplateConfig>) => {
    if (!config) return;
    const currentTpl = config.sklTemplate || DEFAULT_SKL_TEMPLATE;
    const updatedTpl = { ...currentTpl, ...updates };
    setConfig({ ...config, sklTemplate: updatedTpl });
  };

  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      id: `grad-${Date.now()}`,
      nisn: '',
      examNumber: `01-001-${String(students.length + 1).padStart(3, '0')}-9`,
      name: '',
      nis: `212210${String(students.length + 1).padStart(3, '0')}`,
      birthInfo: 'Jakarta, 10 Januari 2007',
      major: 'MIPA (Matematika & IPA)',
      status: 'LULUS',
      averageScore: 90.0,
      notes: '',
      sklFile: undefined,
      customSklNumber: ''
    });
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (std: GraduationStudent) => {
    setEditingStudent(std);
    setStudentForm({ ...std });
    setIsStudentModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Yakin ingin menghapus data siswa ini dari daftar kelulusan?')) {
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      await saveGraduationStudents(updated);
      showNotification('Data siswa berhasil dihapus.');
    }
  };

  // Upload SKL File in Edit Modal
  const handleModalFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      setStudentForm({
        ...studentForm,
        sklFile: {
          fileName: file.name,
          fileType: file.type || 'application/pdf',
          fileSize: file.size,
          dataUrl: dataUrl,
          uploadedAt: new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveModalFile = () => {
    setStudentForm({
      ...studentForm,
      sklFile: undefined
    });
  };

  // Quick direct upload for row
  const handleTriggerQuickUpload = (studentId: string) => {
    setQuickUploadStudentId(studentId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleQuickFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadStudentId) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      const updatedList = students.map((std) => {
        if (std.id === quickUploadStudentId) {
          return {
            ...std,
            sklFile: {
              fileName: file.name,
              fileType: file.type || 'application/pdf',
              fileSize: file.size,
              dataUrl: dataUrl,
              uploadedAt: new Date().toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
            }
          };
        }
        return std;
      });

      setStudents(updatedList);
      await saveGraduationStudents(updatedList);
      showNotification(`File SKL untuk ${file.name} berhasil diunggah!`);
      setQuickUploadStudentId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveStudentFile = async (studentId: string) => {
    if (confirm('Hapus file SKL siswa ini? Siswa akan otomatis menggunakan Format SKL Resmi Sekolah.')) {
      const updatedList = students.map((std) => {
        if (std.id === studentId) {
          return { ...std, sklFile: undefined };
        }
        return std;
      });
      setStudents(updatedList);
      await saveGraduationStudents(updatedList);
      showNotification('File SKL siswa dihapus. Format SKL kembali ke mode otomatis.');
    }
  };

  // Stamp / Signature Upload for Format Designer
  const handleSignatureUpload = (e: ChangeEvent<HTMLInputElement>, type: 'signature' | 'stamp') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (type === 'signature') {
        handleUpdateTemplate({ signatureImageUrl: dataUrl, signatureType: 'image' });
      } else {
        handleUpdateTemplate({ stampImageUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStudent = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.nisn) {
      alert('Nama dan NISN wajib diisi.');
      return;
    }

    let updatedList: GraduationStudent[];
    if (editingStudent) {
      updatedList = students.map((s) => (s.id === studentForm.id ? studentForm : s));
    } else {
      updatedList = [studentForm, ...students];
    }

    setStudents(updatedList);
    await saveGraduationStudents(updatedList);
    setIsStudentModalOpen(false);
    showNotification('Data siswa berhasil disimpan.');
  };

  const handleResetData = async () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mereset seluruh data kelulusan ke preset standar? Seluruh file dan kustomisasi format akan diganti dengan data contoh.'
      )
    ) {
      const res = await resetGraduationData();
      setConfig(res.config);
      setStudents(res.students);
      showNotification('Data kelulusan telah direset ke preset standar sekolah.');
    }
  };

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      s.name.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.examNumber.toLowerCase().includes(q) ||
      s.major.toLowerCase().includes(q);

    if (!matchQuery) return false;

    if (statusFilter === 'uploaded') return !!s.sklFile;
    if (statusFilter === 'template') return !s.sklFile;
    if (statusFilter === 'passed') return s.status === 'LULUS';
    return true;
  });

  const tpl = config?.sklTemplate || DEFAULT_SKL_TEMPLATE;
  const sampleStudent = students[0] || studentForm;

  return (
    <div id="admin-graduation-manager" className="space-y-6">
      {/* Hidden File Input for Quick Row Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleQuickFileInputChange}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">Pengelolaan Kelulusan & Berkas SKL</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Portal Kelulusan
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Upload file SKL langsung untuk siswa atau gunakan desainer format SKL otomatis agar siswa dapat mengunduh SKL resmi mandiri.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkUploadOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            title="Upload banyak berkas SKL (PDF/DOC) sekaligus secara otomatis"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Upload Kolektif SKL</span>
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
            title="Reset ke contoh data standar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Data Contoh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddStudent}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Siswa</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{savedSuccess}</span>
        </div>
      )}

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl px-3 pt-2 shadow-xs gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Data Siswa & Upload SKL</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('template')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'template'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Desainer & Format SKL Sekolah</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-bold uppercase">
            Format Otomatis
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('config')}
          className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'config'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Status Rilis & Maklumat</span>
        </button>
      </div>

      {/* TAB 1: DATA SISWA & UPLOAD SKL */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Daftar Siswa & Status Berkas SKL</span>
              </h3>
              <p className="text-xs text-slate-500">
                Siswa dapat langsung mengunduh file PDF khusus yang Anda upload, atau otomatis mengunduh Format SKL Resmi Sekolah.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter chips */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    statusFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Semua ({students.length})
                </button>
                <button
                  onClick={() => setStatusFilter('uploaded')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    statusFilter === 'uploaded' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  File Terunggah ({students.filter((s) => !!s.sklFile).length})
                </button>
                <button
                  onClick={() => setStatusFilter('template')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    statusFilter === 'template' ? 'bg-white shadow-xs text-emerald-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Format Otomatis ({students.filter((s) => !s.sklFile).length})
                </button>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari siswa atau NISN..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Fleksibilitas Pengunduhan SKL Siswa:</strong>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  • Jika berkas SKL diunggah, siswa langsung mengunduh berkas asli tersebut. Jika tidak diunggah, sistem otomatis menyusun SKL resmi dari <strong>Desainer Format SKL Sekolah</strong>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsBulkUploadOpen(true)}
              className="self-start sm:self-auto shrink-0 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Upload Kolektif SKL</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">NISN / No. Ujian</th>
                  <th className="py-2.5 px-3">Peminatan</th>
                  <th className="py-2.5 px-3">Nilai</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Berkas SKL Siswa</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((std, idx) => (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{std.name}</div>
                        <div className="text-[10px] text-slate-400">{std.birthInfo}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-semibold text-slate-700">{std.nisn}</div>
                        <div className="font-mono text-[10px] text-slate-400">{std.examNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{std.major}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                        {std.averageScore.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            std.status === 'LULUS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {std.sklFile ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-semibold">
                              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span className="truncate max-w-[130px]" title={std.sklFile.fileName}>
                                {std.sklFile.fileName}
                              </span>
                              <span className="text-[10px] text-blue-500 font-normal">
                                ({formatFileSize(std.sklFile.fileSize)})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                              <button
                                onClick={() => downloadStudentSkl(std, config || ({} as any), schoolIdentity)}
                                className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
                                title="Unduh file yang diunggah"
                              >
                                <Download className="w-2.5 h-2.5" />
                                <span>Unduh</span>
                              </button>
                              <span>•</span>
                              <button
                                onClick={() => handleTriggerQuickUpload(std.id)}
                                className="text-slate-500 hover:text-slate-800 hover:underline"
                                title="Ganti file dengan berkas baru"
                              >
                                Ganti File
                              </button>
                              <span>•</span>
                              <button
                                onClick={() => handleRemoveStudentFile(std.id)}
                                className="text-rose-500 hover:text-rose-700 hover:underline"
                                title="Hapus file (beralih ke format otomatis)"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold">
                              <span>Format Otomatis Sekolah</span>
                            </span>
                            <div>
                              <button
                                onClick={() => handleTriggerQuickUpload(std.id)}
                                className="text-[10px] text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <Upload className="w-2.5 h-2.5" />
                                <span>Upload File SKL</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        <button
                          onClick={() => setPreviewStudent(std)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Pratinjau / Cetak Dokumen SKL"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditStudent(std)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit data siswa & upload SKL"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(std.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Hapus data siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan pencarian atau filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DESAINER & FORMAT SKL SEKOLAH */}
      {activeTab === 'template' && config && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Desainer & Kustomisasi Format SKL Sekolah</span>
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan kop surat, nomor SK, redaksi kalimat, tanda tangan digital/cap stempel, dan tata letak SKL resmi sekolah.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewStudent(sampleStudent)}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Pratinjau Dokumen SKL</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveConfig()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Format SKL</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Editor Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Bagian 1: Kop Surat Resmi */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>1. Bagian Kop Surat Resmi</span>
                  <span className="text-[10px] text-blue-600 lowercase font-mono">kop resmi instansi</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Header Instansi Tingkat 1 (Pemerintah Provinsi)
                    </label>
                    <input
                      type="text"
                      value={tpl.kopHeader1}
                      onChange={(e) => handleUpdateTemplate({ kopHeader1: e.target.value })}
                      placeholder="PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Header Instansi Tingkat 2 (Dinas Terkait)
                    </label>
                    <input
                      type="text"
                      value={tpl.kopHeader2}
                      onChange={(e) => handleUpdateTemplate({ kopHeader2: e.target.value })}
                      placeholder="DINAS PENDIDIKAN"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Sekolah Khusus Kop (Opsional, kosongkan jika memakai nama utama)
                    </label>
                    <input
                      type="text"
                      value={tpl.customSchoolName || ''}
                      onChange={(e) => handleUpdateTemplate({ customSchoolName: e.target.value })}
                      placeholder={schoolIdentity.schoolName}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alamat Lengkap Pada Kop
                    </label>
                    <input
                      type="text"
                      value={tpl.kopAddress || ''}
                      onChange={(e) => handleUpdateTemplate({ kopAddress: e.target.value })}
                      placeholder={schoolIdentity.address}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kontak Telepon, Website & Email Pada Kop
                    </label>
                    <input
                      type="text"
                      value={tpl.kopContact || ''}
                      onChange={(e) => handleUpdateTemplate({ kopContact: e.target.value })}
                      placeholder={`Telp: ${schoolIdentity.phone} • Email: ${schoolIdentity.email}`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Tampilkan Logo Sekolah Pada Kop</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateTemplate({ showLogo: !tpl.showLogo })}
                      className="text-xl"
                    >
                      {tpl.showLogo ? (
                        <ToggleRight className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Penomoran & Judul Surat */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  2. Judul & Penomoran Dokumen SKL
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Judul Dokumen
                    </label>
                    <input
                      type="text"
                      value={tpl.documentTitle}
                      onChange={(e) => handleUpdateTemplate({ documentTitle: e.target.value })}
                      placeholder="SURAT KETERANGAN LULUS"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Format / Nomor Surat SKL
                    </label>
                    <input
                      type="text"
                      value={tpl.letterNumberPrefix}
                      onChange={(e) => handleUpdateTemplate({ letterNumberPrefix: e.target.value })}
                      placeholder="421.3/SK-089/SMAN1-TN/V/2026"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kota Penetapan Surat
                    </label>
                    <input
                      type="text"
                      value={tpl.letterCity}
                      onChange={(e) => handleUpdateTemplate({ letterCity: e.target.value })}
                      placeholder="Jakarta"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tanggal Surat Diterbitkan
                    </label>
                    <input
                      type="text"
                      value={tpl.letterDate}
                      onChange={(e) => handleUpdateTemplate({ letterDate: e.target.value })}
                      placeholder="5 Mei 2026"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Redaksi Kalimat SKL */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  3. Redaksi Kalimat & Keterangan SKL
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kalimat Pembuka Keterangan
                    </label>
                    <textarea
                      rows={2}
                      value={tpl.openingText}
                      onChange={(e) => handleUpdateTemplate({ openingText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kalimat Pernyataan Kelulusan
                    </label>
                    <textarea
                      rows={2}
                      value={tpl.declarationText}
                      onChange={(e) => handleUpdateTemplate({ declarationText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kalimat Penutup & Masa Berlaku SKL
                    </label>
                    <textarea
                      rows={2}
                      value={tpl.closingText}
                      onChange={(e) => handleUpdateTemplate({ closingText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Toggle checks */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="font-bold text-slate-800 block">Komponen yang Ditampilkan:</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tpl.showAverageScore}
                          onChange={(e) => handleUpdateTemplate({ showAverageScore: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Nilai Rata-rata</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tpl.showScoresTable}
                          onChange={(e) => handleUpdateTemplate({ showScoresTable: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Tabel Nilai Mapel</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tpl.showExamNumber}
                          onChange={(e) => handleUpdateTemplate({ showExamNumber: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Nomor Peserta Ujian</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tpl.showNis}
                          onChange={(e) => handleUpdateTemplate({ showNis: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Nomor Induk Siswa (NIS)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tpl.showBirthInfo}
                          onChange={(e) => handleUpdateTemplate({ showBirthInfo: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Tempat Tanggal Lahir</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tpl.showMajor}
                          onChange={(e) => handleUpdateTemplate({ showMajor: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Peminatan / Jurusan</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tpl.showQrCode}
                          onChange={(e) => handleUpdateTemplate({ showQrCode: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>QR Code Verifikasi</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 4: Pengesahan, Tanda Tangan & Cap Stempel */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  4. Pengesahan, Tanda Tangan & Stempel Resmi
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Jabatan Penandatangan
                      </label>
                      <input
                        type="text"
                        value={tpl.signatureTitle}
                        onChange={(e) => handleUpdateTemplate({ signatureTitle: e.target.value })}
                        placeholder="Kepala Sekolah"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Nama Lengkap & Gelar Penandatangan
                      </label>
                      <input
                        type="text"
                        value={tpl.signatoryName}
                        onChange={(e) => handleUpdateTemplate({ signatoryName: e.target.value })}
                        placeholder={schoolIdentity.principalName}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NIP Penandatangan
                    </label>
                    <input
                      type="text"
                      value={tpl.signatoryNip}
                      onChange={(e) => handleUpdateTemplate({ signatoryNip: e.target.value })}
                      placeholder={schoolIdentity.principalNip || '19680512 199403 1 004'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Upload Tanda Tangan & Cap */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Tanda Tangan */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        Tanda Tangan Digital / Basah
                      </span>
                      {tpl.signatureImageUrl ? (
                        <div className="space-y-1">
                          <img
                            src={tpl.signatureImageUrl}
                            alt="Tanda Tangan"
                            className="h-12 object-contain bg-white rounded border border-slate-200 p-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateTemplate({ signatureImageUrl: undefined })}
                            className="text-[10px] text-rose-600 hover:underline"
                          >
                            Hapus Gambar
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100">
                            <Upload className="w-3 h-3 text-blue-600" />
                            <span>Unggah TTD (PNG)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSignatureUpload(e, 'signature')}
                              className="hidden"
                            />
                          </label>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            Default: Teks Digital Resmi
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Cap / Stempel */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        Cap / Stempel Sekolah (Opsional)
                      </span>
                      {tpl.stampImageUrl ? (
                        <div className="space-y-1">
                          <img
                            src={tpl.stampImageUrl}
                            alt="Stempel"
                            className="h-12 object-contain bg-white rounded border border-slate-200 p-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateTemplate({ stampImageUrl: undefined })}
                            className="text-[10px] text-rose-600 hover:underline"
                          >
                            Hapus Stempel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 hover:bg-slate-100">
                            <Upload className="w-3 h-3 text-emerald-600" />
                            <span>Unggah Stempel (PNG)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSignatureUpload(e, 'stamp')}
                              className="hidden"
                            />
                          </label>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            Format transparan disarankan
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tanda Air / Watermark Latar Belakang
                    </label>
                    <input
                      type="text"
                      value={tpl.watermarkText || ''}
                      onChange={(e) => handleUpdateTemplate({ watermarkText: e.target.value })}
                      placeholder="SURAT RESMI SEKOLAH"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 uppercase tracking-widest text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Preview Format SKL (Replika A4)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Format ini yang otomatis diunduh oleh siswa yang belum memiliki berkas unggahan khusus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadStudentSkl(sampleStudent, config, schoolIdentity)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh Contoh SKL</span>
                </button>
              </div>

              {/* The A4 Container */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-lg text-slate-900 font-serif text-[11px] leading-relaxed relative overflow-hidden">
                {tpl.watermarkText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-4xl font-bold text-slate-900/5 -rotate-45 uppercase tracking-widest">
                      {tpl.watermarkText}
                    </span>
                  </div>
                )}

                {/* Kop Surat */}
                <div className="border-b-2 border-double border-slate-900 pb-3 flex items-center gap-3 text-center mb-4">
                  {tpl.showLogo && schoolIdentity.logo?.url && (
                    <img
                      src={schoolIdentity.logo.url}
                      alt="Logo"
                      className="w-14 h-14 object-contain shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-0.5">
                    {tpl.kopHeader1 && (
                      <h4 className="text-[9px] font-sans font-bold uppercase tracking-wider text-slate-700">
                        {tpl.kopHeader1}
                      </h4>
                    )}
                    {tpl.kopHeader2 && (
                      <h5 className="text-[9px] font-sans font-bold uppercase text-slate-700">
                        {tpl.kopHeader2}
                      </h5>
                    )}
                    <h3 className="text-sm font-black font-sans uppercase tracking-tight text-slate-950">
                      {tpl.customSchoolName || schoolIdentity.schoolName}
                    </h3>
                    <p className="text-[8px] font-sans text-slate-600">
                      {tpl.kopAddress || schoolIdentity.address}
                    </p>
                    <p className="text-[8px] font-sans text-slate-600">
                      {tpl.kopContact || `Telp: ${schoolIdentity.phone} • Web: ${schoolIdentity.website}`}
                    </p>
                  </div>
                </div>

                {/* Judul Surat */}
                <div className="text-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider underline">
                    {tpl.documentTitle}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-600">
                    Nomor: {tpl.letterNumberPrefix || config.skNumber}
                  </p>
                </div>

                {/* Teks Isi */}
                <div className="space-y-2 text-justify">
                  <p>{tpl.openingText}</p>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] space-y-1 font-sans">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Nama Siswa</span>
                      <span className="col-span-2 font-bold">: {sampleStudent.name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">NISN</span>
                      <span className="col-span-2 font-mono font-bold">: {sampleStudent.nisn}</span>
                    </div>
                    {tpl.showNis && (
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">NIS</span>
                        <span className="col-span-2 font-mono">: {sampleStudent.nis}</span>
                      </div>
                    )}
                    {tpl.showExamNumber && (
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">No. Ujian</span>
                        <span className="col-span-2 font-mono">: {sampleStudent.examNumber}</span>
                      </div>
                    )}
                    {tpl.showBirthInfo && (
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                        <span className="col-span-2">: {sampleStudent.birthInfo}</span>
                      </div>
                    )}
                    {tpl.showMajor && (
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Peminatan / Jurusan</span>
                        <span className="col-span-2">: {sampleStudent.major}</span>
                      </div>
                    )}
                  </div>

                  <p>{tpl.declarationText}</p>

                  <div className="text-center my-2">
                    <span className="inline-block px-4 py-1 bg-emerald-700 text-white font-bold tracking-widest text-xs uppercase rounded">
                      {sampleStudent.status}
                    </span>
                    {tpl.showAverageScore && (
                      <div className="text-[10px] font-bold mt-1">
                        Nilai Rata-rata Ujian Sekolah: {sampleStudent.averageScore.toFixed(1)} / 100
                      </div>
                    )}
                  </div>

                  {tpl.showScoresTable && sampleStudent.scores && sampleStudent.scores.length > 0 && (
                    <div className="border border-slate-200 rounded overflow-hidden my-2">
                      <table className="w-full text-left text-[9px]">
                        <thead className="bg-slate-100 font-bold">
                          <tr>
                            <th className="p-1 text-center w-6">No</th>
                            <th className="p-1">Mata Pelajaran</th>
                            <th className="p-1 text-center w-12">Nilai</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sampleStudent.scores.slice(0, 4).map((sc, i) => (
                            <tr key={i}>
                              <td className="p-1 text-center text-slate-400">{i + 1}</td>
                              <td className="p-1">{sc.subject}</td>
                              <td className="p-1 text-center font-bold font-mono">{sc.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-600">{tpl.closingText}</p>
                </div>

                {/* Tanda Tangan */}
                <div className="mt-4 pt-3 flex items-end justify-between font-sans text-[10px]">
                  {tpl.showQrCode && (
                    <div className="text-center border border-dashed border-slate-300 p-1.5 rounded">
                      <span className="text-[7px] font-mono text-blue-600 block font-bold">
                        VERIFIKASI RESMI
                      </span>
                      <span className="font-mono text-[8px] bg-slate-100 px-1 py-0.5 rounded block my-0.5">
                        SKL-{sampleStudent.nisn}-2026
                      </span>
                      <span className="text-[7px] text-slate-400">Portal Publikasi Sekolah</span>
                    </div>
                  )}

                  <div className="text-right min-w-[150px]">
                    <p>
                      {tpl.letterCity}, {tpl.letterDate}
                    </p>
                    <p className="font-bold">{tpl.signatureTitle}</p>
                    <div className="h-10 flex items-center justify-end relative">
                      {tpl.stampImageUrl && (
                        <img
                          src={tpl.stampImageUrl}
                          alt="Stempel"
                          className="h-10 object-contain absolute right-8 opacity-80 pointer-events-none"
                        />
                      )}
                      {tpl.signatureImageUrl ? (
                        <img
                          src={tpl.signatureImageUrl}
                          alt="TTD"
                          className="h-9 object-contain"
                        />
                      ) : (
                        <span className="text-[9px] italic text-slate-400 border-b border-slate-300 pb-0.5">
                          [Ditandatangani Secara Elektronik]
                        </span>
                      )}
                    </div>
                    <p className="font-bold underline">{tpl.signatoryName}</p>
                    {tpl.signatoryNip && <p className="text-[9px] font-mono text-slate-600">NIP. {tpl.signatoryNip}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATUS RILIS & MAKLUMAT */}
      {activeTab === 'config' && config && (
        <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Status Pengumuman & Maklumat Kepala Sekolah</span>
              </h3>
              <p className="text-xs text-slate-500">
                Atur jadwal buka/tutup rilis portal kelulusan serta arahan resmi untuk para siswa.
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Status Rilis Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Status Pengumuman Publik</span>
                <span className="text-[11px] text-slate-500">
                  {config.isReleased ? 'Publik dapat mengecek status & unduh SKL' : 'Portal dalam status tertutup/rahasia'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, isReleased: !config.isReleased })}
                className="text-2xl"
              >
                {config.isReleased ? (
                  <ToggleRight className="w-9 h-9 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-slate-400" />
                )}
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tahun Pelajaran
              </label>
              <input
                type="text"
                value={config.academicYear}
                onChange={(e) => setConfig({ ...config, academicYear: e.target.value })}
                placeholder="2025/2026"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Surat / Penetapan
              </label>
              <input
                type="text"
                value={config.letterDate}
                onChange={(e) => setConfig({ ...config, letterDate: e.target.value })}
                placeholder="Contoh: 5 Mei 2026"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Surat Keputusan (SK) Pleno Kelulusan
              </label>
              <input
                type="text"
                value={config.skNumber}
                onChange={(e) => setConfig({ ...config, skNumber: e.target.value })}
                placeholder="Contoh: 421.3/SK-089/SMAN1-TN/V/2026"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Amanat / Pesan Kepala Sekolah Kepada Seluruh Lulusan
              </label>
              <textarea
                rows={3}
                value={config.headmasterMessage}
                onChange={(e) => setConfig({ ...config, headmasterMessage: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Tata Tertib & Larangan Pasca Kelulusan (Konvoi, Coret Seragam)
              </label>
              <textarea
                rows={2}
                value={config.appealNotice}
                onChange={(e) => setConfig({ ...config, appealNotice: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </form>
      )}

      {/* MODAL TAMBAH / EDIT SISWA & UPLOAD SKL */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 sticky top-0 bg-white z-10">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>{editingStudent ? 'Edit Siswa & Kelola Berkas SKL' : 'Tambah Siswa Kelulusan Baru'}</span>
              </h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Nama sesuai ijazah/rapor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NISN (10 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    placeholder="Contoh: 0068192841"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Peserta Ujian
                  </label>
                  <input
                    type="text"
                    value={studentForm.examNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, examNumber: e.target.value })}
                    placeholder="Contoh: 01-001-001-8"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <input
                    type="text"
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    placeholder="Contoh: 212210001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peminatan / Jurusan
                  </label>
                  <select
                    value={studentForm.major}
                    onChange={(e) => setStudentForm({ ...studentForm, major: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="MIPA (Matematika & IPA)">MIPA (Matematika & IPA)</option>
                    <option value="IPS (Ilmu Pengetahuan Sosial)">IPS (Ilmu Pengetahuan Sosial)</option>
                    <option value="Bahasa & Budaya">Bahasa & Budaya</option>
                    <option value="Teknik Komputer & Jaringan">Teknik Komputer & Jaringan</option>
                    <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tempat, Tanggal Lahir
                </label>
                <input
                  type="text"
                  value={studentForm.birthInfo}
                  onChange={(e) => setStudentForm({ ...studentForm, birthInfo: e.target.value })}
                  placeholder="Contoh: Jakarta, 14 Februari 2007"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nilai Rata-rata Ujian
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={studentForm.averageScore}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, averageScore: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Kelulusan
                  </label>
                  <select
                    value={studentForm.status}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        status: e.target.value as 'LULUS' | 'TIDAK LULUS' | 'DITUNDA'
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white font-bold text-emerald-700"
                  >
                    <option value="LULUS">LULUS</option>
                    <option value="TIDAK LULUS">TIDAK LULUS</option>
                    <option value="DITUNDA">DITUNDA</option>
                  </select>
                </div>
              </div>

              {/* AREA UPLOAD FILE SKL SISWA */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span>Upload File SKL Khusus Siswa (PDF / Dokumen)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Opsional</span>
                </div>

                {studentForm.sklFile ? (
                  <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                          {studentForm.sklFile.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatFileSize(studentForm.sklFile.fileSize)} • Diunggah {studentForm.sklFile.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={studentForm.sklFile.dataUrl}
                        download={studentForm.sklFile.fileName}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold"
                      >
                        Unduh
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveModalFile}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded"
                        title="Hapus file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white transition-colors">
                      <Upload className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-slate-700">
                        Klik untuk Pilih File SKL (PDF, DOC, Scan Gambar)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Ukuran maks 20MB. Siswa dapat langsung mengunduh file ini.
                      </span>
                      <input
                        type="file"
                        onChange={handleModalFileUpload}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        Jika tidak diunggah, siswa akan secara otomatis menggunakan <strong>Format SKL Resmi Sekolah</strong> yang telah didesain.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={studentForm.notes || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                  placeholder="Contoh: Diterima SNBP STEI ITB"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU DOKUMEN SKL */}
      {previewStudent && config && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative animate-scale-in max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pratinjau Surat Keterangan Lulus (SKL)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Siswa: <strong>{previewStudent.name}</strong> • NISN: {previewStudent.nisn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadStudentSkl(previewStudent, config, schoolIdentity)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File SKL</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setPreviewStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* If Student has uploaded specific file */}
            {previewStudent.sklFile ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      PDF
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-950 block">
                        Berkas SKL Khusus Siswa Ini Telah Diunggah
                      </span>
                      <span className="text-[11px] text-blue-800 font-mono">
                        {previewStudent.sklFile.fileName} ({formatFileSize(previewStudent.sklFile.fileSize)})
                      </span>
                    </div>
                  </div>
                  <a
                    href={previewStudent.sklFile.dataUrl}
                    download={previewStudent.sklFile.fileName}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File Asli</span>
                  </a>
                </div>

                {/* Embed iframe or fallback */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 h-[500px]">
                  <iframe
                    src={previewStudent.sklFile.dataUrl}
                    title="SKL File"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            ) : (
              /* Render the Format Document */
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm text-slate-900 font-serif text-xs leading-relaxed relative">
                {tpl.watermarkText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-5xl font-bold text-slate-900/5 -rotate-45 uppercase tracking-widest">
                      {tpl.watermarkText}
                    </span>
                  </div>
                )}

                {/* Kop Surat */}
                <div className="border-b-2 border-double border-slate-900 pb-3 flex items-center gap-4 text-center mb-4">
                  {tpl.showLogo && schoolIdentity.logo?.url && (
                    <img
                      src={schoolIdentity.logo.url}
                      alt="Logo"
                      className="w-16 h-16 object-contain shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-0.5">
                    {tpl.kopHeader1 && (
                      <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700">
                        {tpl.kopHeader1}
                      </h4>
                    )}
                    {tpl.kopHeader2 && (
                      <h5 className="text-[10px] font-sans font-bold uppercase text-slate-700">
                        {tpl.kopHeader2}
                      </h5>
                    )}
                    <h3 className="text-base font-black font-sans uppercase tracking-tight text-slate-950">
                      {tpl.customSchoolName || schoolIdentity.schoolName}
                    </h3>
                    <p className="text-[9px] font-sans text-slate-600">
                      {tpl.kopAddress || schoolIdentity.address}
                    </p>
                    <p className="text-[9px] font-sans text-slate-600">
                      {tpl.kopContact || `Telp: ${schoolIdentity.phone} • Web: ${schoolIdentity.website}`}
                    </p>
                  </div>
                </div>

                {/* Judul Surat */}
                <div className="text-center mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider underline">
                    {tpl.documentTitle}
                  </h4>
                  <p className="text-xs font-mono text-slate-600 mt-0.5">
                    Nomor: {previewStudent.customSklNumber || tpl.letterNumberPrefix || config.skNumber}
                  </p>
                </div>

                {/* Teks Isi */}
                <div className="space-y-2.5 text-justify">
                  <p>{tpl.openingText}</p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 font-sans">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Nama Siswa</span>
                      <span className="col-span-2 font-bold text-slate-900">: {previewStudent.name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Nomor Induk Siswa Nasional (NISN)</span>
                      <span className="col-span-2 font-mono font-bold">: {previewStudent.nisn}</span>
                    </div>
                    {tpl.showNis && (
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Nomor Induk Siswa (NIS)</span>
                        <span className="col-span-2 font-mono">: {previewStudent.nis}</span>
                      </div>
                    )}
                    {tpl.showExamNumber && (
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Nomor Peserta Ujian</span>
                        <span className="col-span-2 font-mono">: {previewStudent.examNumber}</span>
                      </div>
                    )}
                    {tpl.showBirthInfo && (
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                        <span className="col-span-2">: {previewStudent.birthInfo}</span>
                      </div>
                    )}
                    {tpl.showMajor && (
                      <div className="grid grid-cols-3">
                        <span className="text-slate-500">Peminatan / Jurusan</span>
                        <span className="col-span-2 font-semibold">: {previewStudent.major}</span>
                      </div>
                    )}
                  </div>

                  <p>{tpl.declarationText}</p>

                  <div className="text-center my-3">
                    <span className="inline-block px-6 py-1.5 bg-emerald-700 text-white font-black tracking-widest text-sm uppercase rounded-xl">
                      {previewStudent.status}
                    </span>
                    {tpl.showAverageScore && (
                      <div className="text-xs font-bold mt-1.5">
                        Nilai Rata-rata Ujian Sekolah: {previewStudent.averageScore.toFixed(1)} / 100
                      </div>
                    )}
                  </div>

                  {tpl.showScoresTable && previewStudent.scores && previewStudent.scores.length > 0 && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden my-3">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 font-bold">
                          <tr>
                            <th className="p-1.5 text-center w-8">No</th>
                            <th className="p-1.5">Mata Pelajaran</th>
                            <th className="p-1.5 text-center w-20">Nilai Akhir</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewStudent.scores.map((sc, i) => (
                            <tr key={i}>
                              <td className="p-1.5 text-center text-slate-400">{i + 1}</td>
                              <td className="p-1.5">{sc.subject}</td>
                              <td className="p-1.5 text-center font-bold font-mono">{sc.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600">{tpl.closingText}</p>
                </div>

                {/* Tanda Tangan */}
                <div className="mt-6 pt-4 flex items-end justify-between font-sans text-xs">
                  {tpl.showQrCode && (
                    <div className="text-center border border-dashed border-slate-300 p-2 rounded-xl">
                      <span className="text-[9px] font-mono text-blue-600 block font-bold">
                        VERIFIKASI DIGITAL
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded block my-1">
                        SKL-{previewStudent.nisn}-2026
                      </span>
                      <span className="text-[8px] text-slate-400">Divalidasi Portal Sekolah</span>
                    </div>
                  )}

                  <div className="text-right min-w-[200px]">
                    <p>
                      {tpl.letterCity}, {tpl.letterDate}
                    </p>
                    <p className="font-bold">{tpl.signatureTitle}</p>
                    <div className="h-14 flex items-center justify-end relative">
                      {tpl.stampImageUrl && (
                        <img
                          src={tpl.stampImageUrl}
                          alt="Stempel"
                          className="h-14 object-contain absolute right-10 opacity-80 pointer-events-none"
                        />
                      )}
                      {tpl.signatureImageUrl ? (
                        <img
                          src={tpl.signatureImageUrl}
                          alt="TTD"
                          className="h-12 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] italic text-slate-400 border-b border-slate-300 pb-0.5">
                          [Ditandatangani Secara Elektronik]
                        </span>
                      )}
                    </div>
                    <p className="font-bold underline">{tpl.signatoryName}</p>
                    {tpl.signatoryNip && <p className="text-[10px] font-mono text-slate-600">NIP. {tpl.signatoryNip}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Collective SKL Upload Modal */}
      <BulkSklUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        students={students}
        onSaveBulkSkl={handleSaveBulkSkl}
      />
    </div>
  );
}
