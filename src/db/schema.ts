import { InferInsertModel } from "drizzle-orm";
import { numeric, pgTable, serial, text } from "drizzle-orm/pg-core";

// Olabildiğince basit olması açısından her şeyi tek bir table üzerinden yapacağım

export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull(),
  text: text("text").notNull(),
  start: numeric().notNull(),
  duration: numeric().notNull(),
});

export type InsertTranscript = InferInsertModel<typeof transcripts>;
