import {
  Building2,
  Award,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { SchoolIdentity } from '../types';

interface PublicProfileProps {
  schoolIdentity: SchoolIdentity;
}

export default function PublicProfile({ schoolIdentity }: PublicProfileProps) {
  return (
    <div id="public-profile-view" className="py-12 animate-fade-in space-y-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: schoolIdentity.theme.accentColor }}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Profil Resmi Lembaga</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {schoolIdentity.schoolName}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {schoolIdentity.tagline}
          </p>
        </div>

        {/* Accreditation & Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Akreditasi Sekolah
            </span>
            <h3 className="text-xl font-black text-blue-700">{schoolIdentity.accreditation}</h3>
            <p className="text-[11px] text-slate-500">Badan Akreditasi Nasional Sekolah/Madrasah</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Nomor Pokok (NPSN)
            </span>
            <h3 className="text-xl font-black text-slate-900 font-mono">{schoolIdentity.npsn}</h3>
            <p className="text-[11px] text-slate-500">Data Pokok Pendidikan Kemendikbudristek</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status Kurikulum
            </span>
            <h3 className="text-xl font-black text-emerald-700">Kurikulum Merdeka</h3>
            <p className="text-[11px] text-slate-500">Berbasis Karakter Profil Pelajar Pancasila</p>
          </div>
        </div>

        {/* Sambutan Kepala Sekolah */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-36 h-44 sm:w-44 sm:h-52 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 p-1 shadow-lg overflow-hidden flex items-center justify-center">
              {schoolIdentity.principalPhotoUrl ? (
                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={schoolIdentity.principalPhotoUrl}
                    alt={schoolIdentity.principalName}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-xl bg-slate-900 flex flex-col items-center justify-center p-3 text-center text-white">
                  <UserCheck className="w-14 h-14 text-blue-400 mb-2" />
                  <span className="text-[11px] font-bold text-slate-200">Foto Pimpinan</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">SMA Negeri 1 Teladan</span>
                </div>
              )}
            </div>
            <div className="mt-2.5 text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[10px] font-bold">
                Kepala Sekolah
              </span>
            </div>
          </div>

          <div className="space-y-3 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sambutan Pimpinan Sekolah</span>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {schoolIdentity.principalName}
              </h3>
              {schoolIdentity.principalNip && (
                <p className="text-xs font-mono text-slate-500 font-medium">
                  NIP: {schoolIdentity.principalNip}
                </p>
              )}
            </div>

            <div className="relative pt-1">
              <div className="text-3xl text-blue-300 font-serif leading-none select-none absolute -top-1 -left-2 opacity-50 hidden sm:block">
                “
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic sm:pl-4 border-l-2 border-blue-200">
                "{schoolIdentity.principalGreeting ||
                  'Pendidikan bukan sekadar proses transfer ilmu pengetahuan, melainkan ruang pembentukan karakter luhur, daya nalar kritis, dan kepedulian sosial. Melalui portal publikasi digital ini, kami membuka pintu kolaborasi yang seluas-luasnya bagi seluruh orang tua, peserta didik, dan masyarakat untuk bersama-sama melahirkan generasi masa depan yang berdaya saing global.'}"
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Penanggung Jawab Pendidikan
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Terakreditasi {schoolIdentity.accreditation}
              </span>
            </div>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visi */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Visi Sekolah</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium">
              "{schoolIdentity.vision}"
            </p>
          </div>

          {/* Misi */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Misi Sekolah</h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              {schoolIdentity.missions.map((mission, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{mission}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alamat & Kontak */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            <span>Alamat & Layanan Terpadu</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Lokasi Kampus
              </span>
              <p className="text-slate-700 font-medium">{schoolIdentity.address}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Telepon & WhatsApp
              </span>
              <p className="text-slate-700 font-medium">{schoolIdentity.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">
                Email Resmi Sekolah
              </span>
              <p className="text-slate-700 font-medium">{schoolIdentity.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
