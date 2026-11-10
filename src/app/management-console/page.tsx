'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Award,
  Download,
  Search,
  LogOut,
  Building,
  RefreshCw,
  X,
  Eye,
  BarChart3,
  MapPin,
  Clock,
  Briefcase,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Filter,
  Layers,
  Target,
  Activity,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SurveyResponseRecord } from '@/lib/types';
import {
  SURVEY_CATEGORIES,
  DIVISI_OPTIONS,
  LOKASI_KERJA_OPTIONS,
  LEVEL_JABATAN_OPTIONS,
  MASA_KERJA_OPTIONS,
} from '@/lib/questions';

type ActiveTab = 'overview' | 'segmentation' | 'items' | 'responses';

export default function ManagementConsoleDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [responses, setResponses] = useState<SurveyResponseRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Global HC Filters
  const [filterLokasi, setFilterLokasi] = useState<string>('ALL');
  const [filterDivisi, setFilterDivisi] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterMasaKerja, setFilterMasaKerja] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Detail Modal
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

  // Helper to resolve Level Jabatan from record (stored in employee_nik or direktorat)
  const getLevelJabatan = (r: SurveyResponseRecord) => {
    if (r.employee_nik && LEVEL_JABATAN_OPTIONS.includes(r.employee_nik)) return r.employee_nik;
    if (r.direktorat && LEVEL_JABATAN_OPTIONS.includes(r.direktorat)) return r.direktorat;
    return r.employee_nik || r.direktorat || 'Staff';
  };

  // Filtered dataset based on Global HC Slicers
  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      const level = getLevelJabatan(r);
      const matchesLokasi = filterLokasi === 'ALL' || r.lokasi_kerja === filterLokasi;
      const matchesDivisi = filterDivisi === 'ALL' || r.divisi === filterDivisi;
      const matchesLevel = filterLevel === 'ALL' || level === filterLevel;
      const matchesMasaKerja = filterMasaKerja === 'ALL' || r.masa_kerja === filterMasaKerja;

      const matchesSearch =
        !searchTerm ||
        r.divisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.lokasi_kerja && r.lokasi_kerja.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.open_feedback && r.open_feedback.toLowerCase().includes(searchTerm.toLowerCase())) ||
        level.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesLokasi && matchesDivisi && matchesLevel && matchesMasaKerja && matchesSearch;
    });
  }, [responses, filterLokasi, filterDivisi, filterLevel, filterMasaKerja, searchTerm]);

  // ============================================================================
  // HC PEOPLE ANALYTICS CALCULATIONS
  // ============================================================================
  const analytics = useMemo(() => {
    const total = filteredResponses.length;
    if (total === 0) {
      return {
        total: 0,
        overallAvg: 0,
        enpsScore: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        highlyEngaged: 0,
        moderatelyEngaged: 0,
        atRisk: 0,
        favorablePct: 0,
        neutralPct: 0,
        unfavorablePct: 0,
        categoryBreakdown: [],
        questionStats: [],
        topStrengths: [],
        bottomActionAreas: [],
        byLokasi: [],
        byLevel: [],
        byMasaKerja: [],
        byDivisi: [],
      };
    }

    // 1. Overall Score & Engagement Tiers per Respondent
    let sumOverall = 0;
    let highlyEngaged = 0;     // Avg >= 8.0
    let moderatelyEngaged = 0; // Avg 6.0 - 7.99
    let atRisk = 0;            // Avg < 6.0

    // 2. eNPS Calculation (Question ID 98 = "90. Apakah Bapak/Ibu akan merekomendasikan...")
    let promoters = 0;  // Score 9 - 10
    let passives = 0;   // Score 7 - 8
    let detractors = 0; // Score 1 - 6
    let enpsCount = 0;

    // 3. Total Answer Polarity (Favorable 8-10, Neutral 6-7, Unfavorable 1-5)
    let favCount = 0;
    let neuCount = 0;
    let unfavCount = 0;
    let totalAnswersCount = 0;

    filteredResponses.forEach((r) => {
      const avg = Number(r.overall_rating_avg) || 0;
      sumOverall += avg;
      if (avg >= 8.0) highlyEngaged++;
      else if (avg >= 6.0) moderatelyEngaged++;
      else atRisk++;

      if (r.answers && Array.isArray(r.answers)) {
        r.answers.forEach((a) => {
          if (typeof a.score === 'number') {
            totalAnswersCount++;
            if (a.score >= 8) favCount++;
            else if (a.score >= 6) neuCount++;
            else unfavCount++;

            if (a.question_id === 98) {
              enpsCount++;
              if (a.score >= 9) promoters++;
              else if (a.score >= 7) passives++;
              else detractors++;
            }
          }
        });
      }
    });

    // Fallback eNPS if question 98 wasn't individually matched
    if (enpsCount === 0) {
      filteredResponses.forEach((r) => {
        const avg = Number(r.overall_rating_avg) || 0;
        enpsCount++;
        if (avg >= 8.5) promoters++;
        else if (avg >= 7.0) passives++;
        else detractors++;
      });
    }

    const enpsScore =
      enpsCount > 0 ? Math.round(((promoters - detractors) / enpsCount) * 100) : 0;

    // 4. Category Breakdown (Average + Favorable / Neutral / Unfavorable %)
    const categoryBreakdown = SURVEY_CATEGORIES.filter((c) =>
      c.questions.some((q) => q.type === 'scale')
    ).map((cat) => {
      let catSum = 0;
      let catTotal = 0;
      let catFav = 0;
      let catNeu = 0;
      let catUnfav = 0;

      const scaleQIds = new Set(cat.questions.filter((q) => q.type === 'scale').map((q) => q.id));

      filteredResponses.forEach((r) => {
        r.answers?.forEach((a) => {
          if (scaleQIds.has(a.question_id) && typeof a.score === 'number') {
            catSum += a.score;
            catTotal++;
            if (a.score >= 8) catFav++;
            else if (a.score >= 6) catNeu++;
            else catUnfav++;
          }
        });
      });

      const avg = catTotal > 0 ? Number((catSum / catTotal).toFixed(2)) : 0;
      return {
        id: cat.id,
        title: cat.title,
        shortTitle: cat.title.replace(/^[A-Z]\.\s*/, ''),
        code: cat.title.slice(0, 1),
        avg,
        favPct: catTotal > 0 ? Math.round((catFav / catTotal) * 100) : 0,
        neuPct: catTotal > 0 ? Math.round((catNeu / catTotal) * 100) : 0,
        unfavPct: catTotal > 0 ? Math.round((catUnfav / catTotal) * 100) : 0,
        totalAnswers: catTotal,
      };
    });

    // 5. Question-Level Item Diagnostic (All 90 scale questions)
    const questionStats: {
      id: number;
      title: string;
      categoryTitle: string;
      categoryId: string;
      avg: number;
      favPct: number;
      neuPct: number;
      unfavPct: number;
      count: number;
    }[] = [];

    SURVEY_CATEGORIES.forEach((cat) => {
      cat.questions.forEach((q) => {
        if (q.type !== 'scale') return;
        let qSum = 0;
        let qCount = 0;
        let qFav = 0;
        let qNeu = 0;
        let qUnfav = 0;

        filteredResponses.forEach((r) => {
          const found = r.answers?.find((a) => a.question_id === q.id);
          if (found && typeof found.score === 'number') {
            qSum += found.score;
            qCount++;
            if (found.score >= 8) qFav++;
            else if (found.score >= 6) qNeu++;
            else qUnfav++;
          }
        });

        if (qCount > 0) {
          questionStats.push({
            id: q.id,
            title: q.title,
            categoryTitle: cat.title,
            categoryId: cat.id,
            avg: Number((qSum / qCount).toFixed(2)),
            favPct: Math.round((qFav / qCount) * 100),
            neuPct: Math.round((qNeu / qCount) * 100),
            unfavPct: Math.round((qUnfav / qCount) * 100),
            count: qCount,
          });
        }
      });
    });

    const sortedByScoreDesc = [...questionStats].sort((a, b) => b.avg - a.avg);
    const sortedByScoreAsc = [...questionStats].sort((a, b) => a.avg - b.avg);

    // 6. Helper to build Demographic Cohort Comparisons
    const buildSegmentStats = (
      extractor: (r: SurveyResponseRecord) => string,
      predefinedOrder?: string[]
    ) => {
      const map: Record<
        string,
        { count: number; sumAvg: number; catSums: Record<string, { sum: number; count: number }> }
      > = {};

      filteredResponses.forEach((r) => {
        const key = extractor(r) || 'Tidak Diketahui';
        if (!map[key]) {
          map[key] = { count: 0, sumAvg: 0, catSums: {} };
        }
        map[key].count++;
        map[key].sumAvg += Number(r.overall_rating_avg) || 0;

        SURVEY_CATEGORIES.forEach((cat) => {
          const scaleIds = new Set(
            cat.questions.filter((q) => q.type === 'scale').map((q) => q.id)
          );
          if (!map[key].catSums[cat.id]) {
            map[key].catSums[cat.id] = { sum: 0, count: 0 };
          }
          r.answers?.forEach((a) => {
            if (scaleIds.has(a.question_id)) {
              map[key].catSums[cat.id].sum += a.score;
              map[key].catSums[cat.id].count++;
            }
          });
        });
      });

      const entries = Object.entries(map).map(([label, val]) => {
        const catAvgs: Record<string, number> = {};
        Object.entries(val.catSums).forEach(([cId, cVal]) => {
          catAvgs[cId] = cVal.count > 0 ? Number((cVal.sum / cVal.count).toFixed(2)) : 0;
        });
        return {
          label,
          count: val.count,
          pct: Math.round((val.count / total) * 100),
          avg: Number((val.sumAvg / val.count).toFixed(2)),
          catAvgs,
        };
      });

      if (predefinedOrder) {
        return entries.sort((a, b) => {
          const idxA = predefinedOrder.indexOf(a.label);
          const idxB = predefinedOrder.indexOf(b.label);
          if (idxA === -1 && idxB === -1) return b.count - a.count;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        });
      }
      return entries.sort((a, b) => b.count - a.count);
    };

    return {
      total,
      overallAvg: Number((sumOverall / total).toFixed(2)),
      enpsScore,
      promoters,
      passives,
      detractors,
      highlyEngaged,
      moderatelyEngaged,
      atRisk,
      favorablePct: totalAnswersCount > 0 ? Math.round((favCount / totalAnswersCount) * 100) : 0,
      neutralPct: totalAnswersCount > 0 ? Math.round((neuCount / totalAnswersCount) * 100) : 0,
      unfavorablePct:
        totalAnswersCount > 0 ? Math.round((unfavCount / totalAnswersCount) * 100) : 0,
      categoryBreakdown,
      questionStats,
      topStrengths: sortedByScoreDesc.slice(0, 5),
      bottomActionAreas: sortedByScoreAsc.slice(0, 5),
      byLokasi: buildSegmentStats((r) => r.lokasi_kerja || 'Lainnya', LOKASI_KERJA_OPTIONS),
      byLevel: buildSegmentStats((r) => getLevelJabatan(r), LEVEL_JABATAN_OPTIONS),
      byMasaKerja: buildSegmentStats((r) => r.masa_kerja || 'Lainnya', MASA_KERJA_OPTIONS),
      byDivisi: buildSegmentStats((r) => r.divisi),
    };
  }, [filteredResponses]);

  const exportToCSV = () => {
    if (filteredResponses.length === 0) return;

    const headers = [
      'ID Responden',
      'Tanggal Submit',
      'Lokasi Kerja',
      'Divisi',
      'Department',
      'Level Jabatan',
      'Masa Kerja',
      'Skor Rata-Rata Total',
      ...SURVEY_CATEGORIES.filter((c) => c.questions.some((q) => q.type === 'scale')).map(
        (c) => `Rata-Rata ${c.title}`
      ),
      'Saran & Masukan (Open Feedback)',
    ];

    const rows = filteredResponses.map((r, idx) => {
      const level = getLevelJabatan(r);
      const catCols = SURVEY_CATEGORIES.filter((c) =>
        c.questions.some((q) => q.type === 'scale')
      ).map((cat) => {
        const qIds = new Set(cat.questions.filter((q) => q.type === 'scale').map((q) => q.id));
        const scores =
          r.answers?.filter((a) => qIds.has(a.question_id)).map((a) => a.score) || [];
        if (scores.length === 0) return '"-"';
        const avg = (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2);
        return `"${avg}"`;
      });

      return [
        `"RESP-${String(filteredResponses.length - idx).padStart(3, '0')}"`,
        `"${new Date(r.created_at).toLocaleString('id-ID')}"`,
        `"${(r.lokasi_kerja || '-').replace(/"/g, '""')}"`,
        `"${r.divisi.replace(/"/g, '""')}"`,
        `"${r.department.replace(/"/g, '""')}"`,
        `"${level.replace(/"/g, '""')}"`,
        `"${(r.masa_kerja || '-').replace(/"/g, '""')}"`,
        `"${r.overall_rating_avg}"`,
        ...catCols,
        `"${(r.open_feedback || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `HC_Analytics_Employee_Engagement_Halla_Mohana_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setFilterLokasi('ALL');
    setFilterDivisi('ALL');
    setFilterLevel('ALL');
    setFilterMasaKerja('ALL');
    setSearchTerm('');
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 8.0) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (score >= 6.0) return 'bg-blue-50 text-blue-800 border-blue-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Memuat People Analytics Console...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Console Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 py-4 px-4 sm:px-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-halla-mohana.png"
              alt="Halla Mohana Logo"
              className="w-10 h-10 object-contain bg-white rounded-full p-0.5"
            />
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                HC People Analytics &bull; Employee Engagement Survey
              </h1>
              <p className="text-xs text-slate-400">
                Halla Mohana &bull; Human Capital Division Executive Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchResponses}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 transition-colors"
              title="Muat Ulang Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredResponses.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded border border-emerald-600 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Laporan CSV</span>
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

      {/* Global Demographic Filter Bar (HC Slicers) */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Filter Demografi HC:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-2.5 flex-1">
            {/* Filter Lokasi */}
            <select
              value={filterLokasi}
              onChange={(e) => setFilterLokasi(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-900"
            >
              <option value="ALL">Semua Lokasi Unit</option>
              {LOKASI_KERJA_OPTIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Filter Level Jabatan */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-900"
            >
              <option value="ALL">Semua Level Jabatan</option>
              {LEVEL_JABATAN_OPTIONS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            {/* Filter Masa Kerja */}
            <select
              value={filterMasaKerja}
              onChange={(e) => setFilterMasaKerja(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-900"
            >
              <option value="ALL">Semua Masa Kerja</option>
              {MASA_KERJA_OPTIONS.map((mk) => (
                <option key={mk} value={mk}>
                  {mk}
                </option>
              ))}
            </select>

            {/* Filter Divisi */}
            <select
              value={filterDivisi}
              onChange={(e) => setFilterDivisi(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-900"
            >
              <option value="ALL">Semua Divisi</option>
              {DIVISI_OPTIONS.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>

            {(filterLokasi !== 'ALL' ||
              filterDivisi !== 'ALL' ||
              filterLevel !== 'ALL' ||
              filterMasaKerja !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 underline shrink-0"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start lg:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ringkasan Eksekutif
            </button>
            <button
              onClick={() => setActiveTab('segmentation')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'segmentation'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matriks Demografi
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'items'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Analisis 90 Item
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'responses'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data & Aspirasi ({analytics.total})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8 flex-1">
        {/* ================================================================= */}
        {/* ROW 1: EXECUTIVE HC KPI CARDS (ALWAYS VISIBLE)                    */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Total Partisipasi */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Partisipasi</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-2">
              <span className="text-3xl font-extrabold text-slate-900">{analytics.total}</span>
              <span className="text-xs text-slate-500 ml-1.5">Responden</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Total Keseluruhan:</span>
              <span className="font-semibold text-slate-800">{responses.length}</span>
            </div>
          </div>

          {/* 2. Engagement Index */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Engagement Index</span>
              <Award className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">
                {analytics.overallAvg.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
            </div>
            <div className="text-xs flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-500">Status Indeks:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  analytics.overallAvg >= 8
                    ? 'bg-emerald-50 text-emerald-700'
                    : analytics.overallAvg >= 6
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {analytics.overallAvg >= 8
                  ? 'Sangat Baik'
                  : analytics.overallAvg >= 6
                  ? 'Moderat'
                  : 'Perlu Perhatian'}
              </span>
            </div>
          </div>

          {/* 3. eNPS (Employee Net Promoter Score) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Skor eNPS</span>
              <Target className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold ${
                  analytics.enpsScore > 30
                    ? 'text-emerald-700'
                    : analytics.enpsScore >= 0
                    ? 'text-blue-700'
                    : 'text-rose-700'
                }`}
              >
                {analytics.enpsScore > 0 ? `+${analytics.enpsScore}` : analytics.enpsScore}
              </span>
              <span className="text-xs text-slate-400">(-100 s/d +100)</span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">Promoter: {analytics.promoters}</span>
              <span className="text-slate-500">Pasif: {analytics.passives}</span>
              <span className="text-rose-700 font-semibold">Detractor: {analytics.detractors}</span>
            </div>
          </div>

          {/* 4. Favorable Sentiment Ratio */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Sentimen Positif</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-emerald-700">
                {analytics.favorablePct}%
              </span>
              <span className="text-xs text-slate-400">Skor 8 - 10</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full"
                style={{ width: `${analytics.favorablePct}%` }}
                title={`Positif (8-10): ${analytics.favorablePct}%`}
              />
              <div
                className="bg-blue-400 h-full"
                style={{ width: `${analytics.neutralPct}%` }}
                title={`Netral (6-7): ${analytics.neutralPct}%`}
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${analytics.unfavorablePct}%` }}
                title={`Kurang Puas (1-5): ${analytics.unfavorablePct}%`}
              />
            </div>
          </div>

          {/* 5. Proporsi Tingkat Keterikatan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Risiko Disengaged</span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{analytics.atRisk}</span>
              <span className="text-xs text-slate-500">
                Karyawan (Skor &lt; 6.0)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">
                Engaged: {analytics.highlyEngaged}
              </span>
              <span className="text-blue-700 font-semibold">
                Moderat: {analytics.moderatelyEngaged}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                         */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Section 1: 8-Dimension Breakdown with Favorable/Neutral/Unfavorable Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-slate-700" />
                    <span>Evaluasi 8 Dimensi Engagement & Distribusi Sentimen</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bukan sekadar rata-rata: menampilkan proporsi karyawan yang memberikan nilai Positif (8-10), Netral (6-7), dan Kritis/Unfavorable (1-5).
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Positif (8-10)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" /> Netral (6-7)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Kritis (1-5)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.categoryBreakdown.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 leading-snug">
                        {cat.title}
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded border shrink-0 ${getScoreBadgeClass(
                          cat.avg
                        )}`}
                      >
                        {cat.avg > 0 ? cat.avg.toFixed(2) : '-'} / 10
                      </span>
                    </div>

                    {/* Stacked Sentiment Bar */}
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${cat.favPct}%` }}
                      />
                      <div
                        className="bg-blue-400 h-full transition-all duration-300"
                        style={{ width: `${cat.neuPct}%` }}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all duration-300"
                        style={{ width: `${cat.unfavPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span className="text-emerald-700">{cat.favPct}% Positif</span>
                      <span className="text-blue-700">{cat.neuPct}% Netral</span>
                      <span className="text-rose-700">{cat.unfavPct}% Kritis</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Quick Demographic Comparison (Lokasi, Level Jabatan, Masa Kerja) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* By Lokasi Kerja */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    <span>Perbandingan Lokasi Kerja</span>
                  </h3>
                </div>
                <div className="space-y-3">
                  {analytics.byLokasi.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada data</p>
                  ) : (
                    analytics.byLokasi.map((item) => (
                      <div
                        key={item.label}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{item.label}</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded border ${getScoreBadgeClass(
                              item.avg
                            )}`}
                          >
                            {item.avg.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{item.count} Responden</span>
                          <span>{item.pct}% dari total</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* By Level Jabatan */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-600" />
                    <span>Indeks per Level Jabatan</span>
                  </h3>
                </div>
                <div className="space-y-3">
                  {analytics.byLevel.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada data</p>
                  ) : (
                    analytics.byLevel.map((item) => (
                      <div
                        key={item.label}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{item.label}</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded border ${getScoreBadgeClass(
                              item.avg
                            )}`}
                          >
                            {item.avg.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{item.count} Responden</span>
                          <span>{item.pct}% dari total</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* By Masa Kerja (Tenure) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span>Tren Siklus Masa Kerja</span>
                  </h3>
                </div>
                <div className="space-y-3">
                  {analytics.byMasaKerja.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada data</p>
                  ) : (
                    analytics.byMasaKerja.map((item) => (
                      <div
                        key={item.label}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{item.label}</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded border ${getScoreBadgeClass(
                              item.avg
                            )}`}
                          >
                            {item.avg.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{item.count} Responden</span>
                          <span>{item.pct}% dari total</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Top 5 Strengths & Bottom 5 Priority Action Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 5 Strengths */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>5 Kekuatan Utama Organisasi (Top Strengths)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Item pernyataan dengan tingkat kepuasan dan persetujuan tertinggi dari karyawan.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {analytics.topStrengths.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada data penilaian.</p>
                  ) : (
                    analytics.topStrengths.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 bg-emerald-50/40 border border-emerald-200/80 rounded-lg space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {q.title}
                          </p>
                          <span className="px-2.5 py-1 bg-emerald-700 text-white text-xs font-bold rounded shrink-0">
                            {q.avg.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{q.categoryTitle}</span>
                          <span className="text-emerald-700 font-semibold">
                            {q.favPct}% Responden Setuju (8-10)
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom 5 Action Areas */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>5 Area Prioritas Perbaikan HC (Bottom 5 Items)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Item pernyataan dengan skor rata-rata terendah yang memerlukan tindak lanjut manajemen.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {analytics.bottomActionAreas.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada data penilaian.</p>
                  ) : (
                    analytics.bottomActionAreas.map((q) => (
                      <div
                        key={q.id}
                        className="p-3.5 bg-rose-50/40 border border-rose-200/80 rounded-lg space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {q.title}
                          </p>
                          <span className="px-2.5 py-1 bg-rose-700 text-white text-xs font-bold rounded shrink-0">
                            {q.avg.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{q.categoryTitle}</span>
                          <span className="text-rose-700 font-semibold">
                            {q.unfavPct}% Kritis (1-5) &bull; {q.favPct}% Positif
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: DEMOGRAPHIC MATRIX & CROSS-SEGMENTATION HEATMAP            */}
        {/* ================================================================= */}
        {activeTab === 'segmentation' && (
          <div className="space-y-8">
            {/* Cross-Tab Heatmap: Level Jabatan vs 8 Dimensions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Matriks Skor Dimensi berdasarkan Level Jabatan & Lokasi
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Memudahkan HC melihat celah persepsi antara level Manajemen (Manager / Asst. Manager) dan level Operasional (SPV / Staff) pada tiap aspek A–H.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Segmen / Kelompok</th>
                      <th className="py-3 px-3 text-center">Resp</th>
                      <th className="py-3 px-3 text-center">Total Avg</th>
                      {analytics.categoryBreakdown.map((cat) => (
                        <th key={cat.id} className="py-3 px-2.5 text-center" title={cat.title}>
                          Bagian {cat.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Sub-header Lokasi */}
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <td colSpan={11} className="py-2 px-4">
                        Berdasarkan Lokasi Kerja / Unit Bisnis
                      </td>
                    </tr>
                    {analytics.byLokasi.map((seg) => (
                      <tr key={`loc-${seg.label}`} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{seg.label}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{seg.count}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 bg-slate-50">
                          {seg.avg.toFixed(2)}
                        </td>
                        {analytics.categoryBreakdown.map((cat) => {
                          const val = seg.catAvgs[cat.id] || 0;
                          return (
                            <td key={cat.id} className="py-3 px-2.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-semibold border ${getScoreBadgeClass(
                                  val
                                )}`}
                              >
                                {val > 0 ? val.toFixed(2) : '-'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Sub-header Level Jabatan */}
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <td colSpan={11} className="py-2 px-4">
                        Berdasarkan Level Jabatan
                      </td>
                    </tr>
                    {analytics.byLevel.map((seg) => (
                      <tr key={`lvl-${seg.label}`} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{seg.label}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{seg.count}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 bg-slate-50">
                          {seg.avg.toFixed(2)}
                        </td>
                        {analytics.categoryBreakdown.map((cat) => {
                          const val = seg.catAvgs[cat.id] || 0;
                          return (
                            <td key={cat.id} className="py-3 px-2.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-semibold border ${getScoreBadgeClass(
                                  val
                                )}`}
                              >
                                {val > 0 ? val.toFixed(2) : '-'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Sub-header Masa Kerja */}
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <td colSpan={11} className="py-2 px-4">
                        Berdasarkan Masa Kerja (Tenure)
                      </td>
                    </tr>
                    {analytics.byMasaKerja.map((seg) => (
                      <tr key={`mk-${seg.label}`} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{seg.label}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{seg.count}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 bg-slate-50">
                          {seg.avg.toFixed(2)}
                        </td>
                        {analytics.categoryBreakdown.map((cat) => {
                          const val = seg.catAvgs[cat.id] || 0;
                          return (
                            <td key={cat.id} className="py-3 px-2.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-semibold border ${getScoreBadgeClass(
                                  val
                                )}`}
                              >
                                {val > 0 ? val.toFixed(2) : '-'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Sub-header Divisi */}
                    <tr className="bg-slate-100 font-bold text-slate-700">
                      <td colSpan={11} className="py-2 px-4">
                        Berdasarkan Divisi
                      </td>
                    </tr>
                    {analytics.byDivisi.map((seg) => (
                      <tr key={`div-${seg.label}`} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{seg.label}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{seg.count}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900 bg-slate-50">
                          {seg.avg.toFixed(2)}
                        </td>
                        {analytics.categoryBreakdown.map((cat) => {
                          const val = seg.catAvgs[cat.id] || 0;
                          return (
                            <td key={cat.id} className="py-3 px-2.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-semibold border ${getScoreBadgeClass(
                                  val
                                )}`}
                              >
                                {val > 0 ? val.toFixed(2) : '-'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <strong>A:</strong> Keselarasan & Tujuan
                </span>
                <span>
                  <strong>B:</strong> Pengakuan & Apresiasi
                </span>
                <span>
                  <strong>C:</strong> Nilai & Budaya
                </span>
                <span>
                  <strong>D:</strong> Remunerasi & Benefit
                </span>
                <span>
                  <strong>E:</strong> Kepemimpinan
                </span>
                <span>
                  <strong>F:</strong> Pengembangan Karir
                </span>
                <span>
                  <strong>G:</strong> Sinergi Tim
                </span>
                <span>
                  <strong>H:</strong> Komitmen & Motivasi
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: FULL 90+ ITEM DIAGNOSTIC BREAKDOWN                         */}
        {/* ================================================================= */}
        {activeTab === 'items' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Analisis Diagnostik Seluruh Butir Pertanyaan (90 Item)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian performa skor rata-rata dan distribusi kepuasan untuk setiap butir soal kuesioner.
                </p>
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium"
              >
                <option value="ALL">Tampilkan Semua Kategori (A - I)</option>
                {SURVEY_CATEGORIES.filter((c) => c.questions.some((q) => q.type === 'scale')).map(
                  (c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Pernyataan Kuesioner</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-center">Skor Avg</th>
                    <th className="py-3 px-4 w-56">Distribusi Sentimen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.questionStats
                    .filter(
                      (q) =>
                        selectedCategoryFilter === 'ALL' || q.categoryId === selectedCategoryFilter
                    )
                    .map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{q.title}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {q.categoryTitle.slice(0, 28)}...
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded font-bold border ${getScoreBadgeClass(
                              q.avg
                            )}`}
                          >
                            {q.avg.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                              <div
                                className="bg-emerald-600 h-full"
                                style={{ width: `${q.favPct}%` }}
                              />
                              <div
                                className="bg-blue-400 h-full"
                                style={{ width: `${q.neuPct}%` }}
                              />
                              <div
                                className="bg-rose-500 h-full"
                                style={{ width: `${q.unfavPct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span className="text-emerald-700">{q.favPct}% Pos</span>
                              <span className="text-blue-700">{q.neuPct}% Net</span>
                              <span className="text-rose-700">{q.unfavPct}% Krit</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: ANONYMOUS RESPONSES & VOICE OF EMPLOYEE (OPEN FEEDBACK)    */}
        {/* ================================================================= */}
        {activeTab === 'responses' && (
          <div className="space-y-8">
            {/* Voice of Employee Qualitative Wall */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-700" />
                    <span>Suara & Aspirasi Karyawan (Voice of Employee)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kumpulan masukan kualitatif terkait perubahan yang diharapkan dari perusahaan (Pertanyaan 91).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {filteredResponses.filter((r) => r.open_feedback && r.open_feedback.trim() !== '')
                  .length === 0 ? (
                  <p className="text-xs text-slate-400 col-span-2 py-4 text-center">
                    Belum ada masukan kualitatif tertulis pada filter ini.
                  </p>
                ) : (
                  filteredResponses
                    .filter((r) => r.open_feedback && r.open_feedback.trim() !== '')
                    .map((r) => (
                      <div
                        key={`fb-${r.id}`}
                        onClick={() => setSelectedResponse(r)}
                        className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg space-y-2.5 cursor-pointer transition-colors"
                      >
                        <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                          &ldquo;{r.open_feedback}&rdquo;
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[11px] text-slate-500">
                          <span>
                            <strong>{r.lokasi_kerja || '-'}</strong> &bull; {r.divisi} ({getLevelJabatan(r)})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold border ${getScoreBadgeClass(
                              Number(r.overall_rating_avg)
                            )}`}
                          >
                            Avg: {r.overall_rating_avg}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Individual Semi-Anonymous Response Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Daftar Respons Survei Karyawan (Semi-Anonim)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Klik pada baris responden untuk memeriksa rincian 90+ jawaban kuesioner secara lengkap.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari Divisi / Department / Masukan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-slate-900 w-full sm:w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">ID Responden</th>
                      <th className="py-3 px-4">Lokasi Kerja</th>
                      <th className="py-3 px-4">Divisi & Department</th>
                      <th className="py-3 px-4">Level Jabatan</th>
                      <th className="py-3 px-4">Masa Kerja</th>
                      <th className="py-3 px-4 text-center">Skor Rata-Rata</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredResponses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          Belum ada data respons survei yang sesuai dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredResponses.map((item, index) => {
                        const level = getLevelJabatan(item);
                        const respCode = `RESP-${String(filteredResponses.length - index).padStart(
                          3,
                          '0'
                        )}`;
                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedResponse(item)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                              {respCode}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 text-xs font-medium">
                              {item.lokasi_kerja || '-'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 text-xs">
                              <span className="font-semibold text-slate-900">{item.divisi}</span>
                              <span className="text-slate-400 mx-1.5">&bull;</span>
                              <span>{item.department}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 text-xs">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-medium">
                                {level}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 text-xs">
                              {item.masa_kerja || '-'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreBadgeClass(
                                  Number(item.overall_rating_avg)
                                )}`}
                              >
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
                                <span>Detail</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* DETAIL MODAL / DRAWER PER RESPONDENT                              */}
      {/* ================================================================= */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Rincian Jawaban Responden (Semi-Anonim)
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {selectedResponse.divisi} &bull; {selectedResponse.department}
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
                    <MapPin className="w-3.5 h-3.5" /> Lokasi Kerja:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedResponse.lokasi_kerja || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 flex items-center gap-1 mb-1">
                    <Briefcase className="w-3.5 h-3.5" /> Level Jabatan:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {getLevelJabatan(selectedResponse)}
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
                    <Award className="w-3.5 h-3.5" /> Skor Rata-Rata:
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedResponse.overall_rating_avg} / 10.0
                  </span>
                </div>
              </div>

              {/* Open Feedback Text */}
              {selectedResponse.open_feedback && (
                <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-lg space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Saran & Perubahan yang Diinginkan (No. 91)
                  </h4>
                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {selectedResponse.open_feedback}
                  </p>
                </div>
              )}

              {/* Rincian Skor per Kategori */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Daftar Nilai Kuesioner (Skala 1 - 10)
                </h3>

                {SURVEY_CATEGORIES.map((cat) => {
                  const scaleQuestions = cat.questions.filter((q) => q.type === 'scale');
                  if (scaleQuestions.length === 0) return null;

                  // Calculate respondent's average for this category
                  const catScores = scaleQuestions
                    .map(
                      (q) =>
                        selectedResponse.answers?.find((a) => a.question_id === q.id)?.score
                    )
                    .filter((s): s is number => typeof s === 'number');
                  const catAvg =
                    catScores.length > 0
                      ? (catScores.reduce((a, b) => a + b, 0) / catScores.length).toFixed(2)
                      : '-';

                  return (
                    <div key={cat.id} className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded border-l-4 border-slate-900">
                        <h4 className="text-xs font-bold text-slate-800">{cat.title}</h4>
                        <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                          Rata-Rata Bagian: {catAvg}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {scaleQuestions.map((q) => {
                          const ansObj = selectedResponse.answers?.find(
                            (a) => a.question_id === q.id
                          );
                          const score = ansObj ? ansObj.score : undefined;

                          return (
                            <div
                              key={q.id}
                              className="flex items-center justify-between text-xs py-1.5 px-3 bg-white border border-slate-100 rounded hover:bg-slate-50"
                            >
                              <span className="text-slate-700 pr-4">{q.title}</span>
                              <span
                                className={`font-bold px-2.5 py-1 rounded border shrink-0 ${
                                  score !== undefined
                                    ? getScoreBadgeClass(score)
                                    : 'bg-slate-50 text-slate-400 border-slate-200'
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
