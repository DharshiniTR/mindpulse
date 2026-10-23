import { pgTable, serial, integer, text, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const checkinsTable = pgTable("checkins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  moodScore: integer("mood_score").notNull(),
  stressLevel: text("stress_level").notNull(),
  energyLevel: integer("energy_level").notNull(),
  sleepHours: real("sleep_hours"),
  exerciseMinutes: integer("exercise_minutes"),
  gratitudeNote: text("gratitude_note"),
  journalNote: text("journal_note"),
  tags: text("tags").array(),
  shareAnonymously: boolean("share_anonymously").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkinsTable.$inferSelect;
