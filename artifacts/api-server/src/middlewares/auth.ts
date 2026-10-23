import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env["JWT_SECRET"] || "mindpulse-secret-key-2024";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    }
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "unauthorized", message: "User not found" });
    }
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized", message: "Invalid token" });
  }
}
