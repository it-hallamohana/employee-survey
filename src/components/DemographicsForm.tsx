import React from 'react';
import { EmployeeDemographics } from '../lib/types';
import {
  DIREKTORAT_OPTIONS,
  DIVISI_OPTIONS,
  DEPARTMENT_OPTIONS,
  MASA_KERJA_OPTIONS,
  LOKASI_KERJA_OPTIONS,
} from '../lib/questions';
import { User, CreditCard, Building2, Layers, Grid, Calendar, MapPin, ArrowRight } from 'lucide-react';

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
    if (!data.employee_name.trim()) {
      setError('Nama Karyawan wajib diisi.');
      return;
    }
    if (!data.direktorat || !data.divisi || !data.department) {
      setError('Direktorat, Divisi, dan Department wajib dipilih.');
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Identitas & Profil Responden</h2>
        <p className="text-sm text-slate-500 mt-1">
          Lengkapi informasi data diri Anda di bawah ini sebelum memulai pengisian survei.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nama Karyawan */}
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="employee_name" className="block text-sm font-semibold text-slate-800">
              Nama Karyawan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="employee_name"
                value={data.employee_name}
                onChange={(e) => onChange('employee_name', e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                required
              />
            </div>
          </div>

          {/* NIK / ID Karyawan */}
          <div className="space-y-1.5">
            <label htmlFor="employee_nik" className="block text-sm font-semibold text-slate-800">
              NIK / Nomor Induk Karyawan
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="employee_nik"
                value={data.employee_nik}
                onChange={(e) => onChange('employee_nik', e.target.value)}
                placeholder="Opsional / NIK Karyawan"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>
          </div>

          {/* Direktorat */}
          <div className="space-y-1.5">
            <label htmlFor="direktorat" className="block text-sm font-semibold text-slate-800">
              Direktorat <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                id="direktorat"
                value={data.direktorat}
                onChange={(e) => onChange('direktorat', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                required
              >
                <option value="">-- Pilih Direktorat --</option>
                {DIREKTORAT_OPTIONS.map((item) => (
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

          {/* Masa Kerja */}
          <div className="space-y-1.5">
            <label htmlFor="masa_kerja" className="block text-sm font-semibold text-slate-800">
              Masa Kerja
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

          {/* Lokasi Kerja */}
          <div className="space-y-1.5">
            <label htmlFor="lokasi_kerja" className="block text-sm font-semibold text-slate-800">
              Lokasi Kerja
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
