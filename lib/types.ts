export type UserRole = "company" | "student";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  // Company-only
  companyName?: string;
  // Student-only
  branch?: string;
}

export type DriveStatus = "draft" | "open" | "closed";
export type QuestionSource = "auto" | "custom";
export type Difficulty = "easy" | "medium" | "hard";

export interface Drive {
  id: string;
  companyId: string;
  companyName?: string;
  title: string;
  role: string;
  requiredSkills: string[];
  questionSource: QuestionSource;
  questionMode?: "theoretical" | "applied";
  status: DriveStatus;
  candidateCount: number;
  avgScore: number | null;
  createdAt: string;
  uploadedQuestions?: Array<{ question: string; skill_tag: string }>;
}

export type SessionStatus = "not_started" | "in_progress" | "completed" | "suspended";

export interface InterviewSession {
  id: string;
  driveId: string;
  driveTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  status: SessionStatus;
  violationCount: number;
  overallScore: number | null;
  skillBreakdown?: Record<string, number>;
  completedAt?: string | null;
}
