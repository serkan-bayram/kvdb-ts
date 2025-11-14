import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import { transcripts } from "./db/schema";
import { sql } from "drizzle-orm";
import z from "zod";

export const imFeelingLucky = createServerFn().handler(async () => {
  const row = await db
    .select()
    .from(transcripts)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  return row;
});

const searchSchema = z.object({ searchText: z.string() });

export const searchVideo = createServerFn()
  .inputValidator(searchSchema)
  .handler(async ({ data }) => {
    const row = await db
      .select()
      .from(transcripts)
      .where(sql`text ILIKE ${data.searchText + "%"}`)
      .limit(20);

    return row;
  });
