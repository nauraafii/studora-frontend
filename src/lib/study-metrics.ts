export interface DatedStudySession {
  date: string;
  durationMinutes: number;
}

export interface WeeklyPlannedMinutesPoint {
  date: string;
  day: string;
  minutes: number;
}

const weekdayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  timeZone: "UTC",
});

export function getWeeklyPlannedMinutes(
  sessions: readonly DatedStudySession[],
  weekStartISO: string,
): WeeklyPlannedMinutesPoint[] {
  const [year, month, day] = weekStartISO.split("-").map(Number);
  const points = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(Date.UTC(year, month - 1, day + offset, 12));
    return {
      date: date.toISOString().slice(0, 10),
      day: weekdayFormatter.format(date),
      minutes: 0,
    };
  });
  const pointByDate = new Map(points.map((point) => [point.date, point]));

  for (const session of sessions) {
    const point = pointByDate.get(session.date);
    if (point && Number.isFinite(session.durationMinutes) && session.durationMinutes > 0) {
      point.minutes += session.durationMinutes;
    }
  }

  return points;
}
