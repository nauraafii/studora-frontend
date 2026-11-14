export interface User {
  id: string;
  name: string;
  email: string;
  university: string;
}

export interface Task {
  id: string;
  title: string;
  course: string;
  /** ISO date (YYYY-MM-DD), or null when the task has no deadline. */
  dueDate: string | null;
  /** Relative seed deadline for mock tasks; user-edited deadlines use dueDate. */
  dueInDays?: number;
  status: "open" | "done";
  priority: "low" | "medium" | "high";
  origin?: "sample" | "local";
}

export interface Note {
  id: string;
  title: string;
  source: string;
  kind: "Ringkasan" | "Catatan";
  tone: "blue" | "green";
  body: string;
  relatedQuizId: string;
  materialId?: string;
  origin?: "sample" | "local";
}

export type WorkspaceGoal = "understand" | "practice" | "schedule";

export interface StudyDraftOptions {
  summaryLength: "short" | "detailed";
  questionCount: 5 | 10 | 20;
  difficulty: "basic" | "intermediate" | "advanced";
  revisionDays: 3 | 7 | 14;
  minutesPerDay: 20 | 30 | 45;
}

export type NotificationKind = "workflow" | "task" | "study";

export interface StudyNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: NotificationKind;
  unread: boolean;
  actionLabel?: string;
  href?: string;
}

export interface WorkflowPreferences {
  requireApproval: boolean;
  onlyOwnMaterials: boolean;
  showAgentActivity: boolean;
  reviewPreference: string;
}

export interface PrivacyPreferences {
  saveWorkflowHistory: boolean;
  shareAnonymousUsage: boolean;
}

export interface NotificationPreferences {
  workflows: boolean;
  review: boolean;
  deadlines: boolean;
  studyReminders: boolean;
}

export interface WorkspacePreferences {
  description: string;
  selectedMaterialId: string;
  selectedGoal: WorkspaceGoal;
  selectedTemplate: string;
  selectedOutputs: string[];
  enabledAgentIds: string[];
}

export interface StudySession {
  id: string;
  dayOffset: number;
  startTime: string;
  durationMinutes: number;
  title: string;
  detail: string;
  type: "Revisi" | "Kuis";
  contentId: string;
  date?: string;
  origin?: "sample" | "local";
}

export interface Document {
  id: string;
  name: string;
  course: string;
  format: "PDF" | "DOCX" | "PPTX" | "TXT";
  sizeMb: number;
  addedAt: string;
  origin?: "sample" | "local";
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  source: string;
  linkedNoteId: string;
  questions: QuizQuestion[];
  origin?: "sample" | "local";
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  correctCount: number;
  questionCount: number;
  completedAt: string;
}

export interface StudyDraft {
  id: string;
  materialId: string;
  goal: WorkspaceGoal;
  outputs: string[];
  options?: StudyDraftOptions;
  prompt?: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  title: string;
  status: "completed" | "review" | "stopped";
  updatedAt: string;
  inputDocument: string;
  agentCount: number;
}
