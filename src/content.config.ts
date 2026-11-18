import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    code: z.string(), // ticket-style ID shown on cards, e.g. LAB-01
    track: z.enum(["it", "security"]),
    order: z.number(),
    summary: z.string().max(220),
    brief: z.string(),
    stack: z.array(z.string()).min(1),
    repo: z.string().url(),
    video: z.string().url().optional(),
    evidence: z.object({ src: z.string(), alt: z.string(), caption: z.string() }),
    jobFit: z.array(z.string()).min(1),
  }),
});

export const collections = { projects };
