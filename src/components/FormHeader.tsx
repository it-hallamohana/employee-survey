import React from 'react';
import { FileText } from 'lucide-react';

export const FormHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Branding Badge & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src="/logo-halla-mohana.png"
              alt="Halla Mohana Logo"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-semibold tracking-wider text-slate-700 uppercase mb-2">
                <span>Halla Mohana &bull; Human Capital Division</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Employee Engagement Survey
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Survei Keterlibatan dan Evaluasi Lingkungan Kerja Karyawan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-md self-start sm:self-auto">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Estimasi Pengisian: &plusmn; 10 Menit</span>
          </div>
        </div>

        {/* Confidentiality Notice */}
        <div className="bg-slate-50 border-l-4 border-slate-800 p-4 rounded-r-md">
          <p className="text-sm text-slate-700 leading-relaxed">
            Kami mengharapkan partisipasi aktif Anda sebagai bagian dari keluarga besar perusahaan. 
            Partisipasi Anda sangat berharga untuk mendukung perbaikan berkesinambungan dan peningkatan kualitas lingkungan kerja.
            Seluruh jawaban diberikan secara jujur dan dijamin kerahasiaannya oleh manajemen.
          </p>
        </div>

        {/* Instruction Banner */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 text-sm text-slate-600 space-y-2">
          <h2 className="font-semibold text-slate-900 text-xs tracking-wider uppercase">
            Petunjuk Penilaian Skala (1 - 10)
          </h2>
          <p className="text-slate-600">
            Berikan nilai antara <strong className="text-slate-900">1 (Sangat Tidak Setuju)</strong> hingga <strong className="text-slate-900">10 (Sangat Setuju)</strong> untuk setiap pernyataan yang diberikan.
          </p>
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>1 = Sangat Tidak Setuju</span>
            <span>5 - 6 = Netral</span>
            <span>10 = Sangat Setuju</span>
          </div>
        </div>
      </div>
    </header>
  );
};
