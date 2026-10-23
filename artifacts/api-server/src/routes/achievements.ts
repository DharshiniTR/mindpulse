import { Router, type IRouter, Request, Response } from "express";
import { db, checkinsTable, usersTable } from "@workspace/db";
import { eq, desc, gte, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
router.use(requireAuth);

function getUserLevel(points: number): { level: number; levelName: string; nextLevelPoints: number } {
  const levels = [
    { level: 1, name: "Seedling", points: 0, next: 100 },
    { level: 2, name: "Sprout", points: 100, next: 300 },
    { level: 3, name: "Bloomer", points: 300, next: 600 },
    { level: 4, name: "Flourisher", points: 600, next: 1000 },
    { level: 5, name: "Thriver", points: 1000, next: 1500 },
    { level: 6, name: "Zenith", points: 1500, next: 2500 },
    { level: 7, name: "Sage", points: 2500, next: 4000 },
    { level: 8, name: "Luminary", points: 4000, next: 6000 },
  ];
  let current = levels[0];
  for (const l of levels) {
    if (points >= l.points) current = l;
  }
  return { level: current.level, levelName: current.name, nextLevelPoints: current.next || current.points };
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });

    const since = new Date();
    since.setDate(since.getDate() - 90);
    const checkins = await db.select().from(checkinsTable)
      .where(and(eq(checkinsTable.userId, req.userId!), gte(checkinsTable.createdAt, since)))
      .orderBy(desc(checkinsTable.createdAt));

    const streak = user.streakDays;
    const total = user.totalCheckins;
    const points = user.points;
    const highMoodCount = checkins.filter(c => c.moodScore >= 8).length;
    const sharedCount = checkins.filter(c => c.shareAnonymously).length;
    const journaledCount = checkins.filter(c => c.journalNote && c.journalNote.length > 20).length;
    const gratitudeCount = checkins.filter(c => c.gratitudeNote && c.gratitudeNote.length > 5).length;

    const badges = [
      {
        id: "first_checkin",
        name: "First Step",
        description: "Log your very first check-in",
        icon: "🌱",
        earned: total >= 1,
        earnedAt: total >= 1 ? checkins[checkins.length - 1]?.createdAt?.toISOString() || null : null,
        category: "milestone",
      },
      {
        id: "streak_3",
        name: "Consistent",
        description: "Maintain a 3-day check-in streak",
        icon: "🔥",
        earned: streak >= 3,
        earnedAt: null,
        category: "streak",
      },
      {
        id: "streak_7",
        name: "Week Warrior",
        description: "Maintain a 7-day check-in streak",
        icon: "⚡",
        earned: streak >= 7,
        earnedAt: null,
        category: "streak",
      },
      {
        id: "streak_30",
        name: "Iron Will",
        description: "Maintain a 30-day check-in streak",
        icon: "💎",
        earned: streak >= 30,
        earnedAt: null,
        category: "streak",
      },
      {
        id: "mood_master",
        name: "Mood Master",
        description: "Log a mood score of 9 or 10 five times",
        icon: "🌟",
        earned: highMoodCount >= 5,
        earnedAt: null,
        category: "mood",
      },
      {
        id: "community_spirit",
        name: "Community Spirit",
        description: "Share 3 check-ins anonymously with the community",
        icon: "💙",
        earned: sharedCount >= 3,
        earnedAt: null,
        category: "social",
      },
      {
        id: "journal_hero",
        name: "Journal Hero",
        description: "Write a detailed journal entry 5 times",
        icon: "📔",
        earned: journaledCount >= 5,
        earnedAt: null,
        category: "wellness",
      },
      {
        id: "gratitude_guru",
        name: "Gratitude Guru",
        description: "Practice gratitude in 10 check-ins",
        icon: "🙏",
        earned: gratitudeCount >= 10,
        earnedAt: null,
        category: "wellness",
      },
      {
        id: "century_club",
        name: "Century Club",
        description: "Complete 100 total check-ins",
        icon: "💯",
        earned: total >= 100,
        earnedAt: null,
        category: "milestone",
      },
      {
        id: "level5",
        name: "Thriver",
        description: "Reach level 5 in your wellness journey",
        icon: "🏆",
        earned: points >= 1000,
        earnedAt: null,
        category: "milestone",
      },
    ];

    const { level, levelName, nextLevelPoints } = getUserLevel(points);

    return res.json({
      streak,
      badges,
      points,
      level,
      levelName,
      nextLevelPoints,
    });
  } catch (err) {
    req.log.error({ err }, "Achievements error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

export default router;
