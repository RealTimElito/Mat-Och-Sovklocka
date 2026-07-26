import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth.js";

const router = Router();

const EVENT_TYPES = new Set([
  "sleep",
  "nap",
  "food",
  "mellis",
  "coffee",
  "wake",
  "other",
]);

const DEFAULT_EVENTS = [
  { name: "Vakna", type: "wake", time: "07:00" },
  { name: "Frukost", type: "food", time: "07:30" },
  { name: "Lunch", type: "food", time: "11:30" },
  { name: "Mellis", type: "mellis", time: "14:30" },
  { name: "Middag", type: "food", time: "17:30" },
  { name: "Sovdags", type: "sleep", time: "20:00" },
];

function parseDayOfWeek(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) return null;
  return parsed;
}

function timeToMinutes(time) {
  if (typeof time !== "string") return null;

  const trimmed = time.trim();
  let hours = null;
  let minutes = null;

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

  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  );
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

async function ensureDefaultsForUser(userId) {
  const any = await prisma.event.findFirst({ where: { userId } });
  if (any) return;

  await prisma.event.createMany({
    data: DEFAULT_EVENTS.map((e) => ({
      userId,
      dayOfWeek: 1,
      name: e.name,
      type: e.type,
      timeMinutes: timeToMinutes(e.time) ?? 0,
    })),
  });
}

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  await ensureDefaultsForUser(userId);

  const events = await prisma.event.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: "asc" }, { timeMinutes: "asc" }],
    select: { id: true, dayOfWeek: true, name: true, type: true, timeMinutes: true },
  });

  return res.json(
    events.map((e) => ({
      id: e.id,
      dayOfWeek: e.dayOfWeek,
      name: e.name,
      type: e.type,
      time: minutesToTime(e.timeMinutes),
      timeMinutes: e.timeMinutes,
    })),
  );
});

router.post("/", requireAuth, async (req, res) => {
  const { name, time, type, dayOfWeek } = req.body || {};
  if (!name || typeof name !== "string") return res.status(400).json({ error: "name required" });
  if (!type || typeof type !== "string" || !EVENT_TYPES.has(type)) {
    return res.status(400).json({ error: "invalid type" });
  }
  const parsedDay = parseDayOfWeek(dayOfWeek);
  if (parsedDay == null) return res.status(400).json({ error: "invalid dayOfWeek" });

  const timeMinutes = timeToMinutes(time);
  if (timeMinutes == null) return res.status(400).json({ error: "time must be HH:MM (24h)" });

  const event = await prisma.event.create({
    data: {
      userId: req.user.id,
      dayOfWeek: parsedDay,
      name: name.trim(),
      type,
      timeMinutes,
    },
    select: { id: true, dayOfWeek: true, name: true, type: true, timeMinutes: true },
  });

  return res.status(201).json({
    id: event.id,
    dayOfWeek: event.dayOfWeek,
    name: event.name,
    type: event.type,
    time: minutesToTime(event.timeMinutes),
    timeMinutes: event.timeMinutes,
  });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, time, type, dayOfWeek } = req.body || {};

  if (name == null && time == null && type == null && dayOfWeek == null) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const update = {};
  if (name != null) {
    if (typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "Invalid name" });
    update.name = name.trim();
  }
  if (time != null) {
    const timeMinutes = timeToMinutes(time);
    if (timeMinutes == null) return res.status(400).json({ error: "time must be HH:MM (24h)" });
    update.timeMinutes = timeMinutes;
  }
  if (type != null) {
    if (typeof type !== "string" || !EVENT_TYPES.has(type)) {
      return res.status(400).json({ error: "invalid type" });
    }
    update.type = type;
  }
  if (dayOfWeek != null) {
    const parsedDay = parseDayOfWeek(dayOfWeek);
    if (parsedDay == null) return res.status(400).json({ error: "invalid dayOfWeek" });
    update.dayOfWeek = parsedDay;
  }

  const updated = await prisma.event.updateMany({
    where: { id, userId: req.user.id },
    data: update,
  });

  if (updated.count === 0) return res.status(404).json({ error: "Event not found" });
  return res.json({ ok: true });
});

router.delete("/", requireAuth, async (req, res) => {
  const parsedDay = parseDayOfWeek(req.query.dayOfWeek);
  await prisma.event.deleteMany({
    where: {
      userId: req.user.id,
      ...(parsedDay == null ? {} : { dayOfWeek: parsedDay }),
    },
  });
  return res.json({ ok: true });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const deleted = await prisma.event.deleteMany({
    where: { id, userId: req.user.id },
  });

  if (deleted.count === 0) return res.status(404).json({ error: "Event not found" });
  return res.json({ ok: true });
});

export default router;

