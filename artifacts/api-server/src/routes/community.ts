import { Router, type IRouter, Request, Response } from "express";
import { db, communityPostsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { sql } from "drizzle-orm";

const router: IRouter = Router();
router.use(requireAuth);

const moodEmojis = ["😊", "😔", "😰", "🥰", "😤", "😌", "🤯", "😴", "🤗", "😅"];
const anonymousMessages = [
  "Exam season is really getting to me. Taking it one hour at a time.",
  "Had a rough week but my study group really helped. Grateful for them.",
  "Finally started going to the campus counselor. Wish I'd done it sooner.",
  "Pulled three all-nighters. Never again. Sleep is sacred.",
  "Feeling disconnected lately. Trying to reconnect with old friends.",
  "My anxiety was through the roof today but I did the breathing exercise and it actually helped!",
  "Small win: I went outside for 10 minutes between classes. Felt so good.",
  "Struggling with homesickness this semester. Anyone else?",
  "Just wanted to say: you're doing better than you think. Keep going. 💙",
  "Had my first therapy session. Nervous but really glad I went.",
  "Coffee is not a substitute for sleep. Learned this the hard way.",
  "Took a mental health day today. No guilt, just rest.",
];

async function seedCommunityIfEmpty() {
  const existing = await db.select({ id: communityPostsTable.id }).from(communityPostsTable).limit(1);
  if (existing.length > 0) return;

  const systemUser = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
  if (systemUser.length === 0) return;
  const userId = systemUser[0].id;

  for (let i = 0; i < 8; i++) {
    const tagSets = [["exams", "stress"], ["gratitude"], ["sleep"], ["anxiety", "breathing"], ["connection"], ["therapy"], ["self-care"], ["encouragement"]];
    await db.insert(communityPostsTable).values({
      userId,
      mood: moodEmojis[i % moodEmojis.length],
      message: anonymousMessages[i],
      tags: tagSets[i % tagSets.length],
      heartCount: Math.floor(Math.random() * 20),
      hugCount: Math.floor(Math.random() * 15),
      starCount: Math.floor(Math.random() * 10),
    });
  }
}

router.get("/feed", async (req: Request, res: Response) => {
  try {
    await seedCommunityIfEmpty();
    const limit = parseInt(req.query["limit"] as string) || 20;
    const posts = await db.select().from(communityPostsTable)
      .orderBy(desc(communityPostsTable.createdAt))
      .limit(limit);

    return res.json(posts.map(p => ({
      id: p.id,
      mood: p.mood,
      message: p.message,
      tags: p.tags || [],
      reactions: {
        heart: p.heartCount,
        hug: p.hugCount,
        star: p.starCount,
      },
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Community feed error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

router.post("/share", async (req: Request, res: Response) => {
  try {
    const { mood, message, tags } = req.body;
    if (!mood || !message) {
      return res.status(400).json({ error: "validation_error", message: "Mood and message required" });
    }
    const [post] = await db.insert(communityPostsTable).values({
      userId: req.userId!,
      mood,
      message,
      tags: tags || [],
      heartCount: 0,
      hugCount: 0,
      starCount: 0,
    }).returning();

    return res.status(201).json({
      id: post.id,
      mood: post.mood,
      message: post.message,
      tags: post.tags || [],
      reactions: { heart: 0, hug: 0, star: 0 },
      createdAt: post.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Share post error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

router.post("/react", async (req: Request, res: Response) => {
  try {
    const { postId, reaction } = req.body;
    if (!postId || !reaction) {
      return res.status(400).json({ error: "validation_error", message: "postId and reaction required" });
    }
    const columnMap: Record<string, any> = {
      heart: { heartCount: sql`${communityPostsTable.heartCount} + 1` },
      hug: { hugCount: sql`${communityPostsTable.hugCount} + 1` },
      star: { starCount: sql`${communityPostsTable.starCount} + 1` },
    };
    if (!columnMap[reaction]) {
      return res.status(400).json({ error: "validation_error", message: "Invalid reaction" });
    }
    await db.update(communityPostsTable).set(columnMap[reaction]).where(eq(communityPostsTable.id, postId));
    return res.json({ success: true, message: "Reacted" });
  } catch (err) {
    req.log.error({ err }, "React to post error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

export default router;
