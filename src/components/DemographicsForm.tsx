import React from 'react';
import { EmployeeDemographics } from '../lib/types';
import {
  DIVISI_OPTIONS,
  DEPARTMENT_OPTIONS,
  MASA_KERJA_OPTIONS,
  LOKASI_KERJA_OPTIONS,
  LEVEL_JABATAN_OPTIONS,
} from '../lib/questions';
import { Layers, Grid, Calendar, MapPin, Briefcase, ShieldCheck, ArrowRight } from 'lucide-react';

interface DemographicsFormProps {
  data: EmployeeDemographics;
  onChange: (field: keyof EmployeeDemographics, value: string) => void;
  onNext: () => void;
}

export const DemographicsForm: React.FC<DemographicsFormProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.divisi || !data.department || !data.level_jabatan || !data.masa_kerja || !data.lokasi_kerja) {
      setError('Mohon lengkapi seluruh profil demografi (Divisi, Department, Level Jabatan, Masa Kerja, dan Lokasi Kerja) sebelum melanjutkan.');
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Profil Demografi Responden</h2>
          <p className="text-sm text-slate-500 mt-1">
            Survei ini bersifat rahasia (semi-anonim). Nama dan NIK tidak diperlukan untuk menjaga objektivitas penilaian.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-semibold text-emerald-800 self-start sm:self-auto shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Identitas Rahasia</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Lokasi Kerja */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="lokasi_kerja" className="block text-sm font-semibold text-slate-800">
              Lokasi Kerja / Unit Bisnis <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                id="lokasi_kerja"
                value={data.lokasi_kerja}
                onChange={(e) => onChange('lokasi_kerja', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                required
              >
                <option value="">-- Pilih Lokasi Kerja --</option>
                {LOKASI_KERJA_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Divisi */}
          <div className="space-y-1.5">
            <label htmlFor="divisi" className="block text-sm font-semibold text-slate-800">
              Divisi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Layers className="w-4 h-4" />
              </div>
              <select
                id="divisi"
                value={data.divisi}
                onChange={(e) => onChange('divisi', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                required
              >
                <option value="">-- Pilih Divisi --</option>
                {DIVISI_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label htmlFor="department" className="block text-sm font-semibold text-slate-800">
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Grid className="w-4 h-4" />
              </div>
              <select
                id="department"
                value={data.department}
                onChange={(e) => onChange('department', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                required
              >
                <option value="">-- Pilih Department --</option>
                {DEPARTMENT_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Level Jabatan */}
          <div className="space-y-1.5">
            <label htmlFor="level_jabatan" className="block text-sm font-semibold text-slate-800">
              Level Jabatan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                id="level_jabatan"
                value={data.level_jabatan}
                onChange={(e) => onChange('level_jabatan', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                required
              >
                <option value="">-- Pilih Level Jabatan --</option>
                {LEVEL_JABATAN_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Masa Kerja */}
          <div className="space-y-1.5">
            <label htmlFor="masa_kerja" className="block text-sm font-semibold text-slate-800">
              Masa Kerja <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <select
                id="masa_kerja"
                value={data.masa_kerja}
                onChange={(e) => onChange('masa_kerja', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                required
              >
                <option value="">-- Pilih Masa Kerja --</option>
                {MASA_KERJA_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            <span>Mulai Pengisian Survei</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
