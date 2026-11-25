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
    evidence: z.object({ src: z.string(), alt: z.string(), caption: z.string(), width: z.number().optional(), height: z.number().optional() }),
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
    // Numbered callouts on the evidence screenshot. x and y are percentages of the image.
    annotations: z
      .array(z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), label: z.string() }))
      .optional(),
    // ISO date (YYYY-MM-DD) shown as "Last updated" under the case study title.
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { projects };
