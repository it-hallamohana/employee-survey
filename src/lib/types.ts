export interface EmployeeDemographics {
  divisi: string;
  department: string;
  level_jabatan: string;
  masa_kerja: string;
  lokasi_kerja: string;
  // Backward compatibility fields for database schema
  employee_name?: string;
  employee_nik?: string;
  direktorat?: string;
}

export interface QuestionItem {
  id: number;
  category: string;
  title: string;
  description?: string | null;
  type: 'scale' | 'text'; // scale = 1-10 rating, text = open feedback
}

export interface QuestionCategory {
  id: string;
  title: string;
  description: string;
  questions: QuestionItem[];
}

export type AnswersMap = Record<number, number>; // question_id -> score (1-10)

export interface SurveySubmissionData {
  demographics: EmployeeDemographics;
  answers: AnswersMap;
  openFeedback: string;
}

export interface SurveyResponseRecord {
  id: string;
  created_at: string;
  employee_name: string; // Stores Anonymous Respondent ID or Legacy Name
  employee_nik?: string; // Stores Level Jabatan (Manager, Asst. Manager, SPV, Staff)
  direktorat: string;    // Stores Level Jabatan or Unit
  divisi: string;
  department: string;
  masa_kerja?: string;
  lokasi_kerja?: string;
  overall_rating_avg: number;
  open_feedback?: string;
  answers?: {
    question_id: number;
    category: string;
    score: number;
  }[];
}


