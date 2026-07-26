/*
import { useEffect, useMemo, useState } from "react";

type Schedule = {
  wake: string;
  breakfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  bedtime: string;
};

type EventKind = "wake" | "food" | "sleep";

type ClockEvent = {
  key: keyof Schedule;
  label: string;
  shortLabel: string;
  helper: string;
  icon: string;
  kind: EventKind;
  time: string;
  minutes: number;
  color: string;
  glow: string;
};

type Preset = {
  name: string;
  description: string;
  schedule: Schedule;
};

type MomentCard = {
  title: string;
  subtitle: string;
  chip: string;
  icon: string;
  color: string;
};

const STORAGE_KEY = "mat-sov-klocka-schema-v1";

const scheduleOrder: Array<keyof Schedule> = [
  "wake",
  "breakfast",
  "lunch",
  "snack",
  "dinner",
  "bedtime",
];

const defaultSchedule: Schedule = {
  wake: "07:00",
  breakfast: "07:30",
  lunch: "11:30",
  snack: "14:30",
  dinner: "17:30",
  bedtime: "20:00",
};

const presets: Preset[] = [
  {
    name: "Förskola",
    description: "Tidigt upp, lunch mitt på dagen och läggdags i lugn takt.",
    schedule: {
      wake: "06:45",
      breakfast: "07:15",
      lunch: "11:15",
      snack: "14:15",
      dinner: "17:00",
      bedtime: "19:30",
    },
  },
  {
    name: "Skoldag",
    description: "Jämn vardagsrutin med mellis efter skolan och kvällsro.",
    schedule: {
      wake: "07:00",
      breakfast: "07:30",
      lunch: "12:00",
      snack: "15:00",
      dinner: "18:00",
      bedtime: "20:30",
    },
  },
  {
    name: "Helg",
    description: "Lite senare morgon, längre kväll och gott om pauser.",
    schedule: {
      wake: "08:00",
      breakfast: "08:30",
      lunch: "12:30",
      snack: "15:30",
      dinner: "18:30",
      bedtime: "21:00",
    },
  },
];

const eventMeta: Record<keyof Schedule, Omit<ClockEvent, "key" | "time" | "minutes">> = {
  wake: {
    label: "Vakna",
    shortLabel: "Vakna",
    helper: "När dagen börjar.",
    icon: "☀️",
    kind: "wake",
    color: "#f59e0b",
    glow: "#fde68a",
  },
  breakfast: {
    label: "Frukost",
    shortLabel: "Frukost",
    helper: "Första målet på dagen.",
    icon: "🥣",
    kind: "food",
    color: "#fb7185",
    glow: "#fecdd3",
  },
  lunch: {
    label: "Lunch",
    shortLabel: "Lunch",
    helper: "Mitt på dagen-maten.",
    icon: "🍝",
    kind: "food",
    color: "#38bdf8",
    glow: "#bae6fd",
  },
  snack: {
    label: "Mellis",
    shortLabel: "Mellis",
    helper: "Litet stopp mellan lunch och middag.",
    icon: "🍎",
    kind: "food",
    color: "#a855f7",
    glow: "#e9d5ff",
  },
  dinner: {
    label: "Middag",
    shortLabel: "Middag",
    helper: "Kvällens större måltid.",
    icon: "🍽️",
    kind: "food",
    color: "#22c55e",
    glow: "#bbf7d0",
  },
  bedtime: {
    label: "Sovdags",
    shortLabel: "Sova",
    helper: "Dags att varva ner för natten.",
    icon: "😴",
    kind: "sleep",
    color: "#6366f1",
    glow: "#c7d2fe",
  },
};

const decorativeDots = [
  { top: "10%", left: "8%", size: 6, opacity: 0.35 },
  { top: "14%", left: "78%", size: 10, opacity: 0.25 },
  { top: "24%", left: "91%", size: 8, opacity: 0.2 },
  { top: "36%", left: "15%", size: 4, opacity: 0.3 },
  { top: "58%", left: "84%", size: 5, opacity: 0.28 },
  { top: "72%", left: "7%", size: 9, opacity: 0.18 },
  { top: "80%", left: "63%", size: 7, opacity: 0.32 },
  { top: "88%", left: "28%", size: 5, opacity: 0.25 },
];

const surfaceClass =
  "rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl";

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
}

function minutesUntil(current: number, target: number) {
  return (target - current + 1440) % 1440;
}

function minutesSince(current: number, target: number) {
  return (current - target + 1440) % 1440;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDuration(minutes: number) {
  const rounded = Math.max(0, Math.round(minutes));

  if (rounded < 60) {
    return `${rounded} min`;
  }

  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

function formatHourBlock(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getClockPosition(minutes: number, radius: number) {
  const angle = (minutes / 1440) * Math.PI * 2 - Math.PI / 2;

  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
  };
}

function isWithinWrappedInterval(current: number, start: number, end: number) {
  if (start === end) {
    return false;
  }

  if (start < end) {
    return current >= start && current < end;
  }

  return current >= start || current < end;
}

function buildEvents(schedule: Schedule): ClockEvent[] {
  return scheduleOrder
    .map((key) => ({
      key,
      ...eventMeta[key],
      time: schedule[key],
      minutes: timeToMinutes(schedule[key]),
    }))
    .sort((first, second) => first.minutes - second.minutes);
}

export default function App() {
  const [now, setNow] = useState(() => new Date());
  const [schedule, setSchedule] = useState<Schedule>(() => {
    if (typeof window === "undefined") {
      return defaultSchedule;
    }

    try {
      const savedSchedule = window.localStorage.getItem(STORAGE_KEY);

      if (!savedSchedule) {
        return defaultSchedule;
      }

      return {
        ...defaultSchedule,
        ...(JSON.parse(savedSchedule) as Partial<Schedule>),
      };
    } catch {
      return defaultSchedule;
    }
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  }, [schedule]);

  const events = useMemo(() => buildEvents(schedule), [schedule]);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentMinuteWithSeconds = currentMinutes + now.getSeconds() / 60;
  const currentRotation = (currentMinuteWithSeconds / 1440) * 360;
  const mealEvents = events.filter((event) => event.kind === "food");
  const wakeEvent = events.find((event) => event.key === "wake")!;
  const bedtimeEvent = events.find((event) => event.key === "bedtime")!;

  const nextEvent = events.reduce((closest, event) =>
    minutesUntil(currentMinutes, event.minutes) < minutesUntil(currentMinutes, closest.minutes)
      ? event
      : closest,
  );

  const previousMeal = mealEvents.reduce((closest, event) =>
    minutesSince(currentMinutes, event.minutes) < minutesSince(currentMinutes, closest.minutes)
      ? event
      : closest,
  );

  const nextMeal = mealEvents.reduce((closest, event) =>
    minutesUntil(currentMinutes, event.minutes) < minutesUntil(currentMinutes, closest.minutes)
      ? event
      : closest,
  );

  const timeUntilNextMeal = minutesUntil(currentMinutes, nextMeal.minutes);
  const timeSincePreviousMeal = minutesSince(currentMinutes, previousMeal.minutes);
  const foodSpan = Math.max(1, timeSincePreviousMeal + timeUntilNextMeal);
  const foodProgress = clamp(timeSincePreviousMeal / foodSpan, 0, 1);

  const isSleeping = isWithinWrappedInterval(currentMinutes, bedtimeEvent.minutes, wakeEvent.minutes);
  const restSince = isSleeping
    ? minutesSince(currentMinutes, bedtimeEvent.minutes)
    : minutesSince(currentMinutes, wakeEvent.minutes);
  const restUntil = isSleeping
    ? minutesUntil(currentMinutes, wakeEvent.minutes)
    : minutesUntil(currentMinutes, bedtimeEvent.minutes);
  const restSpan = Math.max(1, restSince + restUntil);
  const restProgress = clamp(restSince / restSpan, 0, 1);

  const recentEvent = events
    .map((event) => ({ event, since: minutesSince(currentMinutes, event.minutes) }))
    .filter(({ since }) => since <= 20)
    .sort((first, second) => first.since - second.since)[0];

  const upcomingSoon = events
    .map((event) => ({ event, until: minutesUntil(currentMinutes, event.minutes) }))
    .filter(({ until }) => until > 0 && until <= 20)
    .sort((first, second) => first.until - second.until)[0];

  const momentCard: MomentCard = (() => {
    if (recentEvent) {
      if (recentEvent.event.kind === "food") {
        return {
          title: "Matdags!",
          subtitle: `${recentEvent.event.label} är här nu. Ta en paus och fyll på energi i lugn och ro.`,
          chip: "Klockan ringer för mat",
          icon: recentEvent.event.icon,
          color: recentEvent.event.color,
        };
      }

      if (recentEvent.event.kind === "sleep") {
        return {
          title: "Sovdags!",
          subtitle: "Nu är det läge att varva ner, byta tempo och gå mot kvällsrutin.",
          chip: "Klockan säger vila",
          icon: recentEvent.event.icon,
          color: recentEvent.event.color,
        };
      }

      return {
        title: "God morgon!",
        subtitle: "Dagen har startat. Vakna mjukt och gör er redo för dagens första steg.",
        chip: "Dags att komma igång",
        icon: recentEvent.event.icon,
        color: recentEvent.event.color,
      };
    }

    if (upcomingSoon) {
      if (upcomingSoon.event.kind === "food") {
        return {
          title: `Snart ${upcomingSoon.event.label.toLowerCase()}`,
          subtitle: `${upcomingSoon.event.label} börjar om ${formatDuration(upcomingSoon.until)}.`,
          chip: "Nästa matstopp närmar sig",
          icon: upcomingSoon.event.icon,
          color: upcomingSoon.event.color,
        };
      }

      if (upcomingSoon.event.kind === "sleep") {
        return {
          title: "Kvällsro närmar sig",
          subtitle: `Det är ${formatDuration(upcomingSoon.until)} kvar till sovdags.`,
          chip: "Byt ner i varv",
          icon: upcomingSoon.event.icon,
          color: upcomingSoon.event.color,
        };
      }

      return {
        title: "Vakna snart",
        subtitle: `Det är ${formatDuration(upcomingSoon.until)} kvar tills dagen börjar.`,
        chip: "Ny dag på väg",
        icon: upcomingSoon.event.icon,
        color: upcomingSoon.event.color,
      };
    }

    if (isSleeping) {
      return {
        title: "Nattläge",
        subtitle: `Det är stilla nu. Nästa punkt är att vakna om ${formatDuration(restUntil)}.`,
        chip: "Sovklockan håller takten",
        icon: "🌙",
        color: bedtimeEvent.color,
      };
    }

    if (nextEvent.kind === "food") {
      return {
        title: "Lugn takt fram till nästa mål",
        subtitle: `${nextEvent.label} kommer om ${formatDuration(minutesUntil(currentMinutes, nextEvent.minutes))}.`,
        chip: "Matrytmen tickar vidare",
        icon: nextEvent.icon,
        color: nextEvent.color,
      };
    }

    return {
      title: "Dagen rullar på",
      subtitle: `${nextEvent.label} är nästa hållpunkt om ${formatDuration(minutesUntil(currentMinutes, nextEvent.minutes))}.`,
      chip: "Rutinen håller koll",
      icon: nextEvent.icon,
      color: nextEvent.color,
    };
  })();

  const upcomingEvents = [...events].sort(
    (first, second) =>
      minutesUntil(currentMinutes, first.minutes) - minutesUntil(currentMinutes, second.minutes),
  );

  const timeText = now.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateText = capitalize(
    new Intl.DateTimeFormat("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now),
  );

  const updateTime = (key: keyof Schedule, value: string) => {
    setSchedule((currentSchedule) => ({
      ...currentSchedule,
      [key]: value,
    }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {page !== "settings" ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-fuchsia-500/12 blur-3xl" />
          <div className="absolute right-[-6rem] top-[30%] h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[-4rem] h-[24rem] w-[24rem] rounded-full bg-emerald-400/10 blur-3xl" />
          {decorativeDots.map((dot, index) => (
            <span
              key={index}
              className="absolute rounded-full bg-white"
              style={{
                top: dot.top,
                left: dot.left,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                opacity: dot.opacity,
              }}
            />
          ))}
        </div>
      ) : null}

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className={`${surfaceClass} overflow-hidden`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                Mat • Sömn • Dagsrytm
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Mat- &amp; sovklockan
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  En barnvänlig dagklocka som visar när det snart är dags att äta, vila och sova.
                  Tiderna kan justeras och sparas automatiskt i webbläsaren.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Nu</p>
                <p className="mt-2 text-3xl font-bold text-white">{timeText}</p>
                <p className="mt-1 text-sm text-slate-300">{dateText}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {isSleeping ? "🌙 Sovtid pågår" : "☀️ Dagen är igång"}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Nästa punkt: {nextEvent.label.toLowerCase()} {nextEvent.time}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div
          className={`grid gap-6 ${
            page === "schedule" ? "xl:grid-cols-[1.15fr_0.85fr]" : "xl:grid-cols-1"
          }`}
        >
          {page === "clock" ? (
            <section className={`${surfaceClass} flex flex-col gap-6 overflow-hidden`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Dygnsöversikt</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Rutinen just nu</h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
                <span className="text-lg">{isSleeping ? "🌙" : "✨"}</span>
                <span>{isSleeping ? "Lugn nattfas" : "Aktiv dagfas"}</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr] lg:items-center">
              <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
                <div className="absolute inset-0 rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.65)_0%,rgba(15,23,42,0.92)_58%,rgba(2,6,23,1)_100%)] shadow-[0_40px_100px_-45px_rgba(15,23,42,0.9)]" />
                <div className="absolute inset-[8%] rounded-full border border-white/10" />
                <div className="absolute inset-[16%] rounded-full border border-white/6" />

                {Array.from({ length: 24 }).map((_, index) => (
                  <span
                    key={index}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/22"
                    style={{
                      ...getClockPosition(index * 60, 46),
                      width: index % 6 === 0 ? "7px" : "4px",
                      height: index % 6 === 0 ? "7px" : "4px",
                    }}
                  />
                ))}

                {[0, 360, 720, 1080].map((minute) => (
                  <span
                    key={minute}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.2em] text-slate-400"
                    style={getClockPosition(minute, 33)}
                  >
                    {formatHourBlock(minute)}
                  </span>
                ))}

                <div className="absolute inset-0">
                  <div
                    className="absolute left-1/2 top-1/2 h-[34%] w-[3px] origin-bottom"
                    style={{ transform: `translate(-50%, -100%) rotate(${currentRotation}deg)` }}
                  >
                    <div className="h-full w-full rounded-full bg-gradient-to-t from-fuchsia-500 via-pink-300 to-amber-200 shadow-[0_0_30px_rgba(244,114,182,0.45)]" />
                  </div>

                  <span
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-slate-950 bg-white shadow-[0_0_30px_rgba(255,255,255,0.55)]"
                    style={{
                      ...getClockPosition(currentMinuteWithSeconds, 34),
                      width: "16px",
                      height: "16px",
                    }}
                  />
                </div>

                {events.map((event) => {
                  const isHighlighted =
                    Math.min(
                      minutesUntil(currentMinutes, event.minutes),
                      minutesSince(currentMinutes, event.minutes),
                    ) <= 20;

                  return (
                    <div
                      key={event.key}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={getClockPosition(event.minutes, 40)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 text-xl shadow-lg transition-transform duration-300 ${
                            isHighlighted ? "scale-110" : "scale-100"
                          }`}
                          style={{
                            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), ${event.color})`,
                            boxShadow: isHighlighted
                              ? `0 0 0 6px ${event.glow}33, 0 18px 40px -18px ${event.color}`
                              : `0 16px 34px -22px ${event.color}`,
                          }}
                        >
                          {event.icon}
                        </div>
                        <div className="hidden max-w-[5.5rem] sm:block">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-200">
                            {event.shortLabel}
                          </p>
                          <p className="text-[0.72rem] text-slate-400">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/75 text-center shadow-inner shadow-black/35 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Nu</p>
                  <p className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {timeText.slice(0, 5)}
                  </p>
                  <p className="mt-2 max-w-[12rem] text-sm leading-relaxed text-slate-300">
                    {isSleeping ? "Sovklockan är aktiv" : `Nästa stopp: ${nextEvent.label.toLowerCase()}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div
                  className="rounded-[1.75rem] border border-white/10 p-5 text-white shadow-2xl shadow-slate-950/30"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${momentCard.color}38 0%, rgba(15,23,42,0.88) 58%, rgba(2,6,23,0.96) 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                        {momentCard.chip}
                      </span>
                      <div>
                        <h3 className="text-3xl font-black tracking-tight sm:text-4xl">{momentCard.title}</h3>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-200/85 sm:text-base">
                          {momentCard.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-4xl shadow-lg shadow-black/20">
                      {momentCard.icon}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Matklockan</p>
                        <p className="text-sm text-slate-400">Nästa mål: {nextMeal.label.toLowerCase()}</p>
                      </div>
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400"
                        style={{ width: `${foodProgress * 100}%` }}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                      <span>Senast: {previousMeal.label.toLowerCase()}</span>
                      <span>Om {formatDuration(timeUntilNextMeal)}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      Det har gått {formatDuration(timeSincePreviousMeal)} sedan {previousMeal.label.toLowerCase()}.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Sovklockan</p>
                        <p className="text-sm text-slate-400">
                          {isSleeping ? "Nästa skifte: vakna" : "Nästa skifte: sovdags"}
                        </p>
                      </div>
                      <span className="text-2xl">{isSleeping ? "🌙" : "🛌"}</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-300 via-indigo-400 to-fuchsia-400"
                        style={{ width: `${restProgress * 100}%` }}
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                      <span>{isSleeping ? "Sovtid pågår" : "Vaken tid pågår"}</span>
                      <span>Om {formatDuration(restUntil)}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {isSleeping
                        ? `Det har gått ${formatDuration(restSince)} sedan sovdags.`
                        : `Det har gått ${formatDuration(restSince)} sedan ni vaknade.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </section>
          ) : (
            <section className={`${surfaceClass} space-y-4`}>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Schemaöversikt</p>
              <h2 className="text-2xl font-bold text-white">Veckoscheman</h2>
              <p className="text-sm text-slate-300">
                Välj vilka dagar som ska ha eget schema. Klockan använder automatiskt närmaste tidigare dag med schema.
              </p>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
                Idag: <span className="font-semibold">{DAY_NAMES[currentDay]}</span> ·
                Aktivt schema: <span className="font-semibold">{DAY_NAMES[effectiveDay]}</span>
              </div>
            </section>
          )}

          {page === "schedule" ? (
            <aside className="flex flex-col gap-6">
            <section className={`${surfaceClass} space-y-4`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">På gång</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Nästa hållpunkter</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
                  {nextEvent.time}
                </div>
              </div>

              <div className="space-y-3">
                {upcomingEvents.map((event, index) => {
                  const until = minutesUntil(currentMinutes, event.minutes);
                  const isActive = index === 0;

                  return (
                    <div
                      key={`${event.key}-${event.time}`}
                      className={`rounded-3xl border p-4 transition-colors duration-300 ${
                        isActive
                          ? "border-white/15 bg-white/8"
                          : "border-white/8 bg-slate-950/35"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${event.color}, ${event.glow})`,
                            }}
                          >
                            {event.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{event.label}</p>
                            <p className="text-sm text-slate-400">{event.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-100">
                            {until === 0 ? "Nu" : `Om ${formatDuration(until)}`}
                          </p>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {event.kind === "food"
                              ? "Mat"
                              : event.kind === "sleep"
                                ? "Sömn"
                                : "Start"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={`${surfaceClass} space-y-4`}>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Så funkar den</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Läs av klockan snabbt</h2>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                  <span className="text-xl">🍽️</span>
                  <p>Matpunkterna lyser upp när det börjar närma sig frukost, lunch, mellis eller middag.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                  <span className="text-xl">😴</span>
                  <p>Sovpunkten visar när det är dags att växla ner för kvällen och gå mot nattläge.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                  <span className="text-xl">🕒</span>
                  <p>Den långa visaren följer dygnet hela tiden, så det går lätt att se var ni befinner er just nu.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-300/10 bg-emerald-400/8 p-4 text-sm leading-relaxed text-emerald-100/90">
                Tips: justera tiderna nedan tills klockan matchar er vardag. Allt sparas automatiskt i den här enheten.
              </div>
            </section>
            </aside>
          ) : null}
        </div>

        <section className={`${surfaceClass} space-y-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Inställningar</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Ställ in dagens tider</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Anpassa klockan till er egen vardag. Du kan skriva in tiderna själv eller välja ett snabbval.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSchedule(defaultSchedule)}
              className="inline-flex w-fit items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
            >
              Återställ standardtider
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scheduleOrder.map((key) => {
              const meta = eventMeta[key];

              return (
                <label
                  key={key}
                  className="rounded-[1.75rem] border border-white/10 bg-slate-950/38 p-5 transition hover:border-white/15 hover:bg-slate-950/48"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-lg shadow-black/15"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${meta.color}, ${meta.glow})`,
                        }}
                      >
                        {meta.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{meta.label}</p>
                        <p className="text-sm text-slate-400">{meta.helper}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {meta.kind === "food" ? "Mat" : meta.kind === "sleep" ? "Sömn" : "Start"}
                    </span>
                  </div>

                  <input
                    aria-label={meta.label}
                    type="time"
                    value={schedule[key]}
                    onChange={(event) => updateTime(key, event.target.value)}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25"
                  />
                </label>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Snabbval</h3>
                <p className="text-sm text-slate-400">Fyll i ett färdigt upplägg med ett tryck.</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSchedule(preset.schedule)}
                  className="rounded-[1.75rem] border border-white/10 bg-slate-950/38 p-5 text-left transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-slate-950/48"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-white">{preset.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">{preset.description}</p>
                    </div>
                    <span className="text-2xl text-slate-300">→</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">☀️ {preset.schedule.wake}</span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">🍽️ {preset.schedule.lunch}</span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">😴 {preset.schedule.bedtime}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="px-1 pb-2 text-center text-sm text-slate-500">
          Inspirerad av idén om en mat- och sovklocka: enkel, tydlig och lugn att läsa av under hela dagen.
        </footer>
      </main>
    </div>
  );
}
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  apiCreateEvent,
  apiDeleteEvent,
  apiGetEvents,
  apiLogin,
  apiMe,
  apiResetEvents,
  apiSignup,
  apiUpdateEvent,
  type ApiEvent,
  type ApiUser,
} from "./api";
import SettingsPage, { type UserSettings } from "./SettingsPage";

type AuthMode = "login" | "signup";

const TOKEN_KEY = "mosk-auth-token";

const surfaceClass =
  "rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl";

const decorativeDots = [
  { top: "10%", left: "8%", size: 6, opacity: 0.35 },
  { top: "14%", left: "78%", size: 10, opacity: 0.25 },
  { top: "24%", left: "91%", size: 8, opacity: 0.2 },
  { top: "36%", left: "15%", size: 4, opacity: 0.3 },
  { top: "58%", left: "84%", size: 5, opacity: 0.28 },
  { top: "72%", left: "7%", size: 9, opacity: 0.18 },
  { top: "80%", left: "63%", size: 7, opacity: 0.32 },
  { top: "88%", left: "28%", size: 5, opacity: 0.25 },
];

const palette = [
  { color: "#f59e0b", glow: "#fde68a" },
  { color: "#fb7185", glow: "#fecdd3" },
  { color: "#38bdf8", glow: "#bae6fd" },
  { color: "#a855f7", glow: "#e9d5ff" },
  { color: "#22c55e", glow: "#bbf7d0" },
  { color: "#6366f1", glow: "#c7d2fe" },
];

const EVENT_TYPE_OPTIONS = [
  { value: "wake", label: "Vakna", icon: "☀️" },
  { value: "sleep", label: "Sova", icon: "😴" },
  { value: "nap", label: "Vila", icon: "🛌" },
  { value: "food", label: "Mat", icon: "🍽️" },
  { value: "mellis", label: "Mellis", icon: "🍎" },
  { value: "coffee", label: "Kaffe", icon: "☕" },
  { value: "other", label: "Annat", icon: "🕒" },
] as const;

type EventType = (typeof EVENT_TYPE_OPTIONS)[number]["value"];
type AppPage = "clock" | "schedule" | "settings";
const DAY_NAMES = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
];

/** Minutes before next event to show a browser notification (when enabled). */
const EVENT_REMINDER_LEAD_MINUTES = 15;

function normalizeTimeInput(value: string) {
  const trimmed = value.trim();

  let hours: number | null = null;
  let minutes: number | null = null;

  const compact = /^(\d{4})$/.exec(trimmed);
  if (compact) {
    hours = Number(compact[1].slice(0, 2));
    minutes = Number(compact[1].slice(2, 4));
  } else {
    const separated = /^(\d{1,2})[:.](\d{2})$/.exec(trimmed);
    if (separated) {
      hours = Number(separated[1]);
      minutes = Number(separated[2]);
    }
  }

  if (hours == null || minutes == null) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function timeToMinutes(value: string) {
  const normalized = normalizeTimeInput(value);
  if (!normalized) return null;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(normalized);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(minutes: number) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function minutesTo12hNoSuffix(minutes: number) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(m / 60);
  const mins = m % 60;
  const hours12Raw = hours24 % 12;
  const hours12 = hours12Raw === 0 ? 12 : hours12Raw;
  return `${pad2(hours12)}:${pad2(mins)}`;
}

function minutesTo12hWithSuffix(minutes: number) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(m / 60);
  const mins = m % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12Raw = hours24 % 12;
  const hours12 = hours12Raw === 0 ? 12 : hours12Raw;
  return `${pad2(hours12)}:${pad2(mins)} ${suffix}`;
}

function formatNowTime(now: Date, timeFormat24: boolean) {
  const seconds = pad2(now.getSeconds());
  const minutes = pad2(now.getMinutes());
  const hours24 = now.getHours();
  if (timeFormat24) {
    return `${pad2(hours24)}:${minutes}:${seconds}`;
  }
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12Raw = hours24 % 12;
  const hours12 = hours12Raw === 0 ? 12 : hours12Raw;
  return `${pad2(hours12)}:${minutes}:${seconds} ${suffix}`;
}

function formatNowDialTime(now: Date, timeFormat24: boolean) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return timeFormat24 ? minutesToTime(minutes) : minutesTo12hNoSuffix(minutes);
}

function formatNowDialSuffix(now: Date, timeFormat24: boolean) {
  if (timeFormat24) return null;
  return now.getHours() >= 12 ? "PM" : "AM";
}

function formatMinutesForSmall(minutes: number, timeFormat24: boolean) {
  return timeFormat24 ? minutesToTime(minutes) : minutesTo12hWithSuffix(minutes);
}

function formatClockHourLabel(minute: number, timeFormat24: boolean) {
  if (timeFormat24) return minutesToTime(minute).slice(0, 2);
  const m = ((minute % 1440) + 1440) % 1440;
  const hours24 = Math.floor(m / 60);
  const hours12Raw = hours24 % 12;
  const hours12 = hours12Raw === 0 ? 12 : hours12Raw;
  return String(hours12);
}

function Time24Input({
  value,
  onChange,
  onBlur,
  disabled,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}) {
  const baseClass =
    "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25";

  return (
    <input
      className={baseClass}
      value={value}
      onChange={(ev) => onChange(ev.target.value)}
      onBlur={onBlur}
      placeholder="HH:MM, HHMM, HH.MM"
      inputMode="numeric"
      pattern="^([01]?\\d|2[0-3])([:.]?)([0-5]\\d)$"
      disabled={disabled}
      aria-label="Tid i 24h format"
    />
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getClockPosition(minutes: number, radius: number) {
  const angle = (minutes / 1440) * Math.PI * 2 - Math.PI / 2;
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
  };
}

function minutesUntil(current: number, target: number) {
  return (target - current + 1440) % 1440;
}

function minutesSince(current: number, target: number) {
  return (current - target + 1440) % 1440;
}

function formatDuration(minutes: number) {
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;
  if (remainingMinutes === 0) return `${hours} h`;
  return `${hours} h ${remainingMinutes} min`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function eventIcon(type: string, index: number) {
  const found = EVENT_TYPE_OPTIONS.find((x) => x.value === type);
  if (found) return found.icon;
  return ["⏰", "🕒", "📌", "✨", "⚡", "🎯"][index % 6];
}

export default function App() {
  const [now, setNow] = useState(() => new Date());

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<ApiUser | null>(null);
  const [events, setEvents] = useState<ApiEvent[]>([]);

  const SETTINGS_KEY_PREFIX = "mosk-settings-v1";
  const DEFAULT_SETTINGS: UserSettings = {
    displayName: "",
    age: null,
    timeFormat24: true,
    browserNotificationsEnabled: false,
    skalmanModeEnabled: false,
  };
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [refreshNonce, setRefreshNonce] = useState(0);

  const [addName, setAddName] = useState("");
  const [addTime, setAddTime] = useState("12:00");
  const [addType, setAddType] = useState<EventType>("other");
  const [selectedDay, setSelectedDay] = useState<number>(
    () => (new Date().getDay() + 6) % 7,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const [openEventIds, setOpenEventIds] = useState<Record<string, boolean>>({});
  const eventReminderPrevUntilRef = useRef<number | null>(null);
  const eventReminderEventIdRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const page: AppPage =
    location.pathname === "/settings"
      ? "settings"
      : location.pathname === "/schedule"
        ? "schedule"
        : "clock";

  useEffect(() => {
    if (location.pathname !== "/schedule") return;
    setSelectedDay((new Date().getDay() + 6) % 7);
  }, [location.pathname]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const me = await apiMe(token);
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setEvents([]);
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch {
            // ignore
          }
        }
      }
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function loadEvents() {
      if (!token) return;
      try {
        const data = await apiGetEvents(token);
        if (!cancelled) setEvents(data);
      } catch {
        // If auth is bad, apiMe effect will clear token.
      }
    }
    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, [token, refreshNonce]);

  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    const key = `${SETTINGS_KEY_PREFIX}:${user.id}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<UserSettings>;
      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
        displayName: typeof parsed.displayName === "string" ? parsed.displayName : "",
        age:
          parsed.age == null
            ? null
            : typeof parsed.age === "number" && Number.isFinite(parsed.age)
              ? parsed.age
              : null,
        timeFormat24: typeof parsed.timeFormat24 === "boolean" ? parsed.timeFormat24 : true,
        browserNotificationsEnabled:
          typeof parsed.browserNotificationsEnabled === "boolean"
            ? parsed.browserNotificationsEnabled
            : false,
        skalmanModeEnabled:
          typeof parsed.skalmanModeEnabled === "boolean" ? parsed.skalmanModeEnabled : false,
      });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [user]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  /** Monday=0 … Sunday=6 (matches `DAY_NAMES` and API `dayOfWeek`) */
  const currentDay = (now.getDay() + 6) % 7;

  const eventsByDay = useMemo(() => {
    const map = new Map<number, ApiEvent[]>();
    for (const event of events) {
      const existing = map.get(event.dayOfWeek) ?? [];
      existing.push(event);
      map.set(event.dayOfWeek, existing);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.timeMinutes - b.timeMinutes);
    }
    return map;
  }, [events]);

  const effectiveDay = useMemo(() => {
    for (let step = 0; step < 7; step += 1) {
      const day = (currentDay - step + 7) % 7;
      if ((eventsByDay.get(day) ?? []).length > 0) {
        return day;
      }
    }
    return currentDay;
  }, [currentDay, eventsByDay]);

  const sortedEvents = eventsByDay.get(effectiveDay) ?? [];
  const editableEvents = eventsByDay.get(selectedDay) ?? [];

  const currentMinuteWithSeconds = currentMinutes + now.getSeconds() / 60;
  const currentRotation = (currentMinuteWithSeconds / 1440) * 360;

  const nextEvent = useMemo(() => {
    if (!sortedEvents.length) return null;
    return sortedEvents.reduce((closest, e) =>
      minutesUntil(currentMinutes, e.timeMinutes) <
      minutesUntil(currentMinutes, closest.timeMinutes)
        ? e
        : closest,
    );
  }, [sortedEvents, currentMinutes]);

  const previousEvent = useMemo(() => {
    if (!sortedEvents.length) return null;
    return sortedEvents.reduce((closest, e) =>
      minutesSince(currentMinutes, e.timeMinutes) <
      minutesSince(currentMinutes, closest.timeMinutes)
        ? e
        : closest,
    );
  }, [sortedEvents, currentMinutes]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!settings.browserNotificationsEnabled) return;
    if (Notification.permission !== "granted") return;
    if (!nextEvent) {
      eventReminderPrevUntilRef.current = null;
      eventReminderEventIdRef.current = null;
      return;
    }

    if (eventReminderEventIdRef.current !== nextEvent.id) {
      eventReminderPrevUntilRef.current = null;
      eventReminderEventIdRef.current = nextEvent.id;
    }

    const until = minutesUntil(currentMinutes, nextEvent.timeMinutes);
    if (until <= 0) {
      eventReminderPrevUntilRef.current = until;
      return;
    }

    const prev = eventReminderPrevUntilRef.current;
    eventReminderPrevUntilRef.current = until;

    if (
      prev !== null &&
      prev > EVENT_REMINDER_LEAD_MINUTES &&
      until <= EVENT_REMINDER_LEAD_MINUTES
    ) {
      const timeLabel = formatMinutesForSmall(
        nextEvent.timeMinutes,
        settings.timeFormat24,
      );
      try {
        new Notification("MOSK", {
          body: `${nextEvent.name} börjar om ca ${EVENT_REMINDER_LEAD_MINUTES} minuter (${timeLabel}).`,
          tag: `mosk-reminder-${nextEvent.id}-${effectiveDay}`,
        });
      } catch {
        // ignore
      }
    }
  }, [
    currentMinutes,
    effectiveDay,
    nextEvent,
    settings.browserNotificationsEnabled,
    settings.timeFormat24,
  ]);

  const intervalProgress = useMemo(() => {
    if (!previousEvent || !nextEvent) return null;
    const elapsed = minutesSince(currentMinutes, previousEvent.timeMinutes);
    const remaining = minutesUntil(currentMinutes, nextEvent.timeMinutes);
    const span = Math.max(1, elapsed + remaining);
    return clamp(elapsed / span, 0, 1);
  }, [previousEvent, nextEvent, currentMinutes]);

  const timeText = formatNowTime(now, settings.timeFormat24);
  const timeDialText = formatNowDialTime(now, settings.timeFormat24);
  const timeDialSuffix = formatNowDialSuffix(now, settings.timeFormat24);
  const clockHourMarkers = settings.timeFormat24 ? [0, 360, 720, 1080] : [0, 180, 360, 540];

  const dateText = capitalize(
    new Intl.DateTimeFormat("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(now),
  );

  const highlightDist = 20;

  const isHighlighted = (event: ApiEvent) => {
    const dist = Math.min(
      minutesUntil(currentMinutes, event.timeMinutes),
      minutesSince(currentMinutes, event.timeMinutes),
    );
    return dist <= highlightDist;
  };

  function saveToken(nextToken: string) {
    setToken(nextToken);
    try {
      localStorage.setItem(TOKEN_KEY, nextToken);
    } catch {
      // ignore
    }
  }

  async function handleAuthSubmitFixed() {
    setAuthError(null);
    setBusy(true);
    try {
      if (authMode === "signup") {
        const res = await apiSignup({ username, password });
        saveToken(res.token);
      } else {
        const res = await apiLogin({ username, password });
        saveToken(res.token);
      }
      setRefreshNonce((x) => x + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Auth failed";
      setAuthError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function refreshEvents() {
    setRefreshNonce((x) => x + 1);
  }

  async function handleAddEvent() {
    setAuthError(null);
    if (!token) return;
    if (!addName.trim()) return;
    setBusy(true);
    try {
      const normalizedTime = normalizeTimeInput(addTime);
      if (!normalizedTime) throw new Error("Invalid time");
      const timeMinutes = timeToMinutes(normalizedTime);
      if (timeMinutes == null) throw new Error("Invalid time");
      await apiCreateEvent(token, {
        dayOfWeek: selectedDay,
        name: addName.trim(),
        type: addType,
        time: normalizedTime,
      });
      setAddName("");
      setAddType("other");
      setAddTime("12:00");
      await refreshEvents();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add event";
      setAuthError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateName(id: string, nextName: string) {
    if (!token) return;
    setBusy(true);
    try {
      await apiUpdateEvent(token, { id, patch: { name: nextName } });
      await refreshEvents();
    } catch (err) {
      // revert by reloading
      await refreshEvents();
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateTime(id: string, nextTime: string) {
    if (!token) return;
    const normalizedTime = normalizeTimeInput(nextTime);
    if (!normalizedTime) return;
    const timeMinutes = timeToMinutes(normalizedTime);
    if (timeMinutes == null) return;
    setEvents((curr) =>
      curr.map((e) =>
        e.id === id ? { ...e, time: normalizedTime, timeMinutes } : e,
      ),
    );
    setBusy(true);
    try {
      await apiUpdateEvent(token, { id, patch: { time: normalizedTime } });
      await refreshEvents();
    } catch {
      await refreshEvents();
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!token) return;
    setBusy(true);
    try {
      await apiDeleteEvent(token, id);
      await refreshEvents();
    } catch {
      await refreshEvents();
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateType(id: string, type: EventType) {
    if (!token) return;
    setEvents((curr) => curr.map((e) => (e.id === id ? { ...e, type } : e)));
    setBusy(true);
    try {
      await apiUpdateEvent(token, { id, patch: { type } });
      await refreshEvents();
    } catch {
      await refreshEvents();
    } finally {
      setBusy(false);
    }
  }

  async function handleResetDefaults() {
    if (!token) return;
    setBusy(true);
    try {
      await apiResetEvents(token, selectedDay);
      await refreshEvents();
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSettings(next: UserSettings) {
    if (!user) return;
    setSettings(next);
    const key = `${SETTINGS_KEY_PREFIX}:${user.id}`;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  if (!token || !user) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {decorativeDots.map((dot, index) => (
            <span
              key={index}
              className="absolute rounded-full bg-white"
              style={{
                top: dot.top,
                left: dot.left,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                opacity: dot.opacity,
              }}
            />
          ))}
        </div>

        <main className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
          <header className={`${surfaceClass}`}>
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Mat- & sovklockan
                </h1>
                <p className="text-sm text-slate-300">
                  Logga in för att läsa och spara tider i Postgres.
                </p>
              </div>
              <div className="text-right text-xs uppercase tracking-[0.22em] text-slate-400">
                Multi-user
              </div>
            </div>
          </header>

          <section className={`${surfaceClass} space-y-4`}>
            <div className="flex gap-3">
              <button
                type="button"
                className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  authMode === "login"
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
                onClick={() => setAuthMode("login")}
                disabled={busy}
              >
                Logga in
              </button>
              <button
                type="button"
                className={`flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  authMode === "signup"
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
                onClick={() => setAuthMode("signup")}
                disabled={busy}
              >
                Skapa konto
              </button>
            </div>

            {authError ? (
              <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
                {authError}
              </div>
            ) : null}

            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void handleAuthSubmitFixed();
              }}
            >
              <label className="space-y-1">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Användarnamn
                </div>
                <input
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={busy}
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Lösenord
                </div>
                <input
                  required
                  type="password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-lg font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  disabled={busy}
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12 disabled:opacity-60"
                disabled={busy}
              >
                {authMode === "signup" ? "Skapa konto" : "Logga in"}
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  const next = nextEvent;
  const prev = previousEvent;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-fuchsia-500/12 blur-3xl" />
        <div className="absolute right-[-6rem] top-[30%] h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[-4rem] h-[24rem] w-[24rem] rounded-full bg-emerald-400/10 blur-3xl" />
        {decorativeDots.map((dot, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white"
            style={{
              top: dot.top,
              left: dot.left,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              opacity: dot.opacity,
            }}
          />
        ))}
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className={`${surfaceClass} overflow-hidden`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                Mat • Sömn • Dagsrytm
              </span>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Mat- &amp; sovklockan
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                En barnvänlig dagklocka som visar när det är dags att äta och vila.
                Tiderna sparas per användare.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/clock")}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    page === "clock"
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  Klocka
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/schedule")}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    page === "schedule"
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  Scheman
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/settings")}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    page === "settings"
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  Inställningar
                </button>
              </div>
            </div>

            {page !== "settings" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
                <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Nu</p>
                  <p className="mt-2 text-3xl font-bold text-white">{timeText}</p>
                  <p className="mt-1 text-sm text-slate-300">{dateText}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {next ? "Nästa hållpunkt" : "Laddar…"}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {next
                      ? `${next.name} ${formatMinutesForSmall(
                          next.timeMinutes,
                          settings.timeFormat24,
                        )} (${DAY_NAMES[effectiveDay]})`
                      : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-black bg-[#2f1b57] p-4 sm:min-w-[22rem]">
                <p className="text-xs uppercase tracking-[0.24em] text-[#fef3c7]">Skalman</p>
                <p className="mt-2 text-2xl font-bold text-white">Inställningar</p>
                <p className="mt-1 text-sm text-[#fef3c7]/90">Enkel och tydlig vy.</p>
              </div>
            )}
          </div>
        </header>

        <div
          className={`grid gap-6 ${
            page === "schedule" ? "xl:grid-cols-[1.15fr_0.85fr]" : "xl:grid-cols-1"
          }`}
        >
          {page === "clock" ? (
            <section className={`${surfaceClass} flex flex-col gap-6 overflow-hidden`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Översikt
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Rutinen just nu
                </h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
                <span className="text-lg">🕒</span>
                <span>Tider i {settings.timeFormat24 ? "24h" : "12h"}</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr] lg:items-center">
              <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
                <div className="absolute inset-0 rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.65)_0%,rgba(15,23,42,0.92)_58%,rgba(2,6,23,1)_100%)] shadow-[0_40px_100px_-45px_rgba(15,23,42,0.9)]" />
                <div className="absolute inset-[8%] rounded-full border border-white/10" />
                <div className="absolute inset-[16%] rounded-full border border-white/6" />

                {Array.from({ length: 24 }).map((_, index) => (
                  <span
                    key={index}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/22"
                    style={{
                      ...getClockPosition(index * 60, 46),
                      width: index % 6 === 0 ? "7px" : "4px",
                      height: index % 6 === 0 ? "7px" : "4px",
                    }}
                  />
                ))}

                {clockHourMarkers.map((minute) => (
                  <span
                    key={minute}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.2em] text-slate-400"
                    style={getClockPosition(minute, 33)}
                  >
                    {formatClockHourLabel(minute, settings.timeFormat24)}
                  </span>
                ))}

                <div className="absolute inset-0">
                  <div
                    className="absolute left-1/2 top-1/2 h-[34%] w-[3px] origin-bottom"
                    style={{ transform: `translate(-50%, -100%) rotate(${currentRotation}deg)` }}
                  >
                    <div className="h-full w-full rounded-full bg-gradient-to-t from-fuchsia-500 via-pink-300 to-amber-200 shadow-[0_0_30px_rgba(244,114,182,0.45)]" />
                  </div>

                  <span
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-slate-950 bg-white shadow-[0_0_30px_rgba(255,255,255,0.55)]"
                    style={{
                      ...getClockPosition(currentMinuteWithSeconds, 34),
                      width: "16px",
                      height: "16px",
                    }}
                  />
                </div>

                {sortedEvents.map((event, index) => {
                  const color = palette[index % palette.length];
                  const highlighted = isHighlighted(event);
                  return (
                    <div
                      key={event.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={getClockPosition(event.timeMinutes, 40)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 text-xl shadow-lg transition-transform duration-300 ${
                            highlighted ? "scale-110" : "scale-100"
                          }`}
                          style={{
                            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), ${color.color})`,
                            boxShadow: highlighted
                              ? `0 0 0 6px ${color.glow}33, 0 18px 40px -18px ${color.color}`
                              : `0 16px 34px -22px ${color.color}`,
                          }}
                        >
                          {eventIcon(event.type, index)}
                        </div>
                        <div className="hidden max-w-[6rem] sm:block">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-200">
                            {event.name}
                          </p>
                          <p className="text-[0.72rem] text-slate-400">
                            {formatMinutesForSmall(event.timeMinutes, settings.timeFormat24)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/75 text-center shadow-inner shadow-black/35 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Nu</p>
                  <p className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {timeDialText}
                  </p>
                  {timeDialSuffix ? (
                    <p className="mt-1 text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400">
                      {timeDialSuffix}
                    </p>
                  ) : null}
                  <p className="mt-2 max-w-[12rem] text-sm leading-relaxed text-slate-300">
                    {next ? `Nästa: ${next.name}` : "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div
                  className="rounded-[1.75rem] border border-white/10 p-5 text-white shadow-2xl shadow-slate-950/30"
                  style={{
                    backgroundImage: next
                      ? `linear-gradient(135deg, ${palette[0].color}38 0%, rgba(15,23,42,0.88) 58%, rgba(2,6,23,0.96) 100%)`
                      : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white">
                        {next ? "Nästa hållpunkt" : "—"}
                      </p>
                      <p className="text-sm text-slate-300">
                        {next
                          ? `${next.name} ${formatMinutesForSmall(
                              next.timeMinutes,
                              settings.timeFormat24,
                            )}`
                          : "Inga events ännu"}
                      </p>
                      {next ? (
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Om {formatDuration(minutesUntil(currentMinutes, next.timeMinutes))}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-4xl shadow-lg shadow-black/20">
                      {next ? eventIcon(next.type, 0) : "🕒"}
                    </div>
                  </div>

                  {intervalProgress != null ? (
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400"
                        style={{ width: `${intervalProgress * 100}%` }}
                      />
                    </div>
                  ) : null}

                  {prev && next ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {`Det har gått ${formatDuration(minutesSince(currentMinutes, prev.timeMinutes))} sedan "${prev.name}".`}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            </section>
          ) : null}

          {page === "schedule" ? (
            <aside className="flex flex-col gap-6">
            <section className={`${surfaceClass} space-y-4`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Events</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Redigera tider</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
                    <div className="font-semibold text-slate-100">
                      {settings.displayName.trim() ? settings.displayName.trim() : user.username}
                    </div>
                    {settings.age != null ? (
                      <div className="text-[0.7rem] leading-tight text-slate-400">
                        {settings.age} år
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    onClick={() => setIsEditorOpen((current) => !current)}
                  >
                    {isEditorOpen ? "Dölj" : "Visa"}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((label, dayIndex) => {
                  const hasConfig = (eventsByDay.get(dayIndex) ?? []).length > 0;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setSelectedDay(dayIndex)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        selectedDay === dayIndex
                          ? "border-white/20 bg-white/12 text-white"
                          : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      {label.slice(0, 3)}{hasConfig ? " •" : ""}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">
                Redigerar: <span className="font-semibold text-slate-200">{DAY_NAMES[selectedDay]}</span>
              </p>

              {isEditorOpen ? (
                <>
                  <div className="space-y-3">
                {editableEvents.length ? (
                  <div className="flex flex-col gap-3">
                    {editableEvents.map((e, index) => (
                      <div
                        key={e.id}
                        className="rounded-3xl border border-white/8 bg-slate-950/35 p-4 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            onClick={() =>
                              setOpenEventIds((curr) => ({
                                ...curr,
                                [e.id]: !curr[e.id],
                              }))
                            }
                          >
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl"
                              title="Event färg"
                              style={{
                                backgroundImage: `linear-gradient(135deg, ${palette[index % palette.length].color}, ${palette[index % palette.length].glow})`,
                              }}
                            >
                              {eventIcon(e.type, index)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{e.name}</p>
                              <p className="text-xs text-slate-400">
                                {formatMinutesForSmall(e.timeMinutes, settings.timeFormat24)} ·{" "}
                                {EVENT_TYPE_OPTIONS.find((o) => o.value === e.type)?.label ?? "Annat"}
                              </p>
                            </div>
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                            onClick={() =>
                              setOpenEventIds((curr) => ({
                                ...curr,
                                [e.id]: !curr[e.id],
                              }))
                            }
                          >
                            {openEventIds[e.id] ? "Stäng" : "Öppna"}
                          </button>
                        </div>

                        {openEventIds[e.id] ? (
                          <div className="mt-4 flex items-center justify-between gap-4">
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <label className="space-y-1">
                                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                  Namn
                                </div>
                                <input
                                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25"
                                  value={e.name}
                                  onChange={(ev) => {
                                    const nextName = ev.target.value;
                                    setEvents((curr) =>
                                      curr.map((x) =>
                                        x.id === e.id ? { ...x, name: nextName } : x,
                                      ),
                                    );
                                  }}
                                  onBlur={(ev) => void handleUpdateName(e.id, ev.target.value.trim())}
                                  disabled={busy}
                                />
                              </label>

                              <label className="space-y-1">
                                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                  Tid (24h)
                                </div>
                                <Time24Input
                                  value={e.time}
                                  onChange={(nextTime) => {
                                    const parsed = timeToMinutes(nextTime);
                                    setEvents((curr) =>
                                      curr.map((x) =>
                                        x.id === e.id
                                          ? {
                                              ...x,
                                              time: nextTime,
                                              timeMinutes:
                                                parsed == null ? x.timeMinutes : parsed,
                                            }
                                          : x,
                                      ),
                                    );
                                  }}
                                  onBlur={() => {
                                    const parsed = timeToMinutes(e.time);
                                    if (parsed == null) {
                                      setEvents((curr) =>
                                        curr.map((x) =>
                                          x.id === e.id
                                            ? {
                                                ...x,
                                                time: minutesToTime(x.timeMinutes),
                                              }
                                            : x,
                                        ),
                                      );
                                      return;
                                    }
                                    void handleUpdateTime(e.id, minutesToTime(parsed));
                                  }}
                                  disabled={busy}
                                />
                              </label>
                              <label className="space-y-1">
                                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                  Typ / ikon
                                </div>
                                <select
                                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25"
                                  value={e.type}
                                  onChange={(ev) =>
                                    void handleUpdateType(
                                      e.id,
                                      ev.target.value as EventType,
                                    )
                                  }
                                  disabled={busy}
                                >
                                  {EVENT_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.icon} {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <div className="flex items-center gap-2 self-start">
                              <button
                                type="button"
                                className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                                onClick={() => void handleDeleteEvent(e.id)}
                                disabled={busy}
                                aria-label={`Delete ${e.name}`}
                              >
                                Ta bort
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/8 bg-slate-950/35 p-6 text-sm text-slate-300">
                    Laddar events…
                  </div>
                )}
                  </div>

                  <div className="pt-2">
                <div className="flex items-end justify-between gap-4">
                  <div className="grid flex-1 gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Nytt namn
                      </div>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25"
                        value={addName}
                        onChange={(ev) => setAddName(ev.target.value)}
                        placeholder="Ex: Middag"
                        disabled={busy}
                      />
                    </label>
                    <label className="space-y-1">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Ny tid
                      </div>
                      <Time24Input
                        value={addTime}
                        onChange={setAddTime}
                        onBlur={() => {
                          const parsed = timeToMinutes(addTime);
                          if (parsed != null) {
                            setAddTime(minutesToTime(parsed));
                          }
                        }}
                        disabled={busy}
                      />
                    </label>
                    <label className="space-y-1">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Ny typ / ikon
                      </div>
                      <select
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-fuchsia-300/40 focus:ring-2 focus:ring-fuchsia-300/25"
                        value={addType}
                        onChange={(ev) => setAddType(ev.target.value as EventType)}
                        disabled={busy}
                      >
                        {EVENT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12 disabled:opacity-60"
                    onClick={() => void handleAddEvent()}
                    disabled={busy || !addName.trim()}
                  >
                    Lägg till
                  </button>
                </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="inline-flex w-fit items-center justify-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                  onClick={() => void handleResetDefaults()}
                  disabled={busy}
                >
                  Rensa vald dag
                </button>
                <button
                  type="button"
                  className="inline-flex w-fit items-center justify-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                  onClick={() => {
                    setToken(null);
                    setUser(null);
                    setEvents([]);
                    try {
                      localStorage.removeItem(TOKEN_KEY);
                    } catch {
                      // ignore
                    }
                  }}
                  disabled={busy}
                >
                  Logga ut
                </button>
                  </div>
                </>
              ) : null}
            </section>
            </aside>
          ) : null}
          {page === "settings" ? (
            <SettingsPage settings={settings} onSave={handleSaveSettings} busy={busy} />
          ) : null}
        </div>

        <footer className="px-1 pb-2 text-center text-sm text-slate-500">
          Anpassad och sparad per användare i databasen.
        </footer>
      </main>
    </div>
  );
}
