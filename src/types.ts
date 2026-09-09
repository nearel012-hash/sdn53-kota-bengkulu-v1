export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

export interface MediaItem {
  id: string;
  name: string;
  originalName: string;
  type: MediaType;
  mimeType: string;
  extension: string;
  size: number; // in bytes
  dataUrl?: string; // base64 or blob url
  blob?: Blob;
  uploadDate: string;
  tags?: string[];
  dimensions?: { width: number; height: number };
  duration?: number;
  description?: string;
  isPreset?: boolean;
  isPublic?: boolean; // false = hidden from "Pusat Unduhan & Media"
  accessLevel?: 'public' | 'private';
}

export type NewsCategory =
  | 'Pengumuman'
  | 'Akademik'
  | 'Prestasi'
  | 'Kegiatan'
  | 'Ekstrakurikuler'
  | 'Agenda';

export type ArticleStatus = 'published' | 'draft';

export type CommentAuthorRole =
  | 'Siswa'
  | 'Orang Tua / Wali'
  | 'Alumni'
  | 'Guru / Tendik'
  | 'Masyarakat Umum'
  | 'Admin / Redaksi Sekolah';

export interface ArticleComment {
  id: string;
  articleId: string;
  authorName: string;
  authorRole: CommentAuthorRole;
  authorEmail?: string;
  content: string;
  createdAt: string;
  likes: number;
  isPinned?: boolean;
  parentId?: string; // ID of parent comment for replies
  status?: 'approved' | 'pending' | 'spam';
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  category: NewsCategory;
  excerpt: string;
  content: string;
  featuredImageUrl?: string;
  featuredMediaId?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  attachedMediaIds: string[];
}

export interface SchoolTheme {
  accentColor: string; // e.g. '#1e40af'
  accentName: string; // e.g. 'Biru Kemdikbud'
  bgType: 'color' | 'image' | 'gradient' | 'pattern';
  bgImageUrl?: string;
  bgMediaId?: string;
  bgColor: string;
  bgGradient: string;
  bgOverlayOpacity: number; // 0 to 100
  bgPattern: 'none' | 'dots' | 'grid' | 'mesh';
  navbarStyle: 'solid' | 'glass' | 'dark';
}

export interface SchoolIdentity {
  schoolName: string;
  tagline: string;
  portalTitle?: string; // Custom headline for homepage portal (e.g. "Portal Informasi & Warta Resmi SMA Negeri 1 Teladan Nusantara")
  portalBadge?: string; // Custom badge/pill text above hero headline (e.g. "SPMB 2026/2027 Resmi Dibuka • Akreditasi A")
  npsn: string;
  accreditation: string;
  principalName: string;
  principalNip?: string;
  principalPhotoUrl?: string; // Data URL or Image URL for principal
  principalPhotoMediaId?: string;
  principalGreeting?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialMedia: {
    instagram: string;
    youtube: string;
    facebook: string;
    tiktok: string;
  };
  vision: string;
  missions: string[];
  logo: {
    url: string;
    mediaId?: string;
    shape: 'circle' | 'square' | 'original';
    height: number;
  };
  theme: SchoolTheme;
}

export interface SklTemplateConfig {
  kopHeader1: string; // e.g. "PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA"
  kopHeader2: string; // e.g. "DINAS PENDIDIKAN"
  customSchoolName?: string;
  kopAddress?: string;
  kopContact?: string;
  showLogo: boolean;
  documentTitle: string; // "SURAT KETERANGAN LULUS"
  letterNumberPrefix: string; // "421.3/SK-089/SMAN1-TN/V/2026"
  letterCity: string; // "Jakarta"
  letterDate: string; // "5 Mei 2026"
  openingText: string;
  declarationText: string;
  closingText: string;
  showAverageScore: boolean;
  showScoresTable: boolean;
  showExamNumber: boolean;
  showNis: boolean;
  showBirthInfo: boolean;
  showMajor: boolean;
  showNotes: boolean;
  showQrCode: boolean;
  signatureTitle: string; // "Kepala Sekolah"
  signatoryName: string;
  signatoryNip: string;
  signatureType: 'digital_text' | 'image' | 'stamp';
  signatureImageUrl?: string;
  stampImageUrl?: string;
  watermarkText?: string;
}

export interface GraduationStudent {
  id: string;
  nisn: string;
  examNumber: string;
  name: string;
  nis: string;
  birthInfo: string;
  major: string;
  status: 'LULUS' | 'TIDAK LULUS' | 'DITUNDA';
  averageScore: number;
  scores?: { subject: string; score: number }[];
  notes?: string;
  sklFile?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    dataUrl: string;
    uploadedAt: string;
  };
  customSklNumber?: string;
}

export interface GraduationConfig {
  academicYear: string;
  announcementDate: string;
  isReleased: boolean;
  skNumber: string;
  letterDate: string;
  headmasterMessage: string;
  appealNotice: string;
  sklTemplate?: SklTemplateConfig;
}

export interface AdminUser {
  isAuthenticated: boolean;
  username: string;
  name: string;
  role: 'admin' | 'editor';
  lastLogin?: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
  name: string;
  updatedAt?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  type: MediaType;
  error?: string;
  warning?: string;
}
