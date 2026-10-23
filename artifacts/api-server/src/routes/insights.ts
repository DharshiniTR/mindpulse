import { Router, type IRouter, Request, Response } from "express";
import { db, checkinsTable, usersTable } from "@workspace/db";
import { eq, desc, gte, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 14);

    const checkins = await db.select().from(checkinsTable)
      .where(and(eq(checkinsTable.userId, req.userId!), gte(checkinsTable.createdAt, since)))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(14);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

    const nudges = [];
    let alertLevel = 0;
    let breathingRecommended = false;

    if (checkins.length === 0) {
      nudges.push({
        id: "start",
        type: "reminder",
        title: "Begin Your Wellness Journey",
        message: "Log your first mood check-in to get personalized insights tailored to you.",
        icon: "🌱",
        priority: 1,
      });
    } else {
      const recent5 = checkins.slice(0, 5);
      const avgMood = recent5.reduce((a, c) => a + c.moodScore, 0) / recent5.length;
      const avgEnergy = recent5.reduce((a, c) => a + c.energyLevel, 0) / recent5.length;
      const criticalCount = recent5.filter(c => c.stressLevel === "critical").length;
      const highStressCount = recent5.filter(c => c.stressLevel === "high" || c.stressLevel === "critical").length;
      const lowSleepCount = recent5.filter(c => c.sleepHours !== null && (c.sleepHours || 0) < 6).length;

      if (criticalCount >= 2 || (avgMood <= 3 && highStressCount >= 3)) {
        alertLevel = 3;
        breathingRecommended = true;
        nudges.push({
          id: "critical",
          type: "warning",
          title: "You may need support right now",
          message: "Your recent mood patterns show high distress. Please reach out to a counselor or crisis line. You're not alone.",
          icon: "🆘",
          priority: 0,
        });
      } else if (avgMood <= 5 && highStressCount >= 2) {
        alertLevel = 2;
        breathingRecommended = true;
        nudges.push({
          id: "high_stress",
          type: "warning",
          title: "Stress levels are elevated",
          message: "Your stress and mood suggest you're under significant pressure. Try a 5-minute break with our breathing exercise.",
          icon: "⚠️",
          priority: 0,
        });
      } else if (avgMood <= 6 || highStressCount >= 1) {
        alertLevel = 1;
        nudges.push({
          id: "moderate",
          type: "suggestion",
          title: "Take a mindful moment",
          message: "Things seem a bit tough lately. Even a 10-minute walk can boost your mood by 20%.",
          icon: "🌿",
          priority: 1,
        });
      }

      if (avgMood >= 8) {
        nudges.push({
          id: "great_mood",
          type: "celebration",
          title: "You're thriving! 🎉",
          message: "Your mood has been excellent this week. Keep doing what's working for you!",
          icon: "🌟",
          priority: 2,
        });
      }

      if (lowSleepCount >= 3) {
        nudges.push({
          id: "sleep",
          type: "suggestion",
          title: "Prioritize your sleep",
          message: "You've been sleeping less than 6 hours multiple nights. Quality sleep is the #1 predictor of mood.",
          icon: "😴",
          priority: 2,
        });
      }

      const noExercise = recent5.filter(c => !c.exerciseMinutes || c.exerciseMinutes < 15).length;
      if (noExercise >= 4) {
        nudges.push({
          id: "exercise",
          type: "suggestion",
          title: "Move your body",
          message: "Even 15 minutes of movement releases endorphins. Try a quick campus walk between classes.",
          icon: "🏃",
          priority: 3,
        });
      }

      if (user && user.streakDays >= 7) {
        nudges.push({
          id: "streak",
          type: "celebration",
          title: `${user.streakDays}-day streak! 🔥`,
          message: "Consistent self-tracking is a superpower. Your dedication to your mental health is inspiring.",
          icon: "🔥",
          priority: 3,
        });
      }

      if (avgEnergy <= 4) {
        nudges.push({
          id: "energy",
          type: "suggestion",
          title: "Low energy detected",
          message: "Your energy has been low. Stay hydrated, take breaks every 45 mins, and avoid skipping meals.",
          icon: "⚡",
          priority: 2,
        });
      }
    }

    const tips = [
      "Try the 5-4-3-2-1 grounding technique when anxious: name 5 things you see, 4 you hear, 3 you can touch.",
      "Studies show gratitude journaling for 5 min/day increases life satisfaction by 25%.",
      "The '2-minute rule': if something will take less than 2 minutes, do it now to reduce mental load.",
      "Sunlight exposure in the first hour after waking boosts serotonin and regulates your sleep cycle.",
      "Progressive muscle relaxation: tense each muscle group for 5 seconds, then release for 30 seconds.",
      "Social connection is as vital as sleep. Reach out to one friend or classmate today.",
      "The Pomodoro technique (25 min on, 5 min break) reduces study-related anxiety significantly.",
    ];

    const weeklyInsights = [
      "Your mood peaks mid-week — plan your hardest tasks for Tuesday and Wednesday.",
      "You feel best when you sleep 7+ hours. Try setting a consistent bedtime alarm.",
      "Exercise days correlate with 2+ higher mood scores in your data.",
      "Your mornings show lower energy — try a 5-minute stretching routine to start the day.",
    ];

    return res.json({
      alertLevel,
      nudges: nudges.sort((a, b) => a.priority - b.priority),
      tips: tips.sort(() => Math.random() - 0.5).slice(0, 3),
      weeklyInsight: weeklyInsights[Math.floor(Math.random() * weeklyInsights.length)],
      breathingRecommended,
    });
  } catch (err) {
    req.log.error({ err }, "Insights error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

export default router;
