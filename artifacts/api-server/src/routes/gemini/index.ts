import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.get("/conversations", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(conversations.createdAt);
  res.json(rows);
});

router.post("/conversations", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const { title } = req.body as { title: string };
  if (!title) {
    res.status(400).json({ error: "title is required" });
    return;
  }
  const [row] = await db
    .insert(conversations)
    .values({ userId, title })
    .returning();
  res.status(201).json(row);
});

router.get("/conversations/:id", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const id = Number(req.params.id);
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);
  res.json({ ...conv, messages: msgs });
});

router.delete("/conversations/:id", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const id = Number(req.params.id);
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(messages).where(eq(messages.conversationId, id));
  await db.delete(conversations).where(eq(conversations.id, id));
  res.status(204).send();
});

router.get("/conversations/:id/messages", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const id = Number(req.params.id);
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/conversations/:id/messages", async (req: Request, res: Response) => {
  const userId = (req as any).userId as number;
  const convId = Number(req.params.id);
  const { content } = req.body as { content: string };

  if (!content) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, convId), eq(conversations.userId, userId)));
  if (!conv) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await db.insert(messages).values({
    conversationId: convId,
    role: "user",
    content,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(messages.createdAt);

  const systemPrompt = `You are Pulse, a compassionate and knowledgeable mental wellness companion built into MindPulse, a student mental health app. Your role is to:
- Listen empathetically and validate feelings without judgment
- Provide evidence-based coping strategies (CBT, mindfulness, breathing techniques)
- Help students navigate college stress, anxiety, burnout, relationships, and academic pressure
- Always encourage professional help when symptoms are severe or persistent
- Keep responses concise, warm, and actionable (2-4 short paragraphs max)
- Never diagnose conditions — always frame as "this sounds like it could be..." and recommend seeing a counselor
- End responses with a gentle follow-up question to keep the conversation going

You are NOT a crisis hotline. If someone expresses suicidal thoughts or self-harm, immediately provide the 988 Suicide & Crisis Lifeline number and encourage them to call.`;

  const chatMessages = [
    { role: "user" as const, parts: [{ text: systemPrompt + "\n\nPlease introduce yourself briefly and ask how I'm feeling today." }] },
    { role: "model" as const, parts: [{ text: "Hi! I'm Pulse, your mental wellness companion here on MindPulse. I'm here to listen, support, and help you navigate whatever you're going through — whether that's academic stress, relationships, anxiety, or just needing someone to talk to. Everything you share is just between us. How are you feeling today?" }] },
    ...history.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: chatMessages,
      config: { maxOutputTokens: 8192 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: convId,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "Failed to get response" })}\n\n`);
    res.end();
  }
});

export default router;
