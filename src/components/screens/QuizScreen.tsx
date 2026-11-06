"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudoraStore } from "@/lib/store";

export function QuizScreen() {
  const searchParams = useSearchParams();
  const requestedQuiz = searchParams.get("quiz");
  const sessionId = searchParams.get("session");
  const searchQuery = searchParams.get("search") ?? "";
  const quizzes = useStudoraStore((state) => state.quizzes);
  const notes = useStudoraStore((state) => state.notes);
  const sessions = useStudoraStore((state) => state.studySessions);
  const attempts = useStudoraStore((state) => state.quizAttempts);
  const recordAttempt = useStudoraStore((state) => state.recordQuizAttempt);
  const completeSession = useStudoraStore((state) => state.completeStudySession);
  const [query, setQuery] = useState(searchQuery);
  const [opened, setOpened] = useState<string | null>(requestedQuiz);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  useEffect(() => { setQuery(searchQuery); }, [searchQuery]);
  useEffect(() => { setOpened(requestedQuiz); setQuestionIndex(0); setAnswers({}); setChecked(false); setFinished(false); }, [requestedQuiz]);
  const filtered = useMemo(() => quizzes.filter((quiz) => `${quiz.title} ${quiz.source}`.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID"))), [quizzes, query]);
  const activeQuiz = quizzes.find((quiz) => quiz.id === opened);
  const question = activeQuiz?.questions[questionIndex];
  const selected = question ? answers[question.id] : undefined;
  const correctCount = activeQuiz?.questions.filter((item) => answers[item.id] === item.correctIndex).length ?? 0;
  const linkedNote = activeQuiz && notes.find((item) => item.id === activeQuiz.linkedNoteId);

  function open(id: string | null) {
    setOpened(id); setQuestionIndex(0); setAnswers({}); setChecked(false); setFinished(false);
  }
  function next() {
    if (!activeQuiz || !question || selected === undefined || !checked) return;
    if (questionIndex < activeQuiz.questions.length - 1) {
      setQuestionIndex((index) => index + 1); setChecked(false); return;
    }
    recordAttempt({
      id: `attempt-${crypto.randomUUID()}`, quizId: activeQuiz.id,
      score: Math.round(correctCount / activeQuiz.questions.length * 100),
      correctCount, questionCount: activeQuiz.questions.length, completedAt: new Date().toISOString(),
    });
    const linkedSession = sessions.find((session) => session.id === sessionId && session.contentId === activeQuiz.id);
    if (linkedSession) completeSession(linkedSession.id);
    setFinished(true);
  }

  return <main className="page-content">
    <PageHeading title="Kuis & Latihan" description="Uji pemahaman, lihat pembahasan, dan simpan hasil belajar di browser." />
    {activeQuiz ? <Card className="quiz-detail-card">
      <div className="quiz-detail-head"><Badge tone="blue">{activeQuiz.origin === "sample" ? "Paket contoh" : "Latihan"} · {activeQuiz.questions.length} soal</Badge><button type="button" className="text-link" onClick={() => open(null)}>Semua kuis</button></div>
      {finished ? <div className="quiz-result"><h2>Latihan selesai</h2><p className="quiz-result-score">{Math.round(correctCount / activeQuiz.questions.length * 100)}%</p><p>{correctCount} dari {activeQuiz.questions.length} jawaban benar. Hasil tersimpan di browser ini.</p><div className="note-modal-actions"><Button onClick={() => open(activeQuiz.id)}>Coba lagi</Button>{linkedNote ? <Link className="button button-secondary" href={`/catatan-ringkasan?note=${encodeURIComponent(linkedNote.id)}`}>Baca catatan sumber</Link> : null}</div></div> : question ? <div className="quiz-detail-content">
        <p className="muted">Soal {questionIndex + 1} dari {activeQuiz.questions.length} · {activeQuiz.title}</p>
        <h2 className="quiz-question-title">{question.prompt}</h2>
        <div className="option-list" role="group" aria-label="Pilihan jawaban">{question.options.map((option, index) => {
          const className = ["quiz-option", selected === index ? "is-selected" : "", checked && index === question.correctIndex ? "is-correct" : "", checked && selected === index && index !== question.correctIndex ? "is-incorrect" : ""].filter(Boolean).join(" ");
          return <button type="button" className={className} aria-pressed={selected === index} disabled={checked} onClick={() => setAnswers((current) => ({ ...current, [question.id]: index }))} key={option}><span className="option-letter">{String.fromCharCode(65 + index)}</span>{option}</button>;
        })}</div>
        {checked ? <div className={selected === question.correctIndex ? "notice notice-green" : "notice notice-amber"} role="status"><CheckCircle2 size={15} /><span>{selected === question.correctIndex ? "Benar. " : "Belum tepat. "}{question.explanation}</span></div> : null}
        <Button className="full-width" disabled={selected === undefined && !checked} onClick={checked ? next : () => setChecked(true)}>{checked ? questionIndex === activeQuiz.questions.length - 1 ? "Selesai dan simpan hasil" : "Soal berikutnya" : "Periksa jawaban"}</Button>
        {linkedNote ? <Link className="text-link quiz-source-link" href={`/catatan-ringkasan?note=${encodeURIComponent(linkedNote.id)}`}>Buka catatan sumber</Link> : null}
      </div> : null}
    </Card> : <>
      <div className="page-toolbar"><SearchInput value={query} onChange={setQuery} placeholder="Cari kuis" label="Cari kuis latihan" /></div>
      <div className="stack quiz-list">{filtered.map((quiz) => {
        const quizAttempts = attempts.filter((item) => item.quizId === quiz.id);
        const bestScore = quizAttempts.length ? Math.max(...quizAttempts.map((item) => item.score)) : null;
        return <Card className="quiz-row" key={quiz.id}><div className="list-main"><strong>{quiz.title}</strong><span>{quiz.questions.length} soal · {quiz.source}</span></div><Badge tone={quiz.origin === "sample" ? "blue" : "green"}>{quiz.origin === "sample" ? "Contoh" : "Pribadi"}</Badge>{bestScore !== null ? <Badge tone={bestScore >= 75 ? "green" : "amber"}>Terbaik {bestScore}%</Badge> : null}<Button onClick={() => open(quiz.id)}>Mulai kuis</Button></Card>;
      })}{filtered.length === 0 ? <EmptyState title={quizzes.length ? "Kuis tidak ditemukan" : "Belum ada kuis"} description={quizzes.length ? "Coba pencarian lain." : "Muat paket contoh dari Pustaka Materi untuk mencoba kuis. Kuis dari materi pribadi menunggu layanan AI."} /> : null}</div>
    </>}
  </main>;
}
