"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight } from "lucide-react";
import { addDaysToISO, dateAfterDays, formatDuration, getTodayISO } from "@/lib/dates";
import { getWeeklyPlannedMinutes } from "@/lib/study-metrics";
import { useStudoraStore } from "@/lib/store";

export function WeeklyProgressChart() {
  const sessions = useStudoraStore((state) => state.studySessions);
  const completedIds = useStudoraStore((state) => state.completedStudySessionIds);
  const today = getTodayISO();
  const todayDay = new Date(`${today}T00:00:00.000Z`).getUTCDay();
  const weekStart = addDaysToISO(today, -((todayDay + 6) % 7));
  const weekEnd = addDaysToISO(weekStart, 6);
  const scheduledThisWeek = sessions
    .map((session) => ({
      id: session.id,
      date: session.date ?? dateAfterDays(session.dayOffset),
      durationMinutes: session.durationMinutes,
    }))
    .filter((session) => session.date >= weekStart && session.date <= weekEnd);
  const chartData = getWeeklyPlannedMinutes(scheduledThisWeek, weekStart);
  const totalMinutes = chartData.reduce((total, point) => total + point.minutes, 0);
  const completedThisWeek = scheduledThisWeek.filter((session) => completedIds.includes(session.id)).length;
  const completion = scheduledThisWeek.length
    ? Math.round((completedThisWeek / scheduledThisWeek.length) * 100)
    : 0;

  return (
    <section className="dashboard-progress" aria-labelledby="weekly-progress-title">
      <div className="dashboard-progress-heading">
        <div>
          <h2 id="weekly-progress-title">Progres belajar minggu ini</h2>
          <p>Durasi sesi belajar yang Anda jadwalkan per hari.</p>
        </div>
        {scheduledThisWeek.length ? (
          <div className="dashboard-completion" aria-label={`${completion}% sesi minggu ini ditandai selesai`}>
            <strong>{completion}%</strong>
            <span>{completedThisWeek} dari {scheduledThisWeek.length} sesi</span>
          </div>
        ) : null}
      </div>

      <div className="dashboard-planned-total">
        <strong>{formatDuration(totalMinutes)}</strong>
        <span>durasi terjadwal minggu ini</span>
      </div>

      {scheduledThisWeek.length ? (
        <div className="chart-wrap" role="img" aria-label="Grafik durasi sesi belajar yang dijadwalkan untuk setiap hari minggu ini">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} accessibilityLayer margin={{ top: 12, right: 6, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 4" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              />
              <YAxis hide allowDecimals={false} domain={[0, "dataMax + 20"]} />
              <Tooltip
                cursor={{ fill: "var(--chart-hover)" }}
                formatter={(value) => [formatDuration(Number(value)), "Durasi sesi"]}
                labelFormatter={(value) => `Hari ${String(value)}`}
                contentStyle={{
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  background: "var(--surface-raised)",
                  color: "var(--text)",
                  boxShadow: "var(--shadow-popover)",
                  fontSize: 12,
                }}
                itemStyle={{ color: "var(--text)" }}
                labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }}
              />
              <Bar dataKey="minutes" name="Durasi sesi" fill="var(--accent)" radius={[8, 8, 2, 2]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="dashboard-chart-empty">
          <strong>Belum ada sesi untuk minggu ini</strong>
          <p>Sesi yang Anda jadwalkan akan muncul di sini.</p>
          <Link className="text-link" href="/perencana-belajar">Atur rencana belajar<ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      )}

      {scheduledThisWeek.length ? (
        <div className="dashboard-chart-footnote">
          <span><i aria-hidden="true" />Batang menunjukkan durasi terjadwal, bukan waktu aktual.</span>
          <Link className="text-link" href="/perencana-belajar">Lihat rencana<ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
      ) : null}
    </section>
  );
}

export { WeeklyProgressChart as ProgressChart };
