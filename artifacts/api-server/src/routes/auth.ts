import { Router, type IRouter, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const JWT_SECRET = process.env["JWT_SECRET"] || "mindpulse-secret-key-2024";

function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

function getUserLevel(points: number): { level: number; levelName: string; nextLevelPoints: number } {
  const levels = [
    { level: 1, name: "Seedling", points: 0 },
    { level: 2, name: "Sprout", points: 100 },
    { level: 3, name: "Bloomer", points: 300 },
    { level: 4, name: "Flourisher", points: 600 },
    { level: 5, name: "Thriver", points: 1000 },
    { level: 6, name: "Zenith", points: 1500 },
    { level: 7, name: "Sage", points: 2500 },
    { level: 8, name: "Luminary", points: 4000 },
  ];
  let current = levels[0];
  let next = levels[1];
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].points) {
      current = levels[i];
      next = levels[i + 1] || levels[levels.length - 1];
    }
  }
  return { level: current.level, levelName: current.name, nextLevelPoints: next.points };
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, university, year } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "validation_error", message: "Name, email and password are required" });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "email_exists", message: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      university: university || null,
      year: year || null,
      streakDays: 0,
      totalCheckins: 0,
      points: 0,
    }).returning();
    const token = generateToken(user.id);
    const { level, levelName, nextLevelPoints } = getUserLevel(user.points);
    return res.status(201).json({
      user: {
        id: user.id, name: user.name, email: user.email,
        university: user.university, year: user.year,
        avatarUrl: user.avatarUrl,
        streakDays: user.streakDays, totalCheckins: user.totalCheckins,
        points: user.points, level, levelName, nextLevelPoints,
        joinedAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "validation_error", message: "Email and password required" });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
    }
    const token = generateToken(user.id);
    const { level, levelName, nextLevelPoints } = getUserLevel(user.points);
    return res.status(200).json({
      user: {
        id: user.id, name: user.name, email: user.email,
        university: user.university, year: user.year,
        avatarUrl: user.avatarUrl,
        streakDays: user.streakDays, totalCheckins: user.totalCheckins,
        points: user.points, level, levelName, nextLevelPoints,
        joinedAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ error: "server_error", message: "Internal server error" });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Logged out" });
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "unauthorized", message: "No token" });
    }
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "unauthorized", message: "User not found" });
    }
    const { level, levelName, nextLevelPoints } = getUserLevel(user.points);
    return res.status(200).json({
      id: user.id, name: user.name, email: user.email,
      university: user.university, year: user.year,
      avatarUrl: user.avatarUrl,
      streakDays: user.streakDays, totalCheckins: user.totalCheckins,
      points: user.points, level, levelName, nextLevelPoints,
      joinedAt: user.createdAt,
    });
  } catch (err) {
    return res.status(401).json({ error: "unauthorized", message: "Invalid token" });
  }
});

export { getUserLevel, JWT_SECRET };
export default router;
