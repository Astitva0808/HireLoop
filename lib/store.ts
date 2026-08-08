"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * MOCK DATA STORE
 * ─────────────────────────────────────────────────────────────────────────
 * Stands in for the real API layer. Everything here reads/writes
 * localStorage and is seeded with sample drives so the dashboards have
 * something to render. Replace each function's body with a fetch()/Supabase
 * call when the backend exists — the function signatures are the contract
 * the UI already depends on, so pages shouldn't need to change.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type { Drive, InterviewSession } from "./types";

const DRIVES_KEY = "hireloop_mock_drives";
const SESSIONS_KEY = "hireloop_mock_sessions";

const SEED_DRIVES: Drive[] = [
  {
    id: "drive-1",
    companyId: "seed-company",
    companyName: "Northwind Systems",
    title: "SDE Intern — Backend",
    role: "Software Development Engineer Intern",
    requiredSkills: ["DSA", "DBMS", "System Design", "Node.js"],
    questionSource: "auto",
    status: "open",
    candidateCount: 12,
    avgScore: 6.8,
    createdAt: "2026-08-01",
  },
  {
    id: "drive-2",
    companyId: "seed-company",
    companyName: "Northwind Systems",
    title: "AI/ML Intern",
    role: "Machine Learning Intern",
    requiredSkills: ["Python", "ML Fundamentals", "Statistics"],
    questionSource: "custom",
    status: "open",
    candidateCount: 7,
    avgScore: 7.4,
    createdAt: "2026-08-03",
  },
  {
    id: "drive-3",
    companyId: "seed-company",
    companyName: "Northwind Systems",
    title: "Frontend Developer — Batch 2026",
    role: "Frontend Engineer",
    requiredSkills: ["React", "CSS", "JavaScript"],
    questionSource: "auto",
    status: "draft",
    candidateCount: 0,
    avgScore: null,
    createdAt: "2026-08-05",
  },
];

const SEED_SESSIONS: InterviewSession[] = [
  {
    id: "session-1",
    driveId: "drive-1",
    driveTitle: "SDE Intern — Backend",
    companyName: "Northwind Systems",
    studentId: "seed-student",
    studentName: "You",
    status: "completed",
    overallScore: 7.6,
    skillBreakdown: { DSA: 8.1, DBMS: 6.9, "System Design": 7.2 },
    completedAt: "2026-08-04",
  },
  {
    id: "session-2",
    driveId: "drive-2",
    driveTitle: "AI/ML Intern",
    companyName: "Northwind Systems",
    studentId: "seed-student",
    studentName: "You",
    status: "not_started",
    overallScore: null,
    completedAt: null,
  },
];

function read<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    window.localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getDrives(): Drive[] {
  return read(DRIVES_KEY, SEED_DRIVES);
}

export function createDrive(
  drive: Omit<Drive, "id" | "candidateCount" | "avgScore" | "createdAt">
): Drive {
  const drives = getDrives();
  const newDrive: Drive = {
    ...drive,
    id: crypto.randomUUID(),
    candidateCount: 0,
    avgScore: null,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  const updated = [newDrive, ...drives];
  write(DRIVES_KEY, updated);
  return newDrive;
}

export function getSessionsForStudent(): InterviewSession[] {
  return read(SESSIONS_KEY, SEED_SESSIONS);
}

export function getOpenDrivesForStudents(): Drive[] {
  return getDrives().filter((d) => d.status === "open");
}
