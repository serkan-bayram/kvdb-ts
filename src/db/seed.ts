import { readdir, readFile } from "fs/promises";
import path from "path";
import z from "zod";
import { InsertTranscript, transcripts } from "./schema";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { createServerOnlyFn } from "@tanstack/react-start";

const transcriptSchema = z.array(
  z.object({ text: z.string(), start: z.number(), duration: z.number() })
);

const seedDatabase = createServerOnlyFn(async () => {
  await db.execute(sql`TRUNCATE TABLE transcripts RESTART IDENTITY;`);

  const baseDir = path.join(process.cwd(), "transcripts");

  // transcripts içindeki klasörleri oku
  const videoIds = await readdir(baseDir);

  if (videoIds.length === 0) {
    throw new Error("Missing transcripts folder.");
  }

  const insertTranscripts: InsertTranscript[] = [];

  for (const videoId of videoIds) {
    const videoIdPath = path.join(baseDir, videoId);

    const transcriptPath = path.join(videoIdPath, "transcript.json");

    const transcriptFile = await readFile(transcriptPath, "utf-8");

    const parsedTranscriptFile = transcriptSchema.safeParse(
      JSON.parse(transcriptFile)
    );

    if (parsedTranscriptFile.error) {
      throw new Error(
        `Error while parsing transcript for video ${videoId}: `,
        parsedTranscriptFile.error
      );
    }

    parsedTranscriptFile.data.forEach((transcriptFile) => {
      insertTranscripts.push({
        videoId: videoId,
        text: transcriptFile.text,
        start: transcriptFile.start.toString(), // PostgreSQL numeric data tipini string olarak saklıyormuş
        duration: transcriptFile.duration.toString(),
      });
    });
  }

  for (let i = 0; i < insertTranscripts.length; i += 3000) {
    const chunk = insertTranscripts.slice(i, i + 3000);

    await db.insert(transcripts).values(chunk);

    console.log(`Inserted ${i + chunk.length}/${insertTranscripts.length}`);
  }
});

await seedDatabase();
