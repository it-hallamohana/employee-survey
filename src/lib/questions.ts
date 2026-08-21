import { QuestionCategory } from './types';

export const DIREKTORAT_OPTIONS = [
  "FAD",
  "CBD",
  "HC",
  "OPS",
  "Lainnya"
];

export const DIVISI_OPTIONS = [
  "BOD & Advisor",
  "Corporate Secretary",
  "Corporate Planning",
  "Risk & QHSE",
  "Corporate Controller",
  "Finance",
  "Financial Planning",
  "Accounting & Tax",
  "Human Capital",
  "Information Technology",
  "Asset Management & Procurement",
  "Manned Guarding Sales",
  "Non Manned Guarding Sales",
  "Commercial",
  "National Operation Support",
  "Consultation & Training",
  "RO Jakarta",
  "RO Makassar",
  "RO Bandung",
  "RO Pekanbaru",
  "RO Balikpapan",
  "RO Surabaya",
  "Multisite Office",
  "Sales Strategy"
];

export const DEPARTMENT_OPTIONS = [
  "BOD & Advisor",
  "Corporate Planning",
  "Corporate Investigation",
  "Quality",
  "HSE",
  "Legal & Regulatory Management",
  "Corporate Communication",
  "Treasury",
  "Collection & Fund Management",
  "Accounting",
  "Tax Management",
  "Budget Management",
  "Operation & Services",
  "Talent Management & Recruitment",
  "Reward Management",
  "IT Development",
  "IT Operation",
  "Asset Management & GA",
  "Procurement",
  "West Manned Guarding Sales",
  "East Manned Guarding Sales",
  "ESS Sales",
  "Estimator",
  "Tender Preparation",
  "Program Management Office",
  "National Command Center",
  "Physical Security Support",
  "Training Center",
  "Consultant",
  "RO Jakarta",
  "RO Makassar",
  "RO Bandung",
  "RO Pekanbaru",
  "RO Balikpapan",
  "RO Surabaya",
  "Multisite Office",
  "Sales Strategy"
];

export const MASA_KERJA_OPTIONS = [
  "< 1 Tahun",
  "1 - 3 Tahun",
  "3 - 5 Tahun",
  "> 5 Tahun"
];

export const LOKASI_KERJA_OPTIONS = [
  "Head Office",
  "Regional Office Jakarta",
  "Regional Office Bandung",
  "Regional Office Surabaya",
  "Regional Office Medan / Pekanbaru",
  "Regional Office Balikpapan",
  "Regional Office Makassar",
  "Multisite / Operational Site"
];

export const SURVEY_CATEGORIES: QuestionCategory[] = [
  {
    "id": "sec-1",
    "title": "A. Keselarasan & Tujuan Perusahaan (Alignment & Purpose)",
    "description": "Evaluasi terhadap pemahaman dan keselarasan peran Anda dengan visi serta tujuan perusahaan.",
    "questions": [
      {
        "id": 7,
        "category": "sec-1",
        "title": "1. Saya dapat melihat dengan jelas hubungan antara pekerjaan saya dan tujuan perusahaan ini.",
        "type": "scale"
      },
      {
        "id": 8,
        "category": "sec-1",
        "title": "2. Atasan di perusahaan ini memberikan arahan yang jelas.",
        "type": "scale"
      },
      {
        "id": 9,
        "category": "sec-1",
        "title": "3. Saya merasa pekerjaan saya memberikan kontribusi pada pencapaian tujuan perusahaan.",
        "type": "scale"
      },
      {
        "id": 10,
        "category": "sec-1",
        "title": "4. Pihak manajemen mempercayai keputusan yang diambil oleh saya.",
        "type": "scale"
      },
      {
        "id": 11,
        "category": "sec-1",
        "title": "5. Atasan saya memberikan pengakuan atas pekerjaan yang saya lakukan dengan baik.",
        "type": "scale"
      },
      {
        "id": 12,
        "category": "sec-1",
        "title": "6. Perusahaan memberi apresiasi atas pencapaian baik dalam pekerjaan atau keberhasilan pembelajaran.",
        "type": "scale"
      },
      {
        "id": 13,
        "category": "sec-1",
        "title": "7. Saya senang dengan penghargaan yang diberikan oleh atasan saya.",
        "type": "scale"
      },
      {
        "id": 14,
        "category": "sec-1",
        "title": "8. Saya merasa atasan saya peduli dengan umpan balik yang saya berikan.",
        "type": "scale"
      },
      {
        "id": 15,
        "category": "sec-1",
        "title": "9. Perusahaan ini menggunakan saran dan masukan dari karyawan untuk melakukan perbaikan.",
        "type": "scale"
      },
      {
        "id": 16,
        "category": "sec-1",
        "title": "10. Saya didukung dan memiliki otoritas dalam membuat keputusan yang dibutuhkan untuk penyelesaian tugas yang diberikan.",
        "type": "scale"
      },
      {
        "id": 17,
        "category": "sec-1",
        "title": "11. Saya merasa dihargai sebagai anggota tim.",
        "type": "scale"
      }
    ]
  },
  {
    "id": "sec-2",
    "title": "B. Pengakuan, Apresiasi & Pemberdayaan",
    "description": "Evaluasi terhadap penghargaan atas hasil kerja, umpan balik dari atasan, dan otoritas pekerjaan.",
    "questions": [
      {
        "id": 18,
        "category": "sec-2",
        "title": "12. Saya merasa puas ketika mampu menyelesaikan tugas yang diberikan.",
        "type": "scale"
      },
      {
        "id": 19,
        "category": "sec-2",
        "title": "13. Saya memiliki keterlibatan dalam keputusan yang mempengaruhi pekerjaan saya.",
        "type": "scale"
      },
      {
        "id": 20,
        "category": "sec-2",
        "title": "14. Manajemen di perusahaan ini menghargai perbedaan di tempat kerja (termasuk latar belakang etnis, agama, jenis kelamin, suku, usia, & disabilitas).",
        "type": "scale"
      },
      {
        "id": 21,
        "category": "sec-2",
        "title": "15. Saya percaya keputusan manajemen konsisten dengan nilai-nilai perusahaan (F.A.I.T.H).",
        "type": "scale"
      },
      {
        "id": 22,
        "category": "sec-2",
        "title": "16. Nawakara bersikap jujur dan bertanggung jawab terhadap karyawannya.",
        "type": "scale"
      },
      {
        "id": 23,
        "category": "sec-2",
        "title": "17. Saya merasa aman untuk mengungkapkan pendapat secara terbuka di departemen saya.",
        "type": "scale"
      },
      {
        "id": 24,
        "category": "sec-2",
        "title": "18. Atasan saya memperlakukan karyawan dengan kepercayaan dan rasa hormat.",
        "type": "scale"
      },
      {
        "id": 25,
        "category": "sec-2",
        "title": "19. Saya pikir saya mendapatkan imbalan dengan adil.",
        "type": "scale"
      },
      {
        "id": 26,
        "category": "sec-2",
        "title": "20. Saya puas dengan benefit yang saya dapatkan dalam pekerjaan saya saat ini.",
        "type": "scale"
      },
      {
        "id": 27,
        "category": "sec-2",
        "title": "21. Saya puas dengan gaji yang saya dapatkan dalam pekerjaan saya saat ini.",
        "type": "scale"
      },
      {
        "id": 28,
        "category": "sec-2",
        "title": "22. Gaji yang saya terima sesuai dengan kinerja yang saya tampilkan.",
        "type": "scale"
      },
      {
        "id": 29,
        "category": "sec-2",
        "title": "23. Manajemen di perusahaan ini memberikan arahan yang jelas.",
        "type": "scale"
      },
      {
        "id": 30,
        "category": "sec-2",
        "title": "24. Saya percaya pada keputusan yang dibuat oleh pihak manajemen perusahaan.",
        "type": "scale"
      }
    ]
  },
  {
    "id": "sec-3",
    "title": "C. Nilai-Nilai & Budaya Perusahaan (Core Values & Culture)",
    "description": "Penerapan nilai-nilai utama perusahaan (F.A.I.T.H), keadilan, dan keterbukaan lingkungan kerja.",
    "questions": [
      {
        "id": 31,
        "category": "sec-3",
        "title": "25. Gaya manajemen di perusahaan ini mendorong karyawan untuk memberikan yang terbaik.",
        "type": "scale"
      },
      {
        "id": 32,
        "category": "sec-3",
        "title": "26. Saya percaya keputusan manajemen konsisten dengan nilai inti perusahaan (F.A.I.T.H).",
        "type": "scale"
      },
      {
        "id": 33,
        "category": "sec-3",
        "title": "27. Perusahaan mengikuti perkembangan informasi dan membaginya kepada karyawan.",
        "type": "scale"
      },
      {
        "id": 34,
        "category": "sec-3",
        "title": "28. Laju perubahan saat ini di perusahaan secara keseluruhan terlalu cepat.",
        "type": "scale"
      },
      {
        "id": 35,
        "category": "sec-3",
        "title": "29. Atasan melakukan pekerjaan yang sangat baik untuk mengkomunikasikan prioritas yang harus didahulukan dalam pekerjaan.",
        "type": "scale"
      },
      {
        "id": 36,
        "category": "sec-3",
        "title": "30. Atasan saya memberi saya umpan balik rutin tentang kinerja saya.",
        "type": "scale"
      },
      {
        "id": 37,
        "category": "sec-3",
        "title": "31. Atasan saya memastikan bahwa orang-orang di departemen saya memahami tujuan perusahaan.",
        "type": "scale"
      },
      {
        "id": 38,
        "category": "sec-3",
        "title": "32. Atasan saya bertindak untuk menyelesaikan konflik dan situasi masalah lainnya.",
        "type": "scale"
      },
      {
        "id": 39,
        "category": "sec-3",
        "title": "33. Saya memiliki keyakinan terhadap keputusan yang dibuat oleh atasan saya.",
        "type": "scale"
      },
      {
        "id": 40,
        "category": "sec-3",
        "title": "34. Atasan memberikan saya pengakuan atas pekerjaan yang dilakukan dengan baik.",
        "type": "scale"
      },
      {
        "id": 41,
        "category": "sec-3",
        "title": "35. Tujuan dan sasaran perusahaan diidentifikasi secara jelas.",
        "type": "scale"
      },
      {
        "id": 42,
        "category": "sec-3",
        "title": "36. Saya yakin saya memiliki kesempatan untuk berkembang dan tumbuh di perusahaan.",
        "type": "scale"
      },
      {
        "id": 43,
        "category": "sec-3",
        "title": "37. Perusahaan ini memberi karyawan informasi dan sumber daya yang diperlukan untuk mencapai karir secara efektif.",
        "type": "scale"
      }
    ]
  },
  {
    "id": "sec-4",
    "title": "D. Remunerasi, Gaji & Manfaat Karyawan",
    "description": "Kepuasan dan kesesuaian kompensasi serta fasilitas yang diterima terhadap kontribusi kinerja.",
    "questions": [
      {
        "id": 44,
        "category": "sec-4",
        "title": "38. Saya memiliki kesempatan untuk mendapatkan pelatihan untuk meningkatkan keterampilan saya dalam pekerjaan saya saat ini.",
        "type": "scale"
      },
      {
        "id": 45,
        "category": "sec-4",
        "title": "39. Perusahaan mendukung untuk pengembangan keterampilan saya yang dibutuhkan untuk pekerjaan saya di masa depan.",
        "type": "scale"
      },
      {
        "id": 47,
        "category": "sec-4",
        "title": "40. Mengetahui dengan jelas hubungan yang terkait antara pekerjaan saya dan tujuan perusahaan.",
        "type": "scale"
      },
      {
        "id": 48,
        "category": "sec-4",
        "title": "41. Arahan yang jelas dari atasan di perusahaan.",
        "type": "scale"
      },
      {
        "id": 49,
        "category": "sec-4",
        "title": "42. Pencapaian tujuan perusahaan dipengaruhi adanya kontribusi perkerjaan saya.",
        "type": "scale"
      },
      {
        "id": 50,
        "category": "sec-4",
        "title": "43. Kepercayaan pihak manajemen terkait keputusan yang saya berikan di perusahaan.",
        "type": "scale"
      },
      {
        "id": 51,
        "category": "sec-4",
        "title": "44. Pengakuan dari atasan atas pekerjaan yang telah saya lakukan dengan baik.",
        "type": "scale"
      },
      {
        "id": 52,
        "category": "sec-4",
        "title": "45. Pemberian apresiasi dari perusahaan atas keberhasilan pencapaian pekerjaan atau pembelajaran yang baik.",
        "type": "scale"
      },
      {
        "id": 53,
        "category": "sec-4",
        "title": "46. Penghargaan dari atasan yang diberikan untuk keberhasilan saya.",
        "type": "scale"
      },
      {
        "id": 54,
        "category": "sec-4",
        "title": "47. Kepedulian atasan terhadap umpan balik yang saya berikan.",
        "type": "scale"
      },
      {
        "id": 55,
        "category": "sec-4",
        "title": "48. Saran dan masukan dari karyawan digunakan perusahaan dalam melakukan perbaikan.",
        "type": "scale"
      },
      {
        "id": 56,
        "category": "sec-4",
        "title": "49. Memiliki otoritas dan dukungan dalam membuat keputusan untuk menyelesaikan tugas yang diberikan.",
        "type": "scale"
      }
    ]
  },
  {
    "id": "sec-5",
    "title": "E. Kepemimpinan & Gaya Manajemen",
    "description": "Kepercayaan terhadap arahan manajemen, pola komunikasi atasan, dan penanganan tantangan.",
    "questions": [
      {
        "id": 57,
        "category": "sec-5",
        "title": "50. Perasaan dihargai sebagai bagian dari suatu tim.",
        "type": "scale"
      },
      {
        "id": 58,
        "category": "sec-5",
        "title": "51. Kepuasan setelah mampu menyelesaikan tugas yang diberikan.",
        "type": "scale"
      },
      {
        "id": 59,
        "category": "sec-5",
        "title": "52. Terlibat dalam pembuatan keputusan yang mempengaruhi pekerjaan saya.",
        "type": "scale"
      },
      {
        "id": 60,
        "category": "sec-5",
        "title": "53. Terciptanya suasana saling menghargai perbedaan (termasuk latar belakang etnis, agama, jenis kelamin, suku, usia, & disabilitas) yang diberikan manajemen.",
        "type": "scale"
      },
      {
        "id": 61,
        "category": "sec-5",
        "title": "54. Penerapan nilai-nilai perusahaan (F.A.I.T.H) dilakukan konsisten oleh manajemen.",
        "type": "scale"
      },
      {
        "id": 62,
        "category": "sec-5",
        "title": "55. Sikap jujur dan tanggung jawab yang ditunjukkan Nawakara kepada karyawan.",
        "type": "scale"
      },
      {
        "id": 63,
        "category": "sec-5",
        "title": "56. Perasaan yang nyaman dan terbuka dalam mengungkapkan pendapat dan rasa khawatir dalam departemen saya.",
        "type": "scale"
      },
      {
        "id": 64,
        "category": "sec-5",
        "title": "57. Kepercayaan dan apresiasi dari atasan dalam memperlakukan setiap karyawan.",
        "type": "scale"
      },
      {
        "id": 65,
        "category": "sec-5",
        "title": "58. Perusahaan memberikan imbalan yang adil kepada setiap karyawan.",
        "type": "scale"
      },
      {
        "id": 66,
        "category": "sec-5",
        "title": "59. Kepuasan saya terkait benefit yang diperoleh dalam pekerjaan.",
        "type": "scale"
      },
      {
        "id": 67,
        "category": "sec-5",
        "title": "60. Kepuasan saya terkait gaji yang diperoleh dalam pekerjaan.",
        "type": "scale"
      },
      {
        "id": 68,
        "category": "sec-5",
        "title": "61. Kesesuaian gaji yang saya terima dengan kinerja yang ditampilkan.",
        "type": "scale"
      },
      {
        "id": 69,
        "category": "sec-5",
        "title": "62. Arahan yang jelas dari manajemen di perusahaan.",
        "type": "scale"
      }
    ]
  },
  {
    "id": "sec-6",
    "title": "F. Pengembangan Karir & Pelatihan",
    "description": "Dukungan perusahaan terhadap pengembangan keterampilan, wawasan karir, dan potensi diri.",
    "questions": [
      {
        "id": 70,
        "category": "sec-6",
        "title": "63. Kepercayaan karyawan kepada perusahaan pada setiap keputusan yang dihasilkan.",
        "type": "scale"
      },
      {
        "id": 71,
        "category": "sec-6",
        "title": "64. Dorongan perusahaan kepada karyawan untuk menghasilkan performa terbaik dilakukan melalui gaya manajemen di perusahaan.",
        "type": "scale"
      },
      {
        "id": 72,
        "category": "sec-6",
        "title": "65. Penerapan nilai inti perusahaan (F.A.I.T.H) dilakukan konsisten oleh manajemen.",
        "type": "scale"
      },
      {
        "id": 73,
        "category": "sec-6",
        "title": "66. Perkembangan informasi yang dilakukan perusahaan akan dibagikan kepada karyawan.",
        "type": "scale"
      },
      {
        "id": 74,
        "category": "sec-6",
        "title": "67. Kecepatan perusahaan dalam mengikuti laju perubahaan global.",
        "type": "scale"
      },
      {
        "id": 75,
        "category": "sec-6",
        "title": "68. Terjalinnya komunikasi dari atasan untuk menjelaskan prioritas pekerjaan yang perlu didahulukan.",
        "type": "scale"
      },
      {
        "id": 76,
        "category": "sec-6",
        "title": "69. Pemberian umpan balik terkait kinerja dari atasan.",
        "type": "scale"
      },
      {
        "id": 77,
        "category": "sec-6",
        "title": "70. Pemberian pemahaman dari atasan untuk memastikan pemahaman tujuan perusahaan kepada anggota tim dalam departemen.",
        "type": "scale"
      },
      {
        "id": 78,
        "category": "sec-6",
        "title": "71. Tindakan nyata dari atasan dalam menyelesaikan konflik dan situasi permasalahan lainnya.",
        "type": "scale"
      },
      {
        "id": 79,
        "category": "sec-6",
        "title": "72. Meyakini keputusan dari atasan sebagai hal terbaik untuk dilakukan.",
        "type": "scale"
      },
      {
        "id": 80,
        "category": "sec-6",
        "title": "73. Pengakuan dari atasan atas hasil pekerjaan saya yang baik.",
        "type": "scale"
      }
    ]
  },
  {
    "id": "sec-7",
    "title": "G. Sinergi & Kerjasama Tim",
    "description": "Kualitas kolaborasi antar departemen, dukungan antar unit kerja, dan keharmonisan tim.",
    "questions": [
      {
        "id": 81,
        "category": "sec-7",
        "title": "74. Penjelasan identifikasi atas tujuan dan sasaran perusahaan.",
        "type": "scale"
      },
      {
        "id": 82,
        "category": "sec-7",
        "title": "75. Perusahaan memberikan kesempatan dalam berkembang dan tumbuh secara pribadi selama bekerja.",
        "type": "scale"
      },
      {
        "id": 83,
        "category": "sec-7",
        "title": "76. Tersedianya informasi dan sumber daya yang diberikan perusahaan untuk mengelola karir karyawan secara efektif.",
        "type": "scale"
      },
      {
        "id": 84,
        "category": "sec-7",
        "title": "77. Kesempatan untuk mendapatkan pelatihan yang berguna dalam meningkatkan keterampilan saya dalam bekerja.",
        "type": "scale"
      },
      {
        "id": 85,
        "category": "sec-7",
        "title": "78. Dukungan perusahaan untuk mengembangkan keterampilan yang dibutuhkan dalam pekerjaan saya di masa depan.",
        "type": "scale"
      },
      {
        "id": 86,
        "category": "sec-7",
        "title": "79. Saya merasa setiap department/divisi dapat bersinergi untuk mencapai tujuan perusahaan.",
        "type": "scale"
      },
      {
        "id": 87,
        "category": "sec-7",
        "title": "80. Setiap department/divisi menunjukan keterlibatan dalam pencapaian perusahaan sampai saat ini.",
        "type": "scale"
      },
      {
        "id": 88,
        "category": "sec-7",
        "title": "81. Saya merasa senang dengan sinergi yang terjadi di dalam tim saya.",
        "type": "scale"
      }
    ]
  },
  {
    "id": "sec-8",
    "title": "H. Komitmen & Motivasional Karyawan",
    "description": "Fokus, antusiasme dalam bekerja, serta rekomendasi institusi kepada pihak luar.",
    "questions": [
      {
        "id": 89,
        "category": "sec-8",
        "title": "82. Dukungan/Support yang diberikan dari department/divisi lain membantu pekerjaan saya.",
        "type": "scale"
      },
      {
        "id": 90,
        "category": "sec-8",
        "title": "83. Pencapaian tim saya saat ini adalah bagian dari supporting tim lain.",
        "type": "scale"
      },
      {
        "id": 92,
        "category": "sec-8",
        "title": "84. Saya bertekad untuk mencapai tujuan pekerjaan saya dan yakin dapat memenuhinya.",
        "type": "scale"
      },
      {
        "id": 93,
        "category": "sec-8",
        "title": "85. Saya sangat termotivasi oleh tujuan pekerjaan saya.",
        "type": "scale"
      },
      {
        "id": 94,
        "category": "sec-8",
        "title": "86. Saat bekerja, saya fokus sepenuhnya pada pekerjaan saya.",
        "type": "scale"
      },
      {
        "id": 95,
        "category": "sec-8",
        "title": "87. Saya memiliki semangat dengan pekerjaan saya.",
        "type": "scale"
      },
      {
        "id": 96,
        "category": "sec-8",
        "title": "88. Saya menikmati menjadi sukarelawan untuk aktivitas di luar tugas utama saya.",
        "type": "scale"
      },
      {
        "id": 97,
        "category": "sec-8",
        "title": "89. Saya merasa benar-benar terhubung dengan pekerjaan, seperti saya selalu bersemangat penuh.",
        "type": "scale"
      }
    ]
  },
  {
    "id": "sec-9",
    "title": "I. Masukan & Perubahan Perusahaan",
    "description": "Saran atau perbaikan yang Anda harapkan dari manajemen perusahaan ke depan.",
    "questions": [
      {
        "id": 98,
        "category": "sec-9",
        "title": "90. Apakah Bapak/Ibu akan merekomendasikan kepada kerabat/orang yang dikenal tentang Nawakara?",
        "type": "scale"
      },
      {
        "id": 99,
        "category": "sec-9",
        "title": "91. Perubahan apa dari perusahaan yang Bapak/Ibu inginkan ?",
        "type": "text"
      }
    ]
  }
];
