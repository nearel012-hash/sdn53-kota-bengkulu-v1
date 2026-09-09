import {
  School,
  MapPin,
  Phone,
  Mail,
  Award,
  Instagram,
  Youtube,
  Facebook,
  ShieldCheck,
  Download,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { SchoolIdentity } from '../types';

interface FooterProps {
  schoolIdentity: SchoolIdentity;
  onNavigate: (page: 'home' | 'news' | 'downloads' | 'profile' | 'graduation') => void;
  onOpenAdminLogin: () => void;
}

export default function Footer({ schoolIdentity, onNavigate, onOpenAdminLogin }: FooterProps) {
  const { socialMedia } = schoolIdentity;

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 overflow-hidden shadow-xs">
                <img
                  src={schoolIdentity.logo.url}
                  alt={schoolIdentity.schoolName}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-extrabold text-white text-base leading-tight">
                {schoolIdentity.schoolName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {schoolIdentity.tagline}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{schoolIdentity.accreditation}</span>
            </div>
          </div>

          {/* Col 2: Kontak & Alamat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Kontak & Lokasi
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{schoolIdentity.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{schoolIdentity.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{schoolIdentity.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
                <span>NPSN: {schoolIdentity.npsn}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Akses Cepat Publik */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Warta & Pengumuman Sekolah
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('graduation')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pengumuman Kelulusan Siswa</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('downloads')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pusat Unduhan & Dokumen SPMB</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profile')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Visi, Misi & Sambutan Kepala Sekolah
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Media Sosial & Pengelola */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Media Sosial Resmi
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {socialMedia.instagram && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-pink-400">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{socialMedia.instagram}</span>
                </div>
              )}
              {socialMedia.youtube && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-red-400">
                  <Youtube className="w-3.5 h-3.5" />
                  <span>{socialMedia.youtube}</span>
                </div>
              )}
              {socialMedia.facebook && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400">
                  <Facebook className="w-3.5 h-3.5" />
                  <span>{socialMedia.facebook}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdminLogin}
                className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
              >
                🔐 Akses Pengelola Publikasi (Admin Login)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {schoolIdentity.schoolName}. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-2">
            <span>Kepala Sekolah: {schoolIdentity.principalName}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
