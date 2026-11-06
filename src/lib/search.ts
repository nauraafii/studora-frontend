import type { Document, Note, Quiz } from "@/lib/types";

export interface GlobalSearchResult {
  title: string;
  description: string;
  category: "Materi" | "Catatan" | "Kuis";
  href: string;
}

export function searchStudora(query: string, data: { materials: Document[]; notes: Note[]; quizzes: Quiz[] }): GlobalSearchResult[] {
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  if (!normalized) return [];

  const searchUrl = encodeURIComponent(query.trim());
  return [
    ...data.materials
      .filter((item) => `${item.name} ${item.course} ${item.format}`.toLocaleLowerCase("id-ID").includes(normalized))
      .map((item) => ({ title: item.name, description: item.course, category: "Materi" as const, href: `/pustaka-materi?search=${searchUrl}` })),
    ...data.notes
      .filter((item) => `${item.title} ${item.source} ${item.kind}`.toLocaleLowerCase("id-ID").includes(normalized))
      .map((item) => ({ title: item.title, description: item.source, category: "Catatan" as const, href: `/catatan-ringkasan?search=${searchUrl}` })),
    ...data.quizzes
      .filter((item) => `${item.title} ${item.source}`.toLocaleLowerCase("id-ID").includes(normalized))
      .map((item) => ({ title: item.title, description: `${item.questions.length} soal · ${item.source}`, category: "Kuis" as const, href: `/kuis-latihan?search=${searchUrl}` })),
  ].slice(0, 8);
}
