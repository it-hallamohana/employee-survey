'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Award,
  Download,
  Search,
  LogOut,
  ShieldCheck,
  Building,
  RefreshCw,
  X,
  Eye,
  BarChart3,
  User,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SurveyResponseRecord } from '@/lib/types';
import { SURVEY_CATEGORIES } from '@/lib/questions';

export default function ManagementConsoleDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [responses, setResponses] = useState<SurveyResponseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDirektorat, setFilterDirektorat] = useState<string>('ALL');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponseRecord | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    setLoading(true);

    if (isSupabaseConfigured()) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/management-console/login');
        return;
      }
    } else {
      const localAuth = sessionStorage.getItem('console_admin_session');
      if (!localAuth) {
        router.push('/management-console/login');
        return;
      }
    }

    await fetchResponses();
    setLoading(false);
  };

  const fetchResponses = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('eos_responses')
          .select('*, answers:eos_answers(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResponses(data || []);
      } else {
        // Fallback reading from local storage
        const localDataStr = localStorage.getItem('survey_responses_fallback') || '[]';
        setResponses(JSON.parse(localDataStr));
      }
    } catch (err) {
      console.error('Failed to fetch survey responses:', err);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    } else {
      sessionStorage.removeItem('console_admin_session');
    }
    router.push('/management-console/login');
  };

  // Metrics Calculations
  const totalResponses = responses.length;
  const averageOverallScore =
    totalResponses > 0
      ? (
          responses.reduce((sum, r) => sum + (Number(r.overall_rating_avg) || 0), 0) /
          totalResponses
        ).toFixed(2)
      : '0.00';

  // Calculate Average Score per Category across all responses
  const categoryAverages = SURVEY_CATEGORIES.map((cat) => {
    let totalScore = 0;
    let count = 0;

    responses.forEach((resp) => {
      if (resp.answers && Array.isArray(resp.answers)) {
        resp.answers.forEach((ans) => {
          // Check if answer question_id belongs to this category
          const isQuestionInCat = cat.questions.some((q) => q.id === ans.question_id);
          if (isQuestionInCat && typeof ans.score === 'number') {
            totalScore += ans.score;
            count += 1;
          }
        });
      }
    });

    const avg = count > 0 ? (totalScore / count).toFixed(2) : '0.00';
    return {
      id: cat.id,
      title: cat.title,
      avg: Number(avg),
      count,
    };
  });

  const filteredResponses = responses.filter((r) => {
    const matchesSearch =
      r.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.employee_nik && r.employee_nik.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.divisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDirektorat =
      filterDirektorat === 'ALL' || r.direktorat === filterDirektorat;

    return matchesSearch && matchesDirektorat;
  });

  const exportToCSV = () => {
    if (responses.length === 0) return;

    const headers = [
      'ID',
      'Tanggal Submit',
      'Nama Karyawan',
      'NIK',
      'Direktorat',
      'Divisi',
      'Department',
      'Masa Kerja',
      'Lokasi Kerja',
      'Skor Rata-Rata',
      'Saran & Perubahan (Open Feedback)',
    ];

    const rows = responses.map((r) => [
      `"${r.id}"`,
      `"${new Date(r.created_at).toLocaleString('id-ID')}"`,
      `"${r.employee_name.replace(/"/g, '""')}"`,
      `"${(r.employee_nik || '-').replace(/"/g, '""')}"`,
      `"${r.direktorat.replace(/"/g, '""')}"`,
      `"${r.divisi.replace(/"/g, '""')}"`,
      `"${r.department.replace(/"/g, '""')}"`,
      `"${(r.masa_kerja || '-').replace(/"/g, '""')}"`,
      `"${(r.lokasi_kerja || '-').replace(/"/g, '""')}"`,
      `"${r.overall_rating_avg}"`,
      `"${(r.open_feedback || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Survey_Responses_Halla_Mohana_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Memuat data konsol...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Console Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-halla-mohana.png"
              alt="Halla Mohana Logo"
              className="w-10 h-10 object-contain bg-white rounded-full p-0.5"
            />
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                Konsol Analitik Dashboard Internal
              </h1>
              <p className="text-xs text-slate-400">
                Halla Mohana &bull; Human Capital Division
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={responses.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded border border-slate-700 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-semibold rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8 flex-1">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Responden</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{totalResponses}</div>
            <p className="text-xs text-slate-500">Karyawan berpartisipasi</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Rata-Rata Skor Keseluruhan</span>
              <Award className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {averageOverallScore} <span className="text-sm font-normal text-slate-400">/ 10.0</span>
            </div>
            <p className="text-xs text-slate-500">Indeks keterlibatan gabungan</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Dimensi Evaluasi</span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{SURVEY_CATEGORIES.length}</div>
            <p className="text-xs text-slate-500">Kategori survei aktif</p>
          </div>
        </div>

        {/* Category-Wise Average Score Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                <span>Rata-Rata Nilai per Kategori (Bagian A - H)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan indeks nilai rata-rata dari seluruh responden berdasarkan seksi kuesioner.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryAverages.map((cat, index) => {
              const scorePercent = (cat.avg / 10) * 100;
              return (
                <div
                  key={cat.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2" title={cat.title}>
                      {cat.title}
                    </span>
                    <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                      {cat.avg > 0 ? cat.avg.toFixed(2) : '-'} <span className="text-slate-400 font-normal">/ 10</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        cat.avg >= 8
                          ? 'bg-emerald-600'
                          : cat.avg >= 6
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Response Data Table & Filter */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daftar Respons Survei Karyawan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik pada baris atau tombol <span className="font-semibold text-slate-800">Detail</span> untuk melihat rincian nilai 90+ pertanyaan karyawan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari Nama / NIK / Divisi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-slate-900"
                />
              </div>

              {/* Filter Direktorat */}
              <select
                value={filterDirektorat}
                onChange={(e) => setFilterDirektorat(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-slate-900"
              >
                <option value="ALL">Semua Direktorat</option>
                <option value="FAD">FAD</option>
                <option value="CBD">CBD</option>
                <option value="HC">HC</option>
                <option value="OPS">OPS</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Karyawan</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">Direktorat & Divisi</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Skor Rata-Rata</th>
                  <th className="py-3 px-4">Tanggal Submit</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Belum ada data respons survei yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredResponses.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedResponse(item)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {item.employee_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {item.employee_nik || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 text-xs">
                        <span className="font-semibold text-slate-900">{item.direktorat}</span>
                        <span className="text-slate-400 mx-1.5">&bull;</span>
                        <span>{item.divisi}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {item.department}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                          {item.overall_rating_avg}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResponse(item);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-300 text-slate-800 text-xs font-medium rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* DETAIL MODAL / DRAWER PER USER */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Rincian Jawaban Karyawan
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {selectedResponse.employee_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
              {/* Employee Demographics Information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <User className="w-3.5 h-3.5" /> NIK:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedResponse.employee_nik || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <Building className="w-3.5 h-3.5" /> Direktorat / Divisi:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedResponse.direktorat} - {selectedResponse.divisi}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5" /> Masa Kerja:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedResponse.masa_kerja || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Lokasi Kerja:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedResponse.lokasi_kerja || '-'}
                  </span>
                </div>
              </div>

              {/* Rincian Skor per Kategori */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Daftar Nilai Kuesioner (Skala 1 - 10)
                </h3>

                {SURVEY_CATEGORIES.map((cat) => {
                  return (
                    <div key={cat.id} className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 bg-slate-100 p-2 rounded border-l-4 border-slate-900">
                        {cat.title}
                      </h4>

                      <div className="space-y-2">
                        {cat.questions.map((q) => {
                          // Find score in answers array
                          const ansObj = selectedResponse.answers?.find(
                            (a) => a.question_id === q.id
                          );
                          const score = ansObj ? ansObj.score : undefined;

                          if (q.type === 'text') return null;

                          return (
                            <div
                              key={q.id}
                              className="flex items-center justify-between text-xs py-1.5 px-3 bg-white border border-slate-100 rounded hover:bg-slate-50"
                            >
                              <span className="text-slate-700 pr-4">
                                <strong className="text-slate-900 mr-1.5">{q.id}.</strong>
                                {q.title}
                              </span>
                              <span
                                className={`font-bold px-2.5 py-1 rounded border shrink-0 ${
                                  score !== undefined && score >= 8
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : score !== undefined && score >= 6
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {score !== undefined ? score : '-'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Open Feedback Text */}
              {selectedResponse.open_feedback && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Saran & Perubahan yang Diinginkan
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedResponse.open_feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => setSelectedResponse(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
