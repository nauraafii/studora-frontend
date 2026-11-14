import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { agents, materials as sampleMaterials, notes as sampleNotes, quizzes as sampleQuizzes, studySessions as sampleSessions, tasks as sampleTasks } from "@/lib/mock-data";
import { dateAfterDays } from "@/lib/dates";
import type {
  Document,
  Note,
  NotificationPreferences,
  PrivacyPreferences,
  QuizAttempt,
  Quiz,
  StudySession,
  StudyNotification,
  StudyDraft,
  Task,
  WorkspacePreferences,
  WorkflowPreferences,
} from "@/lib/types";

type AppState = {
  materials: Document[];
  notes: Note[];
  quizzes: Quiz[];
  studySessions: StudySession[];
  samplePackLoaded: boolean;
  tasks: Task[];
  workflowPreferences: WorkflowPreferences;
  privacyPreferences: PrivacyPreferences;
  notificationPreferences: NotificationPreferences;
  notifications: StudyNotification[];
  readNotificationIds: string[];
  workspacePreferences: WorkspacePreferences;
  studyPlanApproved: boolean;
  studySessionTimes: Record<string, string>;
  completedStudySessionIds: string[];
  studyDrafts: StudyDraft[];
  quizAttempts: QuizAttempt[];
  toggleTask: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  loadSamplePack: () => void;
  removeSamplePack: () => void;
  addMaterial: (material: Document) => void;
  removeMaterial: (id: string) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  removeNote: (id: string) => void;
  addStudySession: (session: StudySession) => void;
  updateStudySession: (id: string, patch: Partial<StudySession>) => void;
  removeStudySession: (id: string) => void;
  setWorkflowPreference: <K extends keyof WorkflowPreferences>(key: K, value: WorkflowPreferences[K]) => void;
  setPrivacyPreference: <K extends keyof PrivacyPreferences>(key: K, value: PrivacyPreferences[K]) => void;
  setNotificationPreference: <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => void;
  setWorkspacePreference: <K extends keyof WorkspacePreferences>(key: K, value: WorkspacePreferences[K]) => void;
  setStudyPlanApproved: (approved: boolean) => void;
  setStudySessionTime: (id: string, time: string) => void;
  completeStudySession: (id: string) => void;
  saveStudyDraft: (draft: StudyDraft) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  markLocalNotificationsRead: (ids: string[]) => void;
  resetPrototypeData: () => void;
};

const defaultWorkflowPreferences: WorkflowPreferences = {
  requireApproval: true,
  onlyOwnMaterials: true,
  showAgentActivity: true,
  reviewPreference: "Tandai item yang meragukan",
};

const defaultPrivacyPreferences: PrivacyPreferences = {
  saveWorkflowHistory: true,
  shareAnonymousUsage: false,
};

const defaultNotificationPreferences: NotificationPreferences = {
  workflows: true,
  review: true,
  deadlines: true,
  studyReminders: false,
};

const defaultWorkspacePreferences = (): WorkspacePreferences => ({
  description: "Pahami konsep kunci dari materi yang dipilih.",
  selectedMaterialId: "",
  selectedGoal: "understand",
  selectedTemplate: "",
  selectedOutputs: ["Ringkasan"],
  enabledAgentIds: agents.filter((agent) => agent.enabled).map((agent) => agent.id),
});

function defaultData() {
  return {
    materials: [] as Document[],
    notes: [] as Note[],
    quizzes: [] as Quiz[],
    studySessions: [] as StudySession[],
    samplePackLoaded: false,
    tasks: [] as Task[],
    workflowPreferences: { ...defaultWorkflowPreferences },
    privacyPreferences: { ...defaultPrivacyPreferences },
    notificationPreferences: { ...defaultNotificationPreferences },
    notifications: [] as StudyNotification[],
    readNotificationIds: [] as string[],
    workspacePreferences: defaultWorkspacePreferences(),
    studyPlanApproved: false,
    studySessionTimes: {},
    completedStudySessionIds: [],
    studyDrafts: [],
    quizAttempts: [],
  };
}

export const useStudoraStore = create<AppState>()(persist((set) => ({
  ...defaultData(),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map((task) => task.id === id
      ? { ...task, status: task.status === "done" ? "open" : "done" }
      : task),
  })),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, patch) => set((state) => ({
    tasks: state.tasks.map((task) => {
      if (task.id !== id) return task;
      const updated = { ...task, ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "dueDate")) updated.dueInDays = undefined;
      return updated;
    }),
  })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
  loadSamplePack: () => set((state) => state.samplePackLoaded ? state : ({
    samplePackLoaded: true,
    materials: [...state.materials, ...sampleMaterials.map((item) => ({ ...item, origin: "sample" as const }))],
    notes: [...state.notes, ...sampleNotes.map((item) => ({ ...item, origin: "sample" as const }))],
    quizzes: [...state.quizzes, ...sampleQuizzes.map((item) => ({ ...item, origin: "sample" as const }))],
    studySessions: [...state.studySessions, ...sampleSessions.map((item) => ({ ...item, date: dateAfterDays(item.dayOffset), origin: "sample" as const }))],
    tasks: [...state.tasks, ...sampleTasks.map((item) => ({ ...item, dueDate: item.dueDate ?? (item.dueInDays === undefined ? null : dateAfterDays(item.dueInDays)), dueInDays: undefined, origin: "sample" as const }))],
  })),
  removeSamplePack: () => set((state) => ({
    samplePackLoaded: false,
    materials: state.materials.filter((item) => item.origin !== "sample"),
    notes: state.notes.filter((item) => item.origin !== "sample"),
    quizzes: state.quizzes.filter((item) => item.origin !== "sample"),
    studySessions: state.studySessions.filter((item) => item.origin !== "sample"),
    tasks: state.tasks.filter((item) => item.origin !== "sample"),
    studyDrafts: state.studyDrafts.filter((item) => !sampleMaterials.some((sample) => sample.id === item.materialId)),
    quizAttempts: state.quizAttempts.filter((item) => !sampleQuizzes.some((sample) => sample.id === item.quizId)),
    completedStudySessionIds: state.completedStudySessionIds.filter((id) => !sampleSessions.some((sample) => sample.id === id)),
    studyPlanApproved: false,
    workspacePreferences: sampleMaterials.some((sample) => sample.id === state.workspacePreferences.selectedMaterialId)
      ? { ...state.workspacePreferences, selectedMaterialId: "" } : state.workspacePreferences,
  })),
  addMaterial: (material) => set((state) => ({ materials: [material, ...state.materials] })),
  removeMaterial: (id) => set((state) => ({
    materials: state.materials.filter((item) => item.id !== id),
    studyDrafts: state.studyDrafts.filter((item) => item.materialId !== id),
    notes: state.notes.map((item) => item.materialId === id ? { ...item, materialId: undefined, source: "Materi dihapus" } : item),
    workspacePreferences: state.workspacePreferences.selectedMaterialId === id
      ? { ...state.workspacePreferences, selectedMaterialId: "" } : state.workspacePreferences,
  })),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, patch) => set((state) => ({ notes: state.notes.map((note) => note.id === id ? { ...note, ...patch } : note) })),
  removeNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
  addStudySession: (session) => set((state) => ({ studySessions: [session, ...state.studySessions], studyPlanApproved: false })),
  updateStudySession: (id, patch) => set((state) => ({ studySessions: state.studySessions.map((session) => session.id === id ? { ...session, ...patch } : session), studyPlanApproved: false })),
  removeStudySession: (id) => set((state) => ({ studySessions: state.studySessions.filter((session) => session.id !== id), completedStudySessionIds: state.completedStudySessionIds.filter((item) => item !== id), studyPlanApproved: false })),
  setWorkflowPreference: (key, value) => set((state) => ({
    workflowPreferences: { ...state.workflowPreferences, [key]: value },
  })),
  setPrivacyPreference: (key, value) => set((state) => ({
    privacyPreferences: { ...state.privacyPreferences, [key]: value },
  })),
  setNotificationPreference: (key, value) => set((state) => ({
    notificationPreferences: { ...state.notificationPreferences, [key]: value },
  })),
  setWorkspacePreference: (key, value) => set((state) => ({
    workspacePreferences: { ...state.workspacePreferences, [key]: value },
  })),
  setStudyPlanApproved: (approved) => set({ studyPlanApproved: approved }),
  setStudySessionTime: (id, time) => set((state) => ({
    studySessionTimes: { ...state.studySessionTimes, [id]: time },
  })),
  completeStudySession: (id) => set((state) => ({
    completedStudySessionIds: state.completedStudySessionIds.includes(id)
      ? state.completedStudySessionIds
      : [...state.completedStudySessionIds, id],
  })),
  saveStudyDraft: (draft) => set((state) => ({ studyDrafts: [draft, ...state.studyDrafts.filter((item) => item.id !== draft.id)] })),
  recordQuizAttempt: (attempt) => set((state) => ({ quizAttempts: [attempt, ...state.quizAttempts] })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((item) => item.id === id ? { ...item, unread: false } : item),
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((item) => ({ ...item, unread: false })),
  })),
  markLocalNotificationsRead: (ids) => set((state) => ({ readNotificationIds: [...new Set([...state.readNotificationIds, ...ids])] })),
  resetPrototypeData: () => set(defaultData()),
}), {
  name: "studora-app-state",
  version: 4,
  skipHydration: true,
  storage: createJSONStorage(() => localStorage),
  onRehydrateStorage: () => (_state, error) => {
    if (error && typeof window !== "undefined") window.dispatchEvent(new Event("studora-storage-error"));
  },
  migrate: (persistedState, version) => {
    const saved = (persistedState ?? {}) as Partial<AppState>;
    let upgraded: Partial<AppState> = version < 2 ? {
        ...saved,
        completedStudySessionIds: [],
        studyDrafts: [],
        quizAttempts: [],
        workspacePreferences: {
          ...defaultWorkspacePreferences(),
          ...saved.workspacePreferences,
          selectedGoal: saved.workspacePreferences?.selectedGoal ?? "understand",
        },
      } : saved;
    if (version < 3) {
      upgraded = {
        ...upgraded,
        materials: sampleMaterials.map((item) => ({ ...item, origin: "sample" as const })),
        notes: sampleNotes.map((item) => ({ ...item, origin: "sample" as const })),
        quizzes: sampleQuizzes.map((item) => ({ ...item, origin: "sample" as const })),
        studySessions: sampleSessions.map((item) => ({ ...item, origin: "sample" as const })),
        samplePackLoaded: true,
        tasks: (upgraded.tasks ?? []).map((item) => ({ ...item, origin: sampleTasks.some((sample) => sample.id === item.id) ? "sample" as const : "local" as const })),
        notifications: [],
        readNotificationIds: [],
      };
    }
    if (version < 4) {
      upgraded = {
        ...upgraded,
        tasks: (upgraded.tasks ?? []).map((task) => task.dueDate || task.dueInDays === undefined ? task : { ...task, dueDate: dateAfterDays(task.dueInDays), dueInDays: undefined }),
        studySessions: (upgraded.studySessions ?? []).map((session) => session.date ? session : { ...session, date: dateAfterDays(session.dayOffset) }),
      };
    }
    return upgraded;
  },
  partialize: (state) => ({
    materials: state.materials,
    notes: state.notes,
    quizzes: state.quizzes,
    studySessions: state.studySessions,
    samplePackLoaded: state.samplePackLoaded,
    tasks: state.tasks,
    workflowPreferences: state.workflowPreferences,
    privacyPreferences: state.privacyPreferences,
    notificationPreferences: state.notificationPreferences,
    notifications: state.notifications,
    readNotificationIds: state.readNotificationIds,
    workspacePreferences: state.workspacePreferences,
    studyPlanApproved: state.studyPlanApproved,
    studySessionTimes: state.studySessionTimes,
    completedStudySessionIds: state.completedStudySessionIds,
    studyDrafts: state.studyDrafts,
    quizAttempts: state.quizAttempts,
  }),
  merge: (persistedState, currentState) => {
    const saved = (persistedState ?? {}) as Partial<AppState>;
    return {
      ...currentState,
      ...saved,
      workflowPreferences: { ...currentState.workflowPreferences, ...saved.workflowPreferences },
      privacyPreferences: { ...currentState.privacyPreferences, ...saved.privacyPreferences },
      notificationPreferences: { ...currentState.notificationPreferences, ...saved.notificationPreferences },
      workspacePreferences: { ...currentState.workspacePreferences, ...saved.workspacePreferences },
    };
  },
}));
