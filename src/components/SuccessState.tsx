import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface SuccessStateProps {
  employeeName: string;
  onReset?: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({ employeeName }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
      <div className="mx-auto w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Terima Kasih, {employeeName}!
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Jawaban dan masukan Anda pada Employee Engagement Survey telah berhasil terkirim dan tersimpan dengan aman dalam database.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-left text-xs text-slate-600 space-y-2 max-w-lg mx-auto">
        <div className="flex items-center gap-2 text-slate-900 font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <span>Kerahasiaan Terjamin</span>
        </div>
        <p>
          Umpan balik yang Anda berikan akan digunakan secara agregat oleh Tim Human Capital Division dan Manajemen Perusahaan untuk menyusun langkah perbaikan dan pengembangan lingkungan kerja secara menyeluruh.
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Halla Mohana &bull; Human Capital Division.
      </div>
    </div>
  );
};
