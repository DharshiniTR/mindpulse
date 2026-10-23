import { Router, type IRouter, Request, Response } from "express";
import { db, checkinsTable, usersTable } from "@workspace/db";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
router.use(requireAuth);

function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getDayLabel(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(dateStr).getDay()];
}

async function updateStreak(userId: number) {
  const today = getTodayDateStr();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return;

  let newStreak = user.streakDays;
  if (user.lastCheckinDate === today) {
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (user.lastCheckinDate === yesterdayStr) {
    newStreak = user.streakDays + 1;
  } else if (user.lastCheckinDate !== today) {
    newStreak = 1;
  }

  const pointsEarned = 10 + (newStreak >= 7 ? 5 : 0) + (newStreak >= 30 ? 10 : 0);
  await db.update(usersTable).set({
    streakDays: newStreak,
    totalCheckins: user.totalCheckins + 1,
    lastCheckinDate: today,
    points: user.points + pointsEarned,
    updatedAt: new Date(),
  }).where(eq(usersTable.id, userId));
}

router.get("/today", async (req: Request, res: Response) => {
  try {
    const today = getTodayDateStr();
    const todayStart = new Date(today + "T00:00:00.000Z");
    const todayEnd = new Date(today + "T23:59:59.999Z");
    const checkins = await db.select().from(checkinsTable)
      .where(and(
        eq(checkinsTable.userId, req.userId!),
        gte(checkinsTable.createdAt, todayStart)
      ))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(1);

    if (checkins.length === 0) {
      return res.json({ hasCheckedIn: false, checkin: null });
    }
    const c = checkins[0];
    return res.json({
      hasCheckedIn: true,
      checkin: {
        ...c,
        tags: c.tags || [],
        createdAt: c.createdAt.toISOString(),
      }
    });
  } catch (err) {
    req.log.error({ err }, "Get today checkin error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query["days"] as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const checkins = await db.select().from(checkinsTable)
      .where(and(
        eq(checkinsTable.userId, req.userId!),
        gte(checkinsTable.createdAt, since)
      ))
      .orderBy(desc(checkinsTable.createdAt));

    if (checkins.length === 0) {
      return res.json({
        averageMood: 0, averageEnergy: 0, averageSleep: 0, averageExercise: 0,
        streakDays: 0, totalCheckins: 0, moodTrend: "stable",
        stressDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        weeklyData: [], heatmapData: []
      });
    }

    const avgMood = checkins.reduce((a, c) => a + c.moodScore, 0) / checkins.length;
    const avgEnergy = checkins.reduce((a, c) => a + c.energyLevel, 0) / checkins.length;
    const sleepCheckins = checkins.filter(c => c.sleepHours !== null);
    const avgSleep = sleepCheckins.length > 0
      ? sleepCheckins.reduce((a, c) => a + (c.sleepHours || 0), 0) / sleepCheckins.length
      : 0;
    const exerciseCheckins = checkins.filter(c => c.exerciseMinutes !== null);
    const avgExercise = exerciseCheckins.length > 0
      ? exerciseCheckins.reduce((a, c) => a + (c.exerciseMinutes || 0), 0) / exerciseCheckins.length
      : 0;

    const stressDist = { low: 0, medium: 0, high: 0, critical: 0 };
    checkins.forEach(c => {
      const level = c.stressLevel as keyof typeof stressDist;
      if (level in stressDist) stressDist[level]++;
    });

    const half = Math.floor(checkins.length / 2);
    let moodTrend: "improving" | "declining" | "stable" = "stable";
    if (checkins.length >= 4) {
      const recentHalf = checkins.slice(0, half);
      const olderHalf = checkins.slice(half);
      const recentAvg = recentHalf.reduce((a, c) => a + c.moodScore, 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((a, c) => a + c.moodScore, 0) / olderHalf.length;
      if (recentAvg - olderAvg > 0.5) moodTrend = "improving";
      else if (olderAvg - recentAvg > 0.5) moodTrend = "declining";
    }

    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    const weeklyData = last7Days.map(dateStr => {
      const dayCheckins = checkins.filter(c =>
        c.createdAt.toISOString().split("T")[0] === dateStr
      );
      if (dayCheckins.length === 0) {
        return { date: dateStr, dayLabel: getDayLabel(dateStr), moodScore: 0, energyLevel: 0, stressLevel: "none" };
      }
      const avgM = dayCheckins.reduce((a, c) => a + c.moodScore, 0) / dayCheckins.length;
      const avgE = dayCheckins.reduce((a, c) => a + c.energyLevel, 0) / dayCheckins.length;
      return {
        date: dateStr,
        dayLabel: getDayLabel(dateStr),
        moodScore: Math.round(avgM * 10) / 10,
        energyLevel: Math.round(avgE * 10) / 10,
        stressLevel: dayCheckins[0].stressLevel,
      };
    });

    const heatmapData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayCheckins = checkins.filter(c =>
        c.createdAt.toISOString().split("T")[0] === dateStr
      );
      heatmapData.push({
        date: dateStr,
        value: dayCheckins.length > 0
          ? dayCheckins.reduce((a, c) => a + c.moodScore, 0) / dayCheckins.length
          : 0,
        count: dayCheckins.length,
      });
    }

    const [user] = await db.select({ streakDays: usersTable.streakDays, totalCheckins: usersTable.totalCheckins })
      .from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

    return res.json({
      averageMood: Math.round(avgMood * 10) / 10,
      averageEnergy: Math.round(avgEnergy * 10) / 10,
      averageSleep: Math.round(avgSleep * 10) / 10,
      averageExercise: Math.round(avgExercise),
      streakDays: user?.streakDays || 0,
      totalCheckins: user?.totalCheckins || checkins.length,
      moodTrend,
      stressDistribution: stressDist,
      weeklyData,
      heatmapData,
    });
  } catch (err) {
    req.log.error({ err }, "Get stats error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query["days"] as string) || 30;
    const limit = parseInt(req.query["limit"] as string) || 50;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const checkins = await db.select().from(checkinsTable)
      .where(and(
        eq(checkinsTable.userId, req.userId!),
        gte(checkinsTable.createdAt, since)
      ))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(limit);

    return res.json(checkins.map(c => ({
      ...c,
      tags: c.tags || [],
      createdAt: c.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Get checkins error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { moodScore, stressLevel, energyLevel, sleepHours, exerciseMinutes, gratitudeNote, journalNote, tags, shareAnonymously } = req.body;

    if (!moodScore || !stressLevel || !energyLevel) {
      return res.status(400).json({ error: "validation_error", message: "moodScore, stressLevel, energyLevel required" });
    }

    const [checkin] = await db.insert(checkinsTable).values({
      userId: req.userId!,
      moodScore: parseInt(moodScore),
      stressLevel,
      energyLevel: parseInt(energyLevel),
      sleepHours: sleepHours ? parseFloat(sleepHours) : null,
      exerciseMinutes: exerciseMinutes ? parseInt(exerciseMinutes) : null,
      gratitudeNote: gratitudeNote || null,
      journalNote: journalNote || null,
      tags: tags || [],
      shareAnonymously: shareAnonymously || false,
    }).returning();

    await updateStreak(req.userId!);

    return res.status(201).json({
      ...checkin,
      tags: checkin.tags || [],
      createdAt: checkin.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Create checkin error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

export default router;
