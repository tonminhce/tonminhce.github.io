export const profile = {
  name: "Nguyen Ton Minh",
  email: "tonminhwork@gmail.com",
  phone: "+84 707 745 461",
  github: "https://github.com/tonminhce",
  linkedin: "https://www.linkedin.com/in/nguyen-ton-minh",
};
export const experience = [
  {
    company: "VNPT Information Technology",
    short: "VNPT IT",
    role: "Software Engineer",
    period: "Jul 2025 — Present",
    projects: [
      {
        name: "VNPT Green",
        stack: "Java · Spring Boot",
        description: "A multi-tenant farm-management platform.",
        points: [
          "Built a reusable Excel import pipeline with preview and batched processing for large workbooks.",
          "Made catalog-copy workflows safe under concurrent requests, with per-item result reporting.",
          "Decoupled activity logging and priority-based multi-channel alerts from request handling, supporting ~10,000 deliveries/min at p95 latency under 5 seconds.",
        ],
      },
      {
        name: "AI-Driven Platform",
        stack: "Go · Docker · Redis",
        description:
          "Internal AI software factory for the SDLC. Runner-up at the internal hackathon.",
        points: [
          "Built a Go orchestrator for multi-stage agent workflows with evidence-based verification, checkpoint/resume, and Redis-backed tenant concurrency controls.",
          "Built a sandboxed execution runtime with a fresh container per command, readiness-gated startup, and checkpoint-based recovery after process failures.",
          "Removed multi-second stalls at ~1,000 trace events per epic using append-only JSONL writes, a cached file handle, and a single write call.",
          "Managed per-run OpenCode containers with read-only project mounts, writable artifact mounts, auto-build fallback, and port/health probes. Validated p99 fanout lag of 250ms with 100 concurrent subscribers in an integration test.",
        ],
      },
    ],
  },
  {
    company: "KDDI Agile Development Center",
    short: "KDDI / Vietlink",
    role: "Software Engineer · Vietlink Solutions",
    period: "Aug 2024 — Jun 2025",
    projects: [
      {
        name: "QB House Saloon",
        stack: "NestJS · PostgreSQL · AWS",
        description: "Walk-in queue and store management for a haircut chain.",
        points: [
          "Kept in-store queue lookups sub-millisecond on a 500k-ticket benchmark and preserved historical reporting by snapshotting ticket prices at issue time.",
          "Added database-level integrity rules for stylist assignment and seat allocation to prevent invalid state and double-booked chairs.",
          "Replaced offset pagination with cursor-based pages, reducing deep-page latency at 20k-row depth to milliseconds.",
        ],
      },
    ],
  },
];
export const certifications = [
  {
    name: "AWS Certified Data Engineer – Associate",
    detail: "Amazon Web Services · DEA-C01",
    date: "May 2026",
  },
  {
    name: "Azure Fundamentals",
    detail: "Microsoft · AZ-900",
    date: "Feb 2026",
  },
  { name: "IELTS 6.5", detail: "British Council", date: "Sep 2022" },
];
export const skillGroups = [
  {
    name: "Languages",
    skills: ["Java", "Go", "TypeScript", "JavaScript", "Python", "C++"],
  },
  {
    name: "Backend & infrastructure",
    skills: ["Spring Boot", "NestJS", "Kafka", "Docker", "AWS", "REST APIs"],
  },
  {
    name: "Data & storage",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch"],
  },
];
