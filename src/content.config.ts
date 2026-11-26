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
    repo: z.url(),
    video: z.url().optional(),
    evidence: z.object({ src: z.string(), alt: z.string(), caption: z.string() }),
    jobFit: z.array(z.string()).min(1),
    // One line a hiring manager can skim: the outcome, then the technique.
    outcome: z.string().max(180).optional(),
    techniques: z
      .array(z.object({ id: z.string().regex(/^T\d{4}(\.\d{3})?$/), name: z.string() }))
      .default([]),
    trace: z
      .object({
        note: z.string(),
        rows: z.array(
          z.object({ t: z.string(), src: z.string(), event: z.string(), hit: z.boolean().default(false) }),
        ),
      })
      .optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string().max(90),
    description: z.string().max(200),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
