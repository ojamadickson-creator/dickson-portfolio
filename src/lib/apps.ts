export interface AppEntry {
  slug: string;
  name: string;
  shortName: string;
  exam: string;
  description: string;
  features: string[];
  repo: string;
}

/** Browser-only practice apps vendored into /public/apps/<slug>/app.html */
export const apps: AppEntry[] = [
  {
    slug: "comptia-a-core",
    name: "CompTIA A+ Core 1 exam simulator",
    shortName: "A+ Core 1 simulator",
    exam: "220-1101",
    description:
      "Timed practice exam with explanations after each answer, progress across the domains, and a score at the end.",
    features: ["Timed", "Explanations", "Domain scoring"],
    repo: "https://github.com/ojamadickson-creator/Comptia-a-b",
  },
  {
    slug: "cysa-practice",
    name: "CompTIA CySA+ exam simulator",
    shortName: "CySA+ simulator",
    exam: "CS0-004",
    description:
      "Full-length practice exam with scenario and performance-based questions, saved progress, and a breakdown by domain.",
    features: ["Timed", "Performance-based", "Saves progress"],
    repo: "https://github.com/ojamadickson-creator/cysa-test",
  },
  {
    slug: "cysa-tracker",
    name: "CySA+ study hub",
    shortName: "CySA+ study hub",
    exam: "CS0-004",
    description:
      "Study tracker over the exam objectives: mark topics as done, keep flashcard notes, and see which domains still need work.",
    features: ["Flashcards", "Progress", "Objectives"],
    repo: "https://github.com/ojamadickson-creator/cysa-studytracker",
  },
  {
    slug: "aws-practitioner",
    name: "AWS Cloud Practitioner practice test",
    shortName: "AWS practitioner test",
    exam: "CLF-C02",
    description:
      "160 practice questions with explanations, an exam-style timer, and instant feedback as you answer.",
    features: ["160 questions", "Timed", "Explanations"],
    repo: "https://github.com/ojamadickson-creator/aws-practitioner-cert",
  },
  {
    slug: "comptia-a-simulator",
    name: "CompTIA A+ simulator (2025 build)",
    shortName: "A+ simulator 2025",
    exam: "220-1101 / 220-1102",
    description:
      "A newer build of the A+ simulator with randomised questions and a review pass before you submit.",
    features: ["Rewritten", "Randomised"],
    repo: "https://github.com/ojamadickson-creator/comptia-a-plus-exam-simulator",
  },
];
