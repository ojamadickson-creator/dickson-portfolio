---
title: "Documentation beats heroics: how I close a ticket so it stays closed"
description: "Most support tickets come back because the fix was never written down. Here is the routine I use to close one properly — and what it changed in my first-contact numbers."
date: 2026-11-25
tags: ["service desk", "documentation", "IT support"]
---

I spent the first year of my support career solving problems quickly. I spent the second year learning that solving them quickly is only half the job. The other half is making sure the same problem doesn't come back to a different person next week.

Most repeat tickets on a service desk are not new faults. They are the same fault, met by someone who had no note to read.

## The four minutes that save the next hour

When a ticket lands, I follow the same four steps before I touch anything:

1. **Reproduce it.** If I cannot make the fault happen, I do not understand it yet. "User says Outlook is slow" is not a diagnosis; "Outlook takes 40 seconds to open with a 6 GB OST on a roaming profile" is.
2. **Find the boundary.** What is the last thing that works? Does the browser load the page but the app time out? Does it fail on Wi-Fi but work on a cable? The boundary usually names the culprit.
3. **Fix the cause, not the symptom.** Restarting a spooler clears the queue. Checking *why* the spooler stalled — a bad driver after an update — stops it stalling again.
4. **Write the note while the details are still hot.** Five lines now are worth thirty minutes of someone else's time later.

## What the note actually contains

A useful resolution note has five parts, and none of them are "fixed":

- **Symptom** — what the user saw, in their words.
- **Cause** — the actual mechanism, even if it was mundane.
- **Fix** — the exact steps, with the setting path and command used.
- **Verification** — how I proved it worked, not that it "seemed fine".
- **Prevention** — what would stop the recurrence: a policy change, an update ring, a knowledge-base article.

That last one is the difference between a closed ticket and a solved problem.

## What changed

Two numbers moved after I made this routine non-negotiable. First-contact resolution went up, because searching my own notes for a symptom is faster than investigating from scratch. Repeat contacts went down, because the second caller found the answer in the ticket instead of raising a new one.

Documentation also made escalation cheaper. When I hand a case to Level 3, the reproduction steps and the boundary are already written down, so the engineer starts at step three instead of step one.

## The habit, not the tool

This works in ServiceNow, Jira, a shared spreadsheet, or a personal markdown file — the tool matters far less than the discipline of writing it before closing it. The test is simple: if a colleague picked up this ticket cold, could they repeat my fix without asking me a question?

If the answer is no, the ticket is not closed. It is just paused.
