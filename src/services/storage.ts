import {
  MediaItem,
  NewsArticle,
  SchoolIdentity,
  AdminUser,
  AdminCredentials,
  GraduationStudent,
  GraduationConfig,
  SklTemplateConfig,
  ArticleComment
} from '../types';

const DB_NAME = 'SchoolPublishDB';
const DB_VERSION = 2;

// Seed initial school identity
export const DEFAULT_SCHOOL_IDENTITY: SchoolIdentity = {
  schoolName: 'SD Negeri 53 Kota Bengkulu',
  tagline: 'Membentuk Generasi Berkarakter, Cerdas, Berdaya Saing Global & Berakhlak Mulia',
  portalTitle: 'Portal Informasi SD Negeri 53 Kota Bengkulu',
  portalBadge: 'SPMB 2026/2027 Resmi Dibuka • Akreditasi A (Unggul)',
  npsn: '10702488',
  accreditation: 'A (Unggul) - BAN-S/M',
  principalName: 'Kepala SD Negeri 53 Kota Bengkulu',
  principalNip: '19760812 200604 1 008',
  principalPhotoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="tieGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23b91c1c"/><stop offset="100%" stop-color="%23991b1b"/></linearGradient></defs><rect width="400" height="400" fill="url(%23bgGrad)"/><circle cx="200" cy="200" r="180" fill="none" stroke="%233b82f6" stroke-width="2" opacity="0.3"/><circle cx="200" cy="145" r="62" fill="%23f8c291"/><path d="M140 135 C140 85, 260 85, 260 135 C260 100, 240 90, 200 90 C160 90, 140 100, 140 135 Z" fill="%231e293b"/><path d="M165 140 Q200 135 235 140" stroke="%23334155" stroke-width="3" fill="none"/><rect x="155" y="132" width="34" height="18" rx="4" fill="none" stroke="%23334155" stroke-width="3"/><rect x="211" y="132" width="34" height="18" rx="4" fill="none" stroke="%23334155" stroke-width="3"/><line x1="189" y1="140" x2="211" y2="140" stroke="%23334155" stroke-width="3"/><circle cx="172" cy="141" r="3.5" fill="%231e293b"/><circle cx="228" cy="141" r="3.5" fill="%231e293b"/><path d="M196 142 L194 158 L206 158" stroke="%23d35400" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M185 167 C192 165, 208 165, 215 167" stroke="%23334155" stroke-width="4" stroke-linecap="round"/><path d="M188 178 Q200 188 212 178" stroke="%23c0392b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M175 205 L175 240 L225 240 L225 205 Z" fill="%23f8c291"/><path d="M100 370 C100 270, 140 230, 175 230 L225 230 C260 230, 300 270, 300 370 Z" fill="url(%23suitGrad)"/><polygon points="175,230 200,290 225,230" fill="%23ffffff"/><polygon points="194,235 206,235 210,315 200,335 190,315" fill="url(%23tieGrad)"/><path d="M140 250 L185 295 L175 230 Z" fill="%23334155"/><path d="M260 250 L215 295 L225 230 Z" fill="%23334155"/><rect x="130" y="270" width="30" height="8" rx="2" fill="%23f59e0b" opacity="0.9"/><circle cx="138" cy="274" r="2" fill="%23ffffff"/><circle cx="146" cy="274" r="2" fill="%23ffffff"/><circle cx="154" cy="274" r="2" fill="%23ffffff"/></svg>',
  principalGreeting: 'Pendidikan dasar adalah fondasi utama dalam pembentukan karakter luhur, budi pekerti, kecerdasan nalar, dan kreativitas anak. Melalui portal publikasi digital SD Negeri 53 Kota Bengkulu, kami berkomitmen memberikan transparansi informasi, layanan pendidikan terbaik, serta wadah kolaborasi aktif antara sekolah, orang tua, dan masyarakat luas.',
  address: 'Jl. Danau, Panorama, Kec. Singaran Pati, Kota Bengkulu, Bengkulu 38226',
  phone: '(0736) 21543 / 0821-7890-5353',
  email: 'sdnegeri53kotabengkulu@gmail.com',
  website: 'https://sdn53-kota-bengkulu-v1.vercel.app',
  socialMedia: {
    instagram: '@sdn53kotabengkulu',
    youtube: 'SD Negeri 53 Kota Bengkulu TV',
    facebook: 'SDN 53 Kota Bengkulu Official',
    tiktok: '@sdn53bengkulu'
  },
  vision: 'Terwujudnya peserta didik yang berkarakter Profil Pelajar Pancasila, cerdas, berdaya saing global, berakhlak mulia, dan peduli lingkungan.',
  missions: [
    'Menyelenggarakan pembelajaran berkualitas dan bermakna berpusat pada murid melalui Kurikulum Merdeka.',
    'Menumbuhkembangkan budi pekerti luhur, nilai religius, dan budaya disiplin positif sekolah.',
    'Meningkatkan literasi membaca, numerasi dasar, dan prestasi akademik serta non-akademik.',
    'Mewujudkan tata kelola satuan pendidikan yang ramah anak, bersih, sehat (UKS), dan berbasis teknologi informasi.'
  ],
  logo: {
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%231e40af"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="%231e3a8a" stroke="%23f59e0b" stroke-width="3.5"/><circle cx="50" cy="50" r="39" fill="%23ffffff"/><path d="M50 20 L72 32 L72 60 L50 78 L28 60 L28 32 Z" fill="url(%23shieldGrad)" stroke="%23f59e0b" stroke-width="1.8"/><circle cx="50" cy="46" r="10" fill="%23ef4444"/><polygon points="50,38 52.5,43.5 58.5,43.5 53.8,47 55.5,52.5 50,49 44.5,52.5 46.2,47 41.5,43.5 47.5,43.5" fill="%23f59e0b"/><path d="M35 62 Q50 56 65 62" stroke="%23ffffff" stroke-width="2" fill="none"/><text x="50" y="72" font-size="5" font-weight="900" text-anchor="middle" fill="%23f59e0b" font-family="sans-serif">SDN 53</text><text x="50" y="14" font-size="4.2" font-weight="bold" text-anchor="middle" fill="%23f59e0b" font-family="sans-serif">KOTA BENGKULU</text></svg>',
    shape: 'circle',
    height: 52
  },
  theme: {
    accentColor: '#1d4ed8', // Royal Blue
    accentName: 'Biru Prestasi',
    bgType: 'pattern',
    bgColor: '#f8fafc',
    bgGradient: 'from-blue-50 via-slate-50 to-indigo-50',
    bgOverlayOpacity: 10,
    bgPattern: 'mesh',
    navbarStyle: 'solid'
  }
};

// Generates a simple audio tone WAV Blob (for preview and download)
function createSampleAudioBlob(): Blob {
  const sampleRate = 8000;
  const durationSec = 3;
  const numSamples = sampleRate * durationSec;
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true); // block align
  view.setUint16(34, 8, true); // 8-bit
  writeString(36, 'data');
  view.setUint32(40, numSamples, true);

  // Harmonic melody frequencies (G, C, E, G school bell notes)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = t < 0.75 ? 392 : t < 1.5 ? 523.25 : t < 2.25 ? 659.25 : 783.99;
    const sample = 128 + 64 * Math.sin(2 * Math.PI * freq * t) * Math.exp(-((t % 0.75) * 2));
    view.setUint8(44 + i, Math.min(255, Math.max(0, Math.floor(sample))));
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

// Generates a simple sample PDF file Blob
function createSamplePdfBlob(title: string): Blob {
  const content = `%PDF-1.4
1 0 obj
<< /Title (${title}) /Author (SMA Negeri 1 Teladan Nusantara) /Creator (Portal Publikasi Sekolah) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
5 0 obj
<< /Length 260 >>
stream
BT
/F1 20 Tf
50 720 Td
(SMA NEGERI 1 TELADAN NUSANTARA) Tj
0 -30 Td
/F2 14 Tf
(${title}) Tj
0 -24 Td
/F2 11 Tf
(Dokumen Resmi Terverifikasi - Portal Publikasi Digital Sekolah) Tj
0 -20 Td
(Status: Sah dan Berlaku untuk Tahun Ajaran 2026/2027) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000115 00000 n 
0000000166 00000 n 
0000000224 00000 n 
0000000412 00000 n 
trailer
<< /Size 6 /Root 2 0 R /Info 1 0 R >>
startxref
725
%%EOF`;
  return new Blob([content], { type: 'application/pdf' });
}

// Initial seed media items
export const SEED_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-logo-1',
    name: 'Logo Resmi SMAN 1 Teladan.svg',
    originalName: 'Logo Resmi SMAN 1 Teladan.svg',
    type: 'image',
    mimeType: 'image/svg+xml',
    extension: 'svg',
    size: 2450,
    dataUrl: DEFAULT_SCHOOL_IDENTITY.logo.url,
    uploadDate: '2026-08-15 08:30',
    tags: ['logo', 'identitas', 'branding'],
    dimensions: { width: 500, height: 500 },
    description: 'Logo resmi sekolah dengan ornamen bintang prestasi dan lencana kehormatan.',
    isPreset: true
  },
  {
    id: 'media-bg-campus',
    name: 'Gedung_Utama_Kampus_Hijau.jpg',
    originalName: 'Gedung_Utama_Kampus_Hijau.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    size: 485200,
    dataUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1400&q=80',
    uploadDate: '2026-08-20 09:15',
    tags: ['gedung', 'kampus', 'sarana'],
    dimensions: { width: 1400, height: 800 },
    description: 'Fasilitas gedung utama sekolah ramah lingkungan dan ruang multimedia.',
    isPreset: true
  },
  {
    id: 'media-osn-winner',
    name: 'Dokumentasi_Juara_OSN_2026.jpg',
    originalName: 'Dokumentasi_Juara_OSN_2026.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    size: 612400,
    dataUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    uploadDate: '2026-09-01 10:45',
    tags: ['prestasi', 'osn', 'siswa'],
    dimensions: { width: 1200, height: 800 },
    description: 'Foto perayaan tim olimpiade sains bersama Kepala Sekolah dan guru pembimbing.',
    isPreset: true
  },
  {
    id: 'media-ppdb-banner',
    name: 'Spanduk_Informasi_SPMB_2026.jpg',
    originalName: 'Spanduk_Informasi_SPMB_2026.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    size: 532100,
    dataUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    uploadDate: '2026-09-02 11:20',
    tags: ['spmb', 'pengumuman', 'pendaftaran'],
    dimensions: { width: 1200, height: 750 },
    description: 'Banner resmi pembukaan Seleksi Penerimaan Murid Baru (SPMB) jalur prestasi & zonasi.',
    isPreset: true
  },
  {
    id: 'media-mars-audio',
    name: 'Mars_SMAN_1_Teladan_Nusantara.wav',
    originalName: 'Mars_SMAN_1_Teladan_Nusantara.wav',
    type: 'audio',
    mimeType: 'audio/wav',
    extension: 'wav',
    size: 24044,
    uploadDate: '2026-08-25 14:00',
    tags: ['lagu', 'mars', 'kesenian'],
    duration: 3,
    description: 'Rekaman instrumen resmi Mars SMA Negeri 1 Teladan Nusantara.',
    isPreset: true
  },
  {
    id: 'media-doc-ppdb',
    name: 'Formulir_Pendaftaran_SPMB_2026_2027.pdf',
    originalName: 'Formulir_Pendaftaran_SPMB_2026_2027.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    extension: 'pdf',
    size: 142300,
    uploadDate: '2026-09-02 08:00',
    tags: ['spmb', 'formulir', 'dokumen-resmi'],
    description: 'Formulir pendaftaran dan pakta integritas calon murid baru (SPMB) tahun ajaran 2026/2027.',
    isPreset: true
  },
  {
    id: 'media-doc-silabus',
    name: 'Panduan_Kurikulum_Merdeka_2026.docx',
    originalName: 'Panduan_Kurikulum_Merdeka_2026.docx',
    type: 'document',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: 'docx',
    size: 284100,
    uploadDate: '2026-08-28 16:30',
    tags: ['akademik', 'kurikulum', 'guru'],
    description: 'Buku panduan implementasi pembelajaran berbasis proyek dan modul ajar guru.',
    isPreset: true
  },
  {
    id: 'media-doc-jadwal',
    name: 'Matriks_Jadwal_Asesmen_Semester_Genap.xlsx',
    originalName: 'Matriks_Jadwal_Asesmen_Semester_Genap.xlsx',
    type: 'document',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
    size: 96400,
    uploadDate: '2026-09-05 09:10',
    tags: ['jadwal', 'ujian', 'asesmen'],
    description: 'Tabel alokasi ruang ujian, pengawas, dan jadwal mata pelajaran asesmen.',
    isPreset: true
  },
  {
    id: 'media-doc-presentasi',
    name: 'Paparan_Program_Unggulan_Sekolah.pptx',
    originalName: 'Paparan_Program_Unggulan_Sekolah.pptx',
    type: 'document',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: 'pptx',
    size: 1450200,
    uploadDate: '2026-08-30 13:40',
    tags: ['presentasi', 'profil', 'komite'],
    description: 'Slide materi pertemuan orang tua murid dan komite sekolah tahun 2026.',
    isPreset: true
  },
  {
    id: 'media-archive-panduan',
    name: 'Paket_Panduan_Lengkap_Siswa_Baru_2026.zip',
    originalName: 'Paket_Panduan_Lengkap_Siswa_Baru_2026.zip',
    type: 'archive',
    mimeType: 'application/zip',
    extension: 'zip',
    size: 3840200,
    uploadDate: '2026-09-03 15:20',
    tags: ['arsip', 'mpls', 'ekstrakurikuler'],
    description: 'Kumpulan dokumen tata tertib sekolah, formulir ekstrakurikuler, dan brosur fasilitas.',
    isPreset: true
  },
  {
    id: 'media-video-profil',
    name: 'Video_Profil_Dan_Tur_Fasilitas_Sekolah.mp4',
    originalName: 'Video_Profil_Dan_Tur_Fasilitas_Sekolah.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    extension: 'mp4',
    size: 8940000,
    dataUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    uploadDate: '2026-08-18 11:00',
    tags: ['video', 'profil', 'fasilitas'],
    duration: 15,
    description: 'Cuplikan video fasilitas laboratorium sains, perpustakaan digital, dan lapangan olahraga.',
    isPreset: true
  }
];

// Initial seed articles
export const SEED_ARTICLES: NewsArticle[] = [
  {
    id: 'art-rapat-perencanaan-2026',
    title: 'Rapat Penyusunan Perencanaan Program Satuan Pendidikan',
    slug: 'rapat-penyusunan-perencanaan-program-satuan-pendidikan',
    status: 'published',
    category: 'Kegiatan',
    excerpt: 'SD Negeri 53 Kota Bengkulu menyelenggarakan rapat penyusunan perencanaan program satuan pendidikan guna menyelaraskan kurikulum, peningkatan mutu pembelajaran, dan evaluasi capaian tahun ajaran.',
    content: `Dalam rangka meningkatkan mutu layanan pendidikan serta mewujudkan tata kelola sekolah yang akuntabel, adaptif, dan transparan, SD Negeri 53 Kota Bengkulu menyelenggarakan **Rapat Penyusunan Perencanaan Program Satuan Pendidikan**.

Rapat dihadiri oleh Kepala Sekolah, seluruh dewan guru kelas dan guru mata pelajaran, staf tenaga kependidikan, serta perwakilan pengurus Komite Sekolah. Agenda strategis ini difokuskan pada evaluasi program kerja tahun sebelumnya, penyusunan Rencana Kerja Tahunan (RKT), pemetaan kebutuhan sarana belajar murid, serta penguatan implementasi Kurikulum Merdeka.

### 4 Pilar Utama Pembahasan:
1. **Peningkatan Kualitas Pembelajaran**: Penguatan modul ajar interaktif, literasi membaca terpadu, dan numerasi dasar bagi seluruh rombongan belajar murid.
2. **Pengembangan Karakter Profil Pelajar Pancasila**: Program pembiasaan positif di pagi hari, kedisiplinan, serta kegiatan ekstrakurikuler kepramukaan, kesenian daerah, dan olahraga prestasi.
3. **Penguatan Sarana dan Prasarana**: Pemeliharaan lingkungan sekolah yang ramah anak, bersih, sehat (UKS), serta pemanfaatan sarana multimedia penunjang pembelajaran digital.
4. **Kolaborasi Bersama Orang Tua**: Membangun sinergi aktif antara pihak sekolah dan wali murid guna mendukung keberhasilan belajar anak di rumah dan di sekolah.

Kepala Sekolah menyampaikan rasa terima kasih dan apresiasi setinggi-tingginya kepada seluruh dewan guru dan komite atas kerja keras serta dedikasi bersama demi kemajuan putra-putri generasi penerus bangsa di SD Negeri 53 Kota Bengkulu.`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    featuredMediaId: 'media-ppdb-banner',
    author: 'Admin Sekolah',
    createdAt: '2026-09-09 06:48',
    updatedAt: '2026-09-09 06:48',
    publishedAt: '2026-09-09 06:48',
    views: 1250,
    attachedMediaIds: ['media-doc-ppdb', 'media-doc-silabus']
  },
  {
    id: 'art-ppdb-2026',
    title: 'Seleksi Penerimaan Murid Baru (SPMB) Tahun Ajaran 2026/2027 Resmi Dibuka',
    slug: 'seleksi-penerimaan-murid-baru-spmb-2026-2027-resmi-dibuka',
    status: 'published',
    category: 'Pengumuman',
    excerpt: 'SD Negeri 53 Kota Bengkulu membuka pendaftaran calon murid baru (SPMB) melalui jalur afirmasi, zonasi domisili, dan perpindahan tugas orang tua.',
    content: `SD Negeri 53 Kota Bengkulu dengan bangga mengumumkan pembukaan proses Seleksi Penerimaan Murid Baru (SPMB) Tahun Ajaran 2026/2027. Sebagai salah satu sekolah dasar berakreditasi A (Unggul), kami berkomitmen memberikan akses pendidikan bermutu tinggi yang ramah anak bagi seluruh putra-putri bangsa.

### Jalur Pendaftaran yang Tersedia:
1. **Jalur Zonasi Domisili (70%)**: Diperuntukkan bagi calon peserta didik yang berdomisili dalam radius wilayah zonasi sekitar sekolah.
2. **Jalur Afirmasi & KIP (25%)**: Bagi calon peserta didik dari keluarga prasejahtera dan penyandang disabilitas.
3. **Jalur Perpindahan Tugas Orang Tua (5%)**: Bagi calon peserta didik yang orang tuanya pindah tugas dinas ke wilayah Kota Bengkulu.

### Persyaratan Berkas Administrasi:
- Usia 7 tahun atau paling rendah 6 tahun pada tanggal 1 Juli tahun berjalan.
- Akta Kelahiran asli dan fotokopi.
- Kartu Keluarga (KK) asli dan fotokopi.
- Mengisi formulir pendaftaran resmi yang dapat diunduh di bagian bawah artikel ini.

Untuk informasi teknis dan verifikasi berkas fisik, panitia SPMB membuka posko pelayanan di Ruang Pelayanan Terpadu Sekolah setiap hari kerja pukul 08.00 - 14.00 WIB. Silakan unduh formulir pendaftaran dan panduan lengkap melalui lampiran berkas di bawah.`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1400&q=80',
    featuredMediaId: 'media-bg-campus',
    author: 'Panitia SPMB 2026',
    createdAt: '2026-09-02 08:30',
    updatedAt: '2026-09-02 08:30',
    publishedAt: '2026-09-02 08:30',
    views: 1420,
    attachedMediaIds: ['media-doc-ppdb', 'media-archive-panduan']
  },
  {
    id: 'art-osn-gold',
    title: 'Keluarga Besar SMAN 1 Teladan Raih 3 Medali Emas di Olimpiade Sains Nasional 2026',
    slug: 'keluarga-besar-sman-1-teladan-raih-3-medali-emas-osn-2026',
    status: 'published',
    category: 'Prestasi',
    excerpt: 'Prestasi gemilang kembali ditorehkan oleh siswa-siswi terbaik SMAN 1 Teladan Nusantara pada ajang Olimpiade Sains Nasional (OSN) tingkat nasional di bidang Fisika, Kimia, dan Informatika.',
    content: `Kabar membanggakan datang dari arena Olimpiade Sains Nasional (OSN) 2026 yang diselenggarakan oleh Pusat Prestasi Nasional (Puspresnas) Kemendikbudristek. Delegasi SMA Negeri 1 Teladan Nusantara berhasil membawa pulang 3 medali emas dan 1 medali perak.

### Daftar Peraih Medali:
- **Ahmad Fauzan Pratama (Kelas XI MIPA 1)**: Medali Emas Bidang Informatika / Komputer
- **Clarissa Nindya Putri (Kelas XII MIPA 3)**: Medali Emas Bidang Kimia Terapan
- **Bagas Arya Wicaksono (Kelas X-2)**: Medali Emas Bidang Fisika Teori
- **Siti Nurhaliza (Kelas XI MIPA 2)**: Medali Perak Bidang Biologi

Kepala Sekolah, **Drs. H. Bambang Suryono, M.Pd.**, menyampaikan apresiasi setinggi-tingginya kepada para siswa, guru pembina, dan orang tua:
> *"Kemenangan ini adalah buah dari kerja keras, disiplin pembinaan intensif di laboratorium riset sekolah, serta doa bersama seluruh civitas akademika. Semoga prestasi ini menjadi pemantik semangat untuk terus berkontribusi bagi kemajuan sains dan teknologi bangsa."*

Sebagai kelanjutan dari prestasi ini, ketiga peraih medali emas akan masuk dalam pemusatan latihan nasional (Pelatnas) mewakili Indonesia pada ajang International Olympiad di tingkat dunia. Selamat untuk para jawara muda Teladan!`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    featuredMediaId: 'media-osn-winner',
    author: 'Tim Humas & Prestasi',
    createdAt: '2026-09-04 14:15',
    updatedAt: '2026-09-04 14:15',
    publishedAt: '2026-09-04 14:15',
    views: 980,
    attachedMediaIds: ['media-osn-winner', 'media-bg-campus']
  },
  {
    id: 'art-mars-release',
    title: 'Peluncuran Resmi Mars Sekolah dan Pagelaran Budaya Siswa Nusantara',
    slug: 'peluncuran-resmi-mars-sekolah-dan-pagelaran-budaya-nusantara',
    status: 'published',
    category: 'Kegiatan',
    excerpt: 'Memperingati Dies Natalis, sekolah meresmikan aransemen orkestrasi Mars SMAN 1 Teladan Nusantara disertai penayangan video tur kampus dan pagelaran tari tradisi kolosal.',
    content: `Dalam rangkaian perayaan Dies Natalis ke-38, SMA Negeri 1 Teladan Nusantara resmi meluncurkan rekaman audio resmi Mars Sekolah dengan aransemen modern yang penuh semangat kebangsaan.

Mars sekolah ini diciptakan untuk menanamkan nilai-nilai integritas, ketekunan belajar, dan kecintaan pada tanah air. Pada kesempatan ini pula, ekstrakurikuler Paduan Suara Voice of Teladan berkolaborasi dengan ekskul Karawitan dan Orkestra mempersembahkan penampilan live di hadapan para alumni, komite, dan tamu kehormatan.

Acara juga dimeriahkan dengan pemutaran video dokumenter profil sekolah yang merangkum perjalanan prestasi dan transformasi ruang belajar berbasis digital. 

Dengarkan rekaman audio Mars Sekolah dan saksikan cuplikan video kegiatan melalui pemutar media terlampir di artikel ini. Civitas akademika juga diperkenankan mengunduh dokumen panduan serta file rekaman untuk keperluan upacara bendera dan kegiatan resmi sekolah.`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1400&q=80',
    featuredMediaId: 'media-bg-campus',
    author: 'Bidang Kesiswaan & Seni',
    createdAt: '2026-09-05 10:00',
    updatedAt: '2026-09-05 10:00',
    publishedAt: '2026-09-05 10:00',
    views: 650,
    attachedMediaIds: ['media-mars-audio', 'media-video-profil']
  },
  {
    id: 'art-draft-exam',
    title: 'Draf - Matriks Jadwal dan Tata Tertib Asesmen Sumatif Semester Genap 2026',
    slug: 'draf-matriks-jadwal-tata-tertib-asesmen-genap-2026',
    status: 'draft',
    category: 'Akademik',
    excerpt: 'Draf informasi pelaksanaan asesmen sumatif semester genap, pembagian ruang ujian komputer, dan syarat ketuntasan belajar siswa kelas X, XI, dan XII.',
    content: `Asesmen Sumatif Akhir Semester Genap Tahun Ajaran 2026/2027 direncanakan berlangsung mulai pekan ke-3 Mei 2026. Ujian akan diselenggarakan secara semi-daring menggunakan aplikasi Computer Based Test (CBT) di laboratorium komputer sekolah.

Dokumen ini saat ini masih dalam status penelaahan (Draf) oleh tim kurikulum dan dewan guru sebelum dipublikasikan secara resmi ke wali murid. File matriks jadwal dan panduan pengawas telah terlampir untuk keperluan verifikasi internal panitia.`,
    featuredImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    author: 'Tim Kurikulum & Asesmen',
    createdAt: '2026-09-06 11:30',
    updatedAt: '2026-09-06 11:30',
    views: 24,
    attachedMediaIds: ['media-doc-jadwal', 'media-doc-silabus']
  }
];

// Seed initial article comments
export const SEED_COMMENTS: ArticleComment[] = [
  {
    id: 'comm-1',
    articleId: 'art-ppdb-2026',
    authorName: 'Bunda Ratna Suryani',
    authorRole: 'Orang Tua / Wali',
    authorEmail: 'ratna.suryani@gmail.com',
    content: 'Alhamdulillah informasi SPMB jalur zonasi dan prestasi sangat jelas dan transparan. Lampiran formulir PDF juga berhasil kami unduh tanpa kendala. Terima kasih panitia SPMB SMA Negeri 1 Teladan.',
    createdAt: '2026-09-02 09:15',
    likes: 8,
    status: 'approved',
    isPinned: false
  },
  {
    id: 'comm-2',
    articleId: 'art-ppdb-2026',
    authorName: 'Panitia SPMB Teladan',
    authorRole: 'Admin / Redaksi Sekolah',
    authorEmail: 'spmb@sman1teladannusantara.sch.id',
    content: 'Terima kasih atas tanggapannya Ibu Ratna. Kami informasikan bahwa meja bantuan (helpdesk) dan verifikasi berkas di aula sekolah buka setiap hari kerja pukul 08.00 - 15.00 WIB.',
    createdAt: '2026-09-02 10:20',
    likes: 12,
    status: 'approved',
    parentId: 'comm-1',
    isPinned: true
  },
  {
    id: 'comm-3',
    articleId: 'art-ppdb-2026',
    authorName: 'Fajar Nugraha',
    authorRole: 'Siswa',
    content: 'Bismillah, semoga tahun ini saya bisa diterima di SMA Negeri 1 Teladan melalui jalur SPMB prestasi dan bergabung di tim riset sains dan OSIS. Mohon doanya Bapak/Ibu!',
    createdAt: '2026-09-02 14:05',
    likes: 15,
    status: 'approved'
  },
  {
    id: 'comm-4',
    articleId: 'art-mars-launch',
    authorName: 'Rizal Pratama, S.Kom.',
    authorRole: 'Alumni',
    authorEmail: 'rizal.alumni@teladan.net',
    content: 'Sebagai alumni angkatan 2021, kami sangat bangga dan terharu mendengarkan aransemen orkestra Mars SMAN 1 Teladan yang baru! Pemutar audionya sangat responsif dan bisa langsung diputar di ponsel. Sukses terus almamater tercinta.',
    createdAt: '2026-09-05 11:30',
    likes: 11,
    status: 'approved',
    isPinned: true
  },
  {
    id: 'comm-5',
    articleId: 'art-mars-launch',
    authorName: 'Ibu Dra. Hj. Sri Wahyuni',
    authorRole: 'Guru / Tendik',
    content: 'Syair dan nada mars ini sarat dengan karakter Profil Pelajar Pancasila dan budaya berprestasi. Sangat bersemangat menyanyikannya bersama seluruh siswa setiap upacara hari Senin.',
    createdAt: '2026-09-05 13:45',
    likes: 7,
    status: 'approved'
  },
  {
    id: 'comm-6',
    articleId: 'art-draft-exam',
    authorName: 'Drs. Hendro Wibowo',
    authorRole: 'Guru / Tendik',
    content: 'Catatan draf: Laboratorium komputer 2 dan 3 sudah selesai peremajaan jaringan LAN untuk persiapan asesmen berbasis komputer.',
    createdAt: '2026-09-06 14:00',
    likes: 3,
    status: 'approved'
  }
];

// Open and initialize IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('articles')) {
        db.createObjectStore('articles', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('mediaBlobs')) {
        db.createObjectStore('mediaBlobs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('comments')) {
        db.createObjectStore('comments', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Ensure database is populated on first launch
export async function initializeDatabase(): Promise<void> {
  try {
    const db = await openDB();

    // Check settings
    const settingsTx = db.transaction('settings', 'readwrite');
    const settingsStore = settingsTx.objectStore('settings');
    const existingSettingsReq = settingsStore.get('school-identity');

    existingSettingsReq.onsuccess = () => {
      if (
        !existingSettingsReq.result ||
        !existingSettingsReq.result.data ||
        existingSettingsReq.result.data.schoolName === 'SMA Negeri 1 Teladan Nusantara'
      ) {
        settingsStore.put({ id: 'school-identity', data: DEFAULT_SCHOOL_IDENTITY });
      }
    };

    // Check media
    const mediaTx = db.transaction(['media', 'mediaBlobs'], 'readwrite');
    const mediaStore = mediaTx.objectStore('media');
    const blobStore = mediaTx.objectStore('mediaBlobs');
    const countReq = mediaStore.count();

    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        SEED_MEDIA_ITEMS.forEach((item) => {
          mediaStore.put(item);
        });

        // Store sample blobs for real local downloads and native browser previews
        try {
          const audioBlob = createSampleAudioBlob();
          blobStore.put({ id: 'media-mars-audio', blob: audioBlob });

          const pdfBlob = createSamplePdfBlob('Formulir Pendaftaran SPMB 2026/2027');
          blobStore.put({ id: 'media-doc-ppdb', blob: pdfBlob });

          const zipDummy = new Blob(['PK\x03\x04... Panduan Siswa Baru SMAN 1 Teladan ...'], { type: 'application/zip' });
          blobStore.put({ id: 'media-archive-panduan', blob: zipDummy });
        } catch (e) {
          console.warn('Could not seed sample blobs', e);
        }
      }
    };

    // Check articles
    const articleTx = db.transaction('articles', 'readwrite');
    const articleStore = articleTx.objectStore('articles');
    const artCountReq = articleStore.count();

    artCountReq.onsuccess = () => {
      if (artCountReq.result === 0) {
        SEED_ARTICLES.forEach((art) => {
          articleStore.put(art);
        });
      } else {
        // Ensure new SD Negeri 53 Kota Bengkulu featured article is present
        const checkReq = articleStore.get('art-rapat-perencanaan-2026');
        checkReq.onsuccess = () => {
          if (!checkReq.result) {
            articleStore.put(SEED_ARTICLES[0]);
          }
        };
      }
    };

    // Check comments
    if (db.objectStoreNames.contains('comments')) {
      const commentTx = db.transaction('comments', 'readwrite');
      const commentStore = commentTx.objectStore('comments');
      const commentCountReq = commentStore.count();
      commentCountReq.onsuccess = () => {
        if (commentCountReq.result === 0) {
          SEED_COMMENTS.forEach((comm) => {
            commentStore.put(comm);
          });
        }
      };
    }

  } catch (err) {
    console.error('Failed to initialize IndexedDB:', err);
  }
}


// ----------------- MEDIA CRUD OPERATIONS -----------------

export async function getAllMedia(): Promise<MediaItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', 'readonly');
      const store = tx.objectStore('media');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return SEED_MEDIA_ITEMS;
  }
}

export async function getMediaById(id: string): Promise<MediaItem | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('media', 'readonly');
    const store = tx.objectStore('media');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMediaItem(item: MediaItem, fileBlob?: Blob): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(['media', 'mediaBlobs'], 'readwrite');
    const mediaStore = tx.objectStore('media');
    const blobStore = tx.objectStore('mediaBlobs');

    mediaStore.put(item);
    if (fileBlob) {
      blobStore.put({ id: item.id, blob: fileBlob });
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteMediaItem(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(['media', 'mediaBlobs'], 'readwrite');
    tx.objectStore('media').delete(id);
    tx.objectStore('mediaBlobs').delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateMediaItemVisibility(id: string, isPublic: boolean): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('media', 'readwrite');
    const store = tx.objectStore('media');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.isPublic = isPublic;
        item.accessLevel = isPublic ? 'public' : 'private';
        store.put(item);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMediaBlob(id: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('mediaBlobs', 'readonly');
    const store = tx.objectStore('mediaBlobs');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result?.blob);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Returns a playable/displayable URL for a MediaItem, whether preset URL or IndexedDB Blob.
 */
export async function getMediaObjectUrl(item: MediaItem): Promise<string> {
  if (item.dataUrl && item.dataUrl.trim().length > 0) {
    return item.dataUrl;
  }
  const blob = await getMediaBlob(item.id);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return '';
}

// ----------------- ARTICLES CRUD OPERATIONS -----------------

export async function getAllArticles(): Promise<NewsArticle[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('articles', 'readonly');
      const store = tx.objectStore('articles');
      const req = store.getAll();
      req.onsuccess = () => {
        const list: NewsArticle[] = req.result || [];
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(list.length > 0 ? list : SEED_ARTICLES);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return SEED_ARTICLES;
  }
}

export async function saveArticle(article: NewsArticle): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    store.put(article);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteArticle(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function incrementArticleViews(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('articles', 'readwrite');
    const store = tx.objectStore('articles');
    const req = store.get(id);
    req.onsuccess = () => {
      const art = req.result;
      if (art) {
        art.views = (art.views || 0) + 1;
        store.put(art);
      }
    };
  } catch (e) {
    console.warn('Could not increment views', e);
  }
}

// ----------------- ARTICLE COMMENTS OPERATIONS -----------------

const COMMENTS_STORAGE_FALLBACK_KEY = 'school_article_comments_backup_v1';

function getLocalBackupComments(): ArticleComment[] {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_FALLBACK_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read comments from local backup', err);
  }
  return SEED_COMMENTS;
}

function saveLocalBackupComments(comments: ArticleComment[]): void {
  try {
    localStorage.setItem(COMMENTS_STORAGE_FALLBACK_KEY, JSON.stringify(comments));
  } catch (err) {
    console.warn('Failed to save comments to local backup', err);
  }
}

export async function getAllComments(): Promise<ArticleComment[]> {
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains('comments')) {
      return getLocalBackupComments();
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction('comments', 'readonly');
      const store = tx.objectStore('comments');
      const req = store.getAll();
      req.onsuccess = () => {
        const list: ArticleComment[] = req.result || [];
        if (list.length === 0) {
          resolve(getLocalBackupComments());
        } else {
          // Update backup cache
          saveLocalBackupComments(list);
          resolve(list);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return getLocalBackupComments();
  }
}

export async function getCommentsByArticleId(articleId: string): Promise<ArticleComment[]> {
  try {
    const all = await getAllComments();
    const filtered = all.filter((c) => c.articleId === articleId && c.status !== 'spam');
    // Sort: pinned first, then newest first
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return filtered;
  } catch (e) {
    console.error('Failed to get article comments', e);
    return [];
  }
}

export async function addArticleComment(
  commentData: Omit<ArticleComment, 'id' | 'createdAt' | 'likes'> & {
    id?: string;
    createdAt?: string;
    likes?: number;
  }
): Promise<ArticleComment> {
  const newComment: ArticleComment = {
    id: commentData.id || `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    articleId: commentData.articleId,
    authorName: commentData.authorName.trim(),
    authorRole: commentData.authorRole || 'Masyarakat Umum',
    authorEmail: commentData.authorEmail?.trim() || undefined,
    content: commentData.content.trim(),
    createdAt:
      commentData.createdAt ||
      new Date().toISOString().replace('T', ' ').substring(0, 16),
    likes: commentData.likes || 0,
    isPinned: commentData.isPinned || false,
    parentId: commentData.parentId,
    status: commentData.status || 'approved'
  };

  try {
    const db = await openDB();
    if (db.objectStoreNames.contains('comments')) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('comments', 'readwrite');
        const store = tx.objectStore('comments');
        store.put(newComment);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch (e) {
    console.warn('Could not save to IndexedDB comments, using fallback', e);
  }

  // Also update local storage backup
  const currentBackup = getLocalBackupComments();
  const updated = [newComment, ...currentBackup.filter((c) => c.id !== newComment.id)];
  saveLocalBackupComments(updated);

  return newComment;
}

export async function likeArticleComment(commentId: string): Promise<number> {
  let newLikes = 1;
  try {
    const db = await openDB();
    if (db.objectStoreNames.contains('comments')) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('comments', 'readwrite');
        const store = tx.objectStore('comments');
        const getReq = store.get(commentId);
        getReq.onsuccess = () => {
          const comm = getReq.result as ArticleComment | undefined;
          if (comm) {
            comm.likes = (comm.likes || 0) + 1;
            newLikes = comm.likes;
            store.put(comm);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch (e) {
    console.warn('Could not increment likes in IndexedDB, fallback', e);
  }

  const backup = getLocalBackupComments();
  const item = backup.find((c) => c.id === commentId);
  if (item) {
    item.likes = (item.likes || 0) + 1;
    newLikes = item.likes;
    saveLocalBackupComments(backup);
  }

  return newLikes;
}

export async function deleteArticleComment(commentId: string): Promise<void> {
  try {
    const db = await openDB();
    if (db.objectStoreNames.contains('comments')) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('comments', 'readwrite');
        const store = tx.objectStore('comments');
        store.delete(commentId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch (e) {
    console.warn('Could not delete from IndexedDB', e);
  }

  const backup = getLocalBackupComments().filter((c) => c.id !== commentId && c.parentId !== commentId);
  saveLocalBackupComments(backup);
}

export async function togglePinComment(commentId: string): Promise<boolean> {
  let pinnedState = false;
  try {
    const db = await openDB();
    if (db.objectStoreNames.contains('comments')) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('comments', 'readwrite');
        const store = tx.objectStore('comments');
        const getReq = store.get(commentId);
        getReq.onsuccess = () => {
          const comm = getReq.result as ArticleComment | undefined;
          if (comm) {
            comm.isPinned = !comm.isPinned;
            pinnedState = comm.isPinned;
            store.put(comm);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch (e) {
    console.warn('Could not toggle pin in IndexedDB', e);
  }

  const backup = getLocalBackupComments();
  const item = backup.find((c) => c.id === commentId);
  if (item) {
    item.isPinned = !item.isPinned;
    pinnedState = !!item.isPinned;
    saveLocalBackupComments(backup);
  }

  return pinnedState;
}

export async function getCommentsCountMap(): Promise<Record<string, number>> {
  const map: Record<string, number> = {};
  try {
    const all = await getAllComments();
    all.forEach((c) => {
      if (c.status !== 'spam') {
        map[c.articleId] = (map[c.articleId] || 0) + 1;
      }
    });
  } catch (err) {
    console.warn('Failed to get comments count map', err);
  }
  return map;
}

// ----------------- SETTINGS & IDENTITY OPERATIONS -----------------

export async function getSchoolIdentity(): Promise<SchoolIdentity> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('school-identity');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          // If stored data has old SMA demo name, automatically migrate to default SD Negeri 53 Kota Bengkulu
          if (req.result.data.schoolName === 'SMA Negeri 1 Teladan Nusantara') {
            saveSchoolIdentity(DEFAULT_SCHOOL_IDENTITY).catch(() => {});
            resolve(DEFAULT_SCHOOL_IDENTITY);
            return;
          }
          resolve({
            ...DEFAULT_SCHOOL_IDENTITY,
            ...req.result.data,
            theme: {
              ...DEFAULT_SCHOOL_IDENTITY.theme,
              ...(req.result.data.theme || {})
            }
          });
        } else {
          resolve(DEFAULT_SCHOOL_IDENTITY);
        }
      };
      req.onerror = () => resolve(DEFAULT_SCHOOL_IDENTITY);
    });
  } catch {
    return DEFAULT_SCHOOL_IDENTITY;
  }
}

export async function saveSchoolIdentity(settings: SchoolIdentity): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ id: 'school-identity', data: settings });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ----------------- ADMIN SESSION & CREDENTIALS -----------------

const ADMIN_STORAGE_KEY = 'school_admin_session';
const ADMIN_CREDS_KEY = 'school_admin_credentials';

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'admin123',
  name: 'Kepala Humas & IT',
  updatedAt: '2025-01-01 00:00'
};

export async function getAdminCredentials(): Promise<AdminCredentials> {
  try {
    const db = await openDB();
    const creds = await new Promise<AdminCredentials | null>((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('admin-credentials');
      req.onsuccess = () => resolve(req.result?.data || null);
      req.onerror = () => resolve(null);
    });

    if (creds && creds.username && creds.password) {
      return creds;
    }
  } catch (e) {
    console.warn('Failed to read admin credentials from DB, checking localStorage', e);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(ADMIN_CREDS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed && parsed.username && parsed.password) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse admin credentials from localStorage', e);
  }

  return DEFAULT_ADMIN_CREDENTIALS;
}

export async function saveAdminCredentials(creds: AdminCredentials): Promise<void> {
  // Save to localStorage for synchronous access and redundancy
  try {
    localStorage.setItem(ADMIN_CREDS_KEY, JSON.stringify(creds));
  } catch (e) {
    console.warn('Failed to store admin credentials in localStorage', e);
  }

  // Save to IndexedDB
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ id: 'admin-credentials', data: creds });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function getAdminSession(): AdminUser {
  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to parse admin session', e);
  }
  return {
    isAuthenticated: false,
    username: '',
    name: 'Administrator',
    role: 'admin'
  };
}

export function setAdminSession(user: AdminUser): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Failed to store admin session', e);
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear admin session', e);
  }
}

// ----------------- GRADUATION DATA & CONFIGURATION -----------------

const GRAD_CONFIG_KEY = 'school_graduation_config';
const GRAD_STUDENTS_KEY = 'school_graduation_students';

export const DEFAULT_SKL_TEMPLATE: SklTemplateConfig = {
  kopHeader1: 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA',
  kopHeader2: 'DINAS PENDIDIKAN',
  customSchoolName: '',
  kopAddress: 'Jl. Pemuda Pendidikan No. 45, Menteng, Jakarta Pusat 10310',
  kopContact: 'Telepon: (021) 3928174 • Email: info@sman1teladannusantara.sch.id',
  showLogo: true,
  documentTitle: 'SURAT KETERANGAN LULUS',
  letterNumberPrefix: '421.3/SK-089/SMAN1-TN/V/2026',
  letterCity: 'Jakarta',
  letterDate: '5 Mei 2026',
  openingText: 'Kepala Sekolah Menengah Atas Negeri 1 Teladan Nusantara menerangkan dengan sesungguhnya bahwa:',
  declarationText: 'Berdasarkan kriteria kelulusan satuan pendidikan dan hasil rapat pleno dewan pendidik tentang kelulusan peserta didik, yang bersangkutan dinyatakan:',
  closingText: 'Surat Keterangan Lulus ini bersifat resmi dan berlaku sementara sampai dengan diterbitkannya Ijazah asli Tahun Pelajaran 2025/2026. Surat keterangan ini dapat dipergunakan sebagai dokumen sah pendaftaran perguruan tinggi atau kepentingan kedinasan lainnya.',
  showAverageScore: true,
  showScoresTable: true,
  showExamNumber: true,
  showNis: true,
  showBirthInfo: true,
  showMajor: true,
  showNotes: false,
  showQrCode: true,
  signatureTitle: 'Kepala Sekolah',
  signatoryName: 'Drs. H. Bambang Suryono, M.Pd.',
  signatoryNip: '19680512 199403 1 004',
  signatureType: 'digital_text',
  watermarkText: 'SURAT RESMI SEKOLAH'
};

export const DEFAULT_GRADUATION_CONFIG: GraduationConfig = {
  academicYear: '2025/2026',
  announcementDate: '2026-05-05T10:00',
  isReleased: true,
  skNumber: '421.3/SK-089/SMAN1-TN/V/2026',
  letterDate: '5 Mei 2026',
  headmasterMessage:
    'Selamat dan sukses atas keberhasilan seluruh putra-putri kami angkatan 2025/2026 yang telah menuntaskan seluruh proses pembelajaran dan evaluasi dengan penuh dedikasi. Jadikan kelulusan ini sebagai tonggak awal meraih cita-cita yang lebih tinggi di perguruan tinggi kedinasan, universitas negeri, maupun dunia profesional. Junjung tinggi integritas dan nama baik almamater di mana pun Anda berada.',
  appealNotice:
    'Dihimbau dengan sangat hormat kepada seluruh siswa dan wali murid untuk merayakan kelulusan dengan sujud syukur di kediaman masing-masing. Dilarang keras melakukan aksi konvoi di jalan raya, membunyikan knalpot bising, berkumpul tanpa izin, dan mencoret-coret seragam sekolah. Baju seragam yang masih layak pakai dapat disumbangkan ke posko OSIS Peduli untuk adik-adik kelas yang membutuhkan.',
  sklTemplate: DEFAULT_SKL_TEMPLATE
};

export const DEFAULT_GRADUATION_STUDENTS: GraduationStudent[] = [
  {
    id: 'grad-01',
    nisn: '0068192841',
    examNumber: '01-001-001-8',
    name: 'Ahmad Faiz Al-Hafidz',
    nis: '212210001',
    birthInfo: 'Jakarta, 14 Februari 2007',
    major: 'MIPA (Matematika & IPA)',
    status: 'LULUS',
    averageScore: 92.8,
    scores: [
      { subject: 'Pendidikan Agama & Budi Pekerti', score: 94 },
      { subject: 'Bahasa Indonesia', score: 91 },
      { subject: 'Matematika Peminatan', score: 95 },
      { subject: 'Fisika', score: 93 },
      { subject: 'Kimia', score: 92 },
      { subject: 'Biologi', score: 90 },
      { subject: 'Bahasa Inggris', score: 94 }
    ],
    notes: 'Peringkat 1 Peminatan MIPA - Diterima SNBP STEI ITB',
    sklFile: {
      fileName: 'SKL_Resmi_Ahmad_Faiz_Al-Hafidz.pdf',
      fileType: 'application/pdf',
      fileSize: 148200,
      dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDU1Pj5zdHJlYW0KQlQgL0YxIDE4IFRmIDcwIDc1MCBUIChTVVJBVyBLRVRFUkFOR0FOIExVTFVTIFJFU01JKSBUIiBFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU2IDAwMDAwIG4gCjAwMDAwMDAxMTEgMDAwMDAgbiAKMDAwMDAwMDIxMiAwMDAwMCBuIAp0cmFpbGVyPDwvU2l6ZSA1L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKMzE2CiUlRU9G',
      uploadedAt: '2026-05-05 09:30'
    }
  },
  {
    id: 'grad-02',
    nisn: '0069384752',
    examNumber: '01-001-002-7',
    name: 'Siti Annisa Rahmawati',
    nis: '212210002',
    birthInfo: 'Bogor, 21 Juli 2007',
    major: 'MIPA (Matematika & IPA)',
    status: 'LULUS',
    averageScore: 91.5,
    scores: [
      { subject: 'Pendidikan Agama & Budi Pekerti', score: 92 },
      { subject: 'Bahasa Indonesia', score: 93 },
      { subject: 'Matematika Peminatan', score: 89 },
      { subject: 'Fisika', score: 90 },
      { subject: 'Kimia', score: 93 },
      { subject: 'Biologi', score: 95 },
      { subject: 'Bahasa Inggris', score: 92 }
    ],
    notes: 'Diterima SNBP FK Universitas Indonesia'
  },
  {
    id: 'grad-03',
    nisn: '0058291044',
    examNumber: '01-001-003-6',
    name: 'Budi Santoso Wibowo',
    nis: '212210003',
    birthInfo: 'Semarang, 03 Mei 2006',
    major: 'IPS (Ilmu Pengetahuan Sosial)',
    status: 'LULUS',
    averageScore: 90.4,
    scores: [
      { subject: 'Pendidikan Agama & Budi Pekerti', score: 90 },
      { subject: 'Bahasa Indonesia', score: 92 },
      { subject: 'Matematika', score: 88 },
      { subject: 'Ekonomi Akuntansi', score: 94 },
      { subject: 'Sosiologi', score: 91 },
      { subject: 'Geografi', score: 91 },
      { subject: 'Bahasa Inggris', score: 91 }
    ],
    notes: 'Diterima SNBP Fakultas Hukum Universitas Gadjah Mada'
  },
  {
    id: 'grad-04',
    nisn: '0067482910',
    examNumber: '01-001-004-5',
    name: 'Dinda Kirana Putri',
    nis: '212210004',
    birthInfo: 'Bandung, 18 Oktober 2007',
    major: 'IPS (Ilmu Pengetahuan Sosial)',
    status: 'LULUS',
    averageScore: 89.9,
    scores: [
      { subject: 'Pendidikan Agama & Budi Pekerti', score: 91 },
      { subject: 'Bahasa Indonesia', score: 90 },
      { subject: 'Matematika', score: 87 },
      { subject: 'Ekonomi Akuntansi', score: 92 },
      { subject: 'Sosiologi', score: 93 },
      { subject: 'Geografi', score: 88 },
      { subject: 'Bahasa Inggris', score: 93 }
    ],
    notes: 'Diterima SNBP Manajemen FEB Unpad'
  },
  {
    id: 'grad-05',
    nisn: '0061234505',
    examNumber: '01-001-005-4',
    name: 'Muhammad Farhan Pratama',
    nis: '212210005',
    birthInfo: 'Jakarta, 09 September 2006',
    major: 'MIPA (Matematika & IPA)',
    status: 'LULUS',
    averageScore: 88.6,
    scores: [
      { subject: 'Pendidikan Agama & Budi Pekerti', score: 89 },
      { subject: 'Bahasa Indonesia', score: 88 },
      { subject: 'Matematika Peminatan', score: 87 },
      { subject: 'Fisika', score: 89 },
      { subject: 'Kimia', score: 88 },
      { subject: 'Biologi', score: 89 },
      { subject: 'Bahasa Inggris', score: 90 }
    ],
    notes: 'Diterima Teknik Mesin ITS'
  },
  {
    id: 'grad-06',
    nisn: '0065432106',
    examNumber: '01-001-006-3',
    name: 'Zahra Amelia Cahyani',
    nis: '212210006',
    birthInfo: 'Surabaya, 12 Desember 2006',
    major: 'Bahasa & Budaya',
    status: 'LULUS',
    averageScore: 93.1,
    scores: [
      { subject: 'Pendidikan Agama & Budi Pekerti', score: 93 },
      { subject: 'Bahasa Indonesia', score: 96 },
      { subject: 'Bahasa Inggris Lanjut', score: 95 },
      { subject: 'Bahasa Jepang', score: 92 },
      { subject: 'Sastra Indonesia', score: 94 },
      { subject: 'Antropologi', score: 91 },
      { subject: 'Matematika', score: 88 }
    ],
    notes: 'Peringkat 1 Peminatan Bahasa & Budaya - Juara Debat Nasional'
  },
  {
    id: 'grad-07',
    nisn: '0069988771',
    examNumber: '01-001-007-2',
    name: 'Rian Bagus Saputra',
    nis: '212210007',
    birthInfo: 'Depok, 27 Januari 2007',
    major: 'MIPA (Matematika & IPA)',
    status: 'LULUS',
    averageScore: 87.4,
    scores: [
      { subject: 'Pendidikan Agama & Budi Pekerti', score: 88 },
      { subject: 'Bahasa Indonesia', score: 86 },
      { subject: 'Matematika Peminatan', score: 87 },
      { subject: 'Fisika', score: 88 },
      { subject: 'Kimia', score: 87 },
      { subject: 'Biologi', score: 88 },
      { subject: 'Bahasa Inggris', score: 88 }
    ],
    notes: 'Ketua OSIS Masa Bakti 2024/2025'
  },
  {
    id: 'grad-08',
    nisn: '0067744332',
    examNumber: '01-001-008-1',
    name: 'Nabila Syakira Firdaus',
    nis: '212210008',
    birthInfo: 'Tangerang, 15 Maret 2007',
    major: 'IPS (Ilmu Pengetahuan Sosial)',
    status: 'LULUS',
    averageScore: 91.2,
    scores: [
      { subject: 'Pendidikan Agama & Budi Pekerti', score: 93 },
      { subject: 'Bahasa Indonesia', score: 92 },
      { subject: 'Matematika', score: 89 },
      { subject: 'Ekonomi Akuntansi', score: 94 },
      { subject: 'Sosiologi', score: 90 },
      { subject: 'Geografi', score: 91 },
      { subject: 'Bahasa Inggris', score: 93 }
    ],
    notes: 'Diterima Hubungan Internasional Universitas Airlangga'
  }
];

export async function getGraduationConfig(): Promise<GraduationConfig> {
  try {
    const local = localStorage.getItem(GRAD_CONFIG_KEY);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.warn('Failed to parse graduation config', e);
  }
  return DEFAULT_GRADUATION_CONFIG;
}

export async function saveGraduationConfig(config: GraduationConfig): Promise<void> {
  try {
    localStorage.setItem(GRAD_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save graduation config', e);
  }
}

export async function getGraduationStudents(): Promise<GraduationStudent[]> {
  try {
    const local = localStorage.getItem(GRAD_STUDENTS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse graduation students', e);
  }
  // Store default if empty
  try {
    localStorage.setItem(GRAD_STUDENTS_KEY, JSON.stringify(DEFAULT_GRADUATION_STUDENTS));
  } catch {
    // ignore
  }
  return DEFAULT_GRADUATION_STUDENTS;
}

export async function saveGraduationStudents(students: GraduationStudent[]): Promise<void> {
  try {
    localStorage.setItem(GRAD_STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.warn('Failed to save graduation students', e);
  }
}

export async function findGraduationStudent(searchKey: string): Promise<GraduationStudent | null> {
  const cleanKey = searchKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!cleanKey) return null;

  const students = await getGraduationStudents();
  const match = students.find((s) => {
    const sNisn = s.nisn.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const sExam = s.examNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const sNis = s.nis.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const sName = s.name.trim().toLowerCase();

    return (
      sNisn === cleanKey ||
      sExam === cleanKey ||
      sNis === cleanKey ||
      sName.includes(searchKey.trim().toLowerCase())
    );
  });

  return match || null;
}

export async function addGraduationStudent(student: GraduationStudent): Promise<void> {
  const students = await getGraduationStudents();
  students.unshift(student);
  await saveGraduationStudents(students);
}

export async function updateGraduationStudent(updated: GraduationStudent): Promise<void> {
  const students = await getGraduationStudents();
  const index = students.findIndex((s) => s.id === updated.id);
  if (index !== -1) {
    students[index] = updated;
    await saveGraduationStudents(students);
  }
}

export async function deleteGraduationStudent(id: string): Promise<void> {
  const students = await getGraduationStudents();
  const filtered = students.filter((s) => s.id !== id);
  await saveGraduationStudents(filtered);
}

export async function resetGraduationData(): Promise<{
  config: GraduationConfig;
  students: GraduationStudent[];
}> {
  try {
    localStorage.setItem(GRAD_CONFIG_KEY, JSON.stringify(DEFAULT_GRADUATION_CONFIG));
    localStorage.setItem(GRAD_STUDENTS_KEY, JSON.stringify(DEFAULT_GRADUATION_STUDENTS));
  } catch {
    // ignore
  }
  return {
    config: DEFAULT_GRADUATION_CONFIG,
    students: DEFAULT_GRADUATION_STUDENTS
  };
}

// ----------------- SKL EXPORT & DOWNLOAD HELPERS -----------------

export function generateSklHtmlDocument(
  student: GraduationStudent,
  config: GraduationConfig,
  schoolIdentity: SchoolIdentity
): string {
  const tpl = config.sklTemplate || DEFAULT_SKL_TEMPLATE;
  const schoolName = tpl.customSchoolName || schoolIdentity.schoolName;
  const logoUrl = schoolIdentity.logo?.url || '';
  const sklNumber = student.customSklNumber || tpl.letterNumberPrefix || config.skNumber;
  const city = tpl.letterCity || 'Jakarta';
  const dateStr = tpl.letterDate || config.letterDate || '5 Mei 2026';
  const signatoryTitle = tpl.signatureTitle || 'Kepala Sekolah';
  const signatoryName = tpl.signatoryName || schoolIdentity.principalName;
  const signatoryNip = tpl.signatoryNip || schoolIdentity.principalNip;

  const scoresRows = student.scores && student.scores.length > 0 && tpl.showScoresTable
    ? student.scores.map(
        (sc, i) => `<tr>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; font-size: 11px;">${i + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px;">${sc.subject}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: center; font-weight: bold; font-family: monospace; font-size: 12px;">${sc.score}</td>
        </tr>`
      ).join('')
    : '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${tpl.documentTitle} - ${student.name}</title>
  <style>
    @page { size: A4; margin: 18mm 15mm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #0f172a;
      line-height: 1.5;
      background-color: #ffffff;
      margin: 0;
      padding: 24px;
    }
    .skl-container {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
    }
    .kop-wrapper {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px double #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
      text-align: center;
    }
    .kop-logo {
      width: 76px;
      height: 76px;
      object-fit: contain;
    }
    .kop-text {
      flex: 1;
    }
    .kop-h1 {
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .kop-h2 {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      margin: 2px 0;
    }
    .kop-school {
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
      margin: 3px 0;
      font-family: Arial, sans-serif;
    }
    .kop-address {
      font-size: 10px;
      margin: 0;
      color: #334155;
      font-family: Arial, sans-serif;
    }
    .doc-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .doc-title {
      font-size: 16px;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0;
    }
    .doc-number {
      font-size: 12px;
      font-family: monospace;
      margin-top: 4px;
    }
    .content-section {
      font-size: 13px;
      margin-bottom: 16px;
      text-align: justify;
      line-height: 1.6;
    }
    .data-table {
      width: 100%;
      margin: 14px 0;
      border-collapse: collapse;
      font-size: 13px;
    }
    .data-table td {
      padding: 4px 8px;
      vertical-align: top;
    }
    .data-table td.label {
      width: 220px;
      color: #1e293b;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 24px;
      background-color: #059669;
      color: white;
      font-weight: bold;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 2px;
      border-radius: 6px;
      margin: 10px 0;
    }
    .scores-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
    }
    .scores-table th {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: bold;
    }
    .footer-signature {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .qr-box {
      text-align: center;
      border: 1px dashed #94a3b8;
      padding: 8px;
      border-radius: 8px;
      display: inline-block;
      font-family: Arial, sans-serif;
      font-size: 9px;
      color: #475569;
    }
    .signature-box {
      text-align: right;
      min-width: 220px;
    }
    .sig-space {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    .sig-img {
      max-height: 55px;
      max-width: 140px;
      object-fit: contain;
    }
    .stamp-img {
      max-height: 60px;
      max-width: 100px;
      object-fit: contain;
      opacity: 0.85;
      margin-right: -25px;
    }
    .watermark {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 48px;
      font-weight: bold;
      color: rgba(15, 23, 42, 0.05);
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
      text-transform: uppercase;
      letter-spacing: 6px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="skl-container">
    ${tpl.watermarkText ? `<div class="watermark">${tpl.watermarkText}</div>` : ''}

    <div class="kop-wrapper">
      ${tpl.showLogo && logoUrl ? `<img src="${logoUrl}" alt="Logo" class="kop-logo" />` : ''}
      <div class="kop-text">
        ${tpl.kopHeader1 ? `<h2 class="kop-h1">${tpl.kopHeader1}</h2>` : ''}
        ${tpl.kopHeader2 ? `<h3 class="kop-h2">${tpl.kopHeader2}</h3>` : ''}
        <h1 class="kop-school">${schoolName}</h1>
        <p class="kop-address">${tpl.kopAddress || schoolIdentity.address || ''}</p>
        <p class="kop-address">${tpl.kopContact || `Telp: ${schoolIdentity.phone || '-'} • Web: ${schoolIdentity.website || '-'}`}</p>
      </div>
    </div>

    <div class="doc-header">
      <h2 class="doc-title">${tpl.documentTitle}</h2>
      <div class="doc-number">Nomor: ${sklNumber}</div>
    </div>

    <div class="content-section">
      <p>${tpl.openingText}</p>

      <table class="data-table">
        <tr>
          <td class="label">Nama Lengkap Siswa</td>
          <td>: <strong>${student.name}</strong></td>
        </tr>
        <tr>
          <td class="label">Nomor Induk Siswa Nasional (NISN)</td>
          <td>: <span style="font-family: monospace; font-weight: bold;">${student.nisn}</span></td>
        </tr>
        ${tpl.showNis && student.nis ? `<tr>
          <td class="label">Nomor Induk Siswa (NIS)</td>
          <td>: <span style="font-family: monospace;">${student.nis}</span></td>
        </tr>` : ''}
        ${tpl.showExamNumber && student.examNumber ? `<tr>
          <td class="label">Nomor Peserta Ujian</td>
          <td>: <span style="font-family: monospace;">${student.examNumber}</span></td>
        </tr>` : ''}
        ${tpl.showBirthInfo && student.birthInfo ? `<tr>
          <td class="label">Tempat, Tanggal Lahir</td>
          <td>: ${student.birthInfo}</td>
        </tr>` : ''}
        ${tpl.showMajor && student.major ? `<tr>
          <td class="label">Peminatan / Program Studi</td>
          <td>: ${student.major}</td>
        </tr>` : ''}
        ${tpl.showNotes && student.notes ? `<tr>
          <td class="label">Catatan / Prestasi</td>
          <td>: ${student.notes}</td>
        </tr>` : ''}
      </table>

      <p>${tpl.declarationText}</p>

      <div style="text-align: center; margin: 12px 0;">
        <span class="status-badge" style="background-color: ${student.status === 'LULUS' ? '#059669' : '#e11d48'};">
          ${student.status}
        </span>
        ${tpl.showAverageScore ? `<div style="font-size: 13px; margin-top: 4px; font-weight: bold;">Nilai Rata-rata Ujian Sekolah: ${student.averageScore.toFixed(1)} / 100</div>` : ''}
      </div>

      ${scoresRows ? `
        <table class="scores-table">
          <thead>
            <tr>
              <th style="width: 40px;">No</th>
              <th>Mata Pelajaran</th>
              <th style="width: 80px;">Nilai Akhir</th>
            </tr>
          </thead>
          <tbody>
            ${scoresRows}
          </tbody>
        </table>
      ` : ''}

      <p style="font-size: 12px; color: #334155; margin-top: 14px;">
        ${tpl.closingText}
      </p>
    </div>

    <div class="footer-signature">
      <div>
        ${tpl.showQrCode ? `
          <div class="qr-box">
            <div style="font-weight: bold; margin-bottom: 4px; color: #0284c7;">VERIFIKASI RESMI</div>
            <div style="font-family: monospace; font-size: 10px; background: #f8fafc; padding: 4px 6px; border: 1px solid #e2e8f0; border-radius: 4px;">
              SKL-${student.nisn}-${config.academicYear.replace(/[^a-zA-Z0-9]/g, '')}
            </div>
            <div style="font-size: 8px; color: #64748b; margin-top: 4px;">Divalidasi Sistem Digital Sekolah</div>
          </div>
        ` : ''}
      </div>

      <div class="signature-box">
        <div>${city}, ${dateStr}</div>
        <div style="font-weight: bold; margin-top: 2px;">${signatoryTitle}</div>
        
        <div class="sig-space">
          ${tpl.stampImageUrl ? `<img src="${tpl.stampImageUrl}" alt="Cap Stempel" class="stamp-img" />` : ''}
          ${tpl.signatureImageUrl ? (
            `<img src="${tpl.signatureImageUrl}" alt="Tanda Tangan" class="sig-img" />`
          ) : (
            `<span style="font-size: 11px; color: #64748b; font-style: italic; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px;">
              [Ditandatangani Secara Elektronik]
            </span>`
          )}
        </div>

        <div style="font-weight: bold; text-decoration: underline;">${signatoryName}</div>
        ${signatoryNip ? `<div style="font-size: 11px; font-family: monospace; color: #475569;">NIP. ${signatoryNip}</div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadStudentSkl(
  student: GraduationStudent,
  config: GraduationConfig,
  schoolIdentity: SchoolIdentity
): void {
  // If student has an uploaded SKL file, download it directly
  if (student.sklFile && student.sklFile.dataUrl) {
    const a = document.createElement('a');
    a.href = student.sklFile.dataUrl;
    a.download = student.sklFile.fileName || `SKL_${student.name.replace(/\s+/g, '_')}_${student.nisn}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Otherwise, generate the formatted HTML document and download it
  const htmlContent = generateSklHtmlDocument(student, config, schoolIdentity);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SKL_Resmi_${student.name.replace(/\s+/g, '_')}_${student.nisn}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----------------- BACKUP & RESTORE OPERATIONS -----------------

export interface WebsiteBackupPayload {
  version: number;
  exportDate: string;
  source: string;
  schoolIdentity: SchoolIdentity;
  articles: NewsArticle[];
  media: MediaItem[];
  graduationConfig?: GraduationConfig;
  graduationStudents?: GraduationStudent[];
  comments?: ArticleComment[];
}

export async function exportFullDatabaseBackup(): Promise<WebsiteBackupPayload> {
  const [identity, arts, meds, comments, gradConfig, gradStudents] = await Promise.all([
    getSchoolIdentity(),
    getAllArticles(),
    getAllMedia(),
    getAllComments().catch(() => []),
    getGraduationConfig().catch(() => DEFAULT_GRADUATION_CONFIG),
    getGraduationStudents().catch(() => [])
  ]);

  return {
    version: 2,
    exportDate: new Date().toISOString(),
    source: 'SD Negeri 53 Kota Bengkulu Portal',
    schoolIdentity: identity,
    articles: arts,
    media: meds,
    graduationConfig: gradConfig,
    graduationStudents: gradStudents,
    comments: comments
  };
}

export async function downloadBackupFile(): Promise<void> {
  const data = await exportFullDatabaseBackup();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `backup_portal_sdn53_bengkulu_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFullDatabaseBackup(backupJson: string): Promise<{ success: boolean; message: string }> {
  try {
    const payload = JSON.parse(backupJson) as Partial<WebsiteBackupPayload>;
    if (!payload.schoolIdentity && !payload.articles) {
      return {
        success: false,
        message: 'Format file cadangan tidak valid (data identitas atau artikel tidak ditemukan).'
      };
    }

    const db = await openDB();

    // 1. Save school identity
    if (payload.schoolIdentity) {
      await saveSchoolIdentity(payload.schoolIdentity);
    }

    // 2. Save articles
    if (Array.isArray(payload.articles)) {
      const artTx = db.transaction('articles', 'readwrite');
      const artStore = artTx.objectStore('articles');
      payload.articles.forEach((art) => {
        artStore.put(art);
      });
      await new Promise<void>((resolve, reject) => {
        artTx.oncomplete = () => resolve();
        artTx.onerror = () => reject(artTx.error);
      });
    }

    // 3. Save media
    if (Array.isArray(payload.media)) {
      const medTx = db.transaction('media', 'readwrite');
      const medStore = medTx.objectStore('media');
      payload.media.forEach((item) => {
        medStore.put(item);
      });
      await new Promise<void>((resolve, reject) => {
        medTx.oncomplete = () => resolve();
        medTx.onerror = () => reject(medTx.error);
      });
    }

    // 4. Save graduation config & students
    if (payload.graduationConfig) {
      await saveGraduationConfig(payload.graduationConfig);
    }
    if (Array.isArray(payload.graduationStudents)) {
      await saveGraduationStudents(payload.graduationStudents);
    }

    // 5. Save comments if any
    if (Array.isArray(payload.comments) && db.objectStoreNames.contains('comments')) {
      const commTx = db.transaction('comments', 'readwrite');
      const commStore = commTx.objectStore('comments');
      payload.comments.forEach((c) => commStore.put(c));
      await new Promise<void>((resolve, reject) => {
        commTx.oncomplete = () => resolve();
        commTx.onerror = () => reject(commTx.error);
      });
    }

    return {
      success: true,
      message: 'Seluruh data website berhasil dipulihkan!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal memproses file cadangan: ${err?.message || 'Error tidak diketahui'}`
    };
  }
}


