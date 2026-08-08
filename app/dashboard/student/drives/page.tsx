"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { useAuth } from "@/lib/auth";
import { getOpenDrives } from "@/lib/api";
import type { Drive, InterviewSession } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

function StudentDrivesContent() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessions: InterviewSession[] = [];

  const attemptedDriveIds = useMemo(
    () => new Set(sessions.map((s) => s.driveId)),
    [sessions]
  );

  useEffect(() => {
    async function fetchDrives() {
      try {
        setLoading(true);
        const data = await getOpenDrives();
        setDrives(data as Drive[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load drives");
      } finally {
        setLoading(false);
      }
    }

    fetchDrives();
  }, []);

  const availableDrives = useMemo(
    () =>
      drives.filter(
        (drive) =>
          drive.status === "open" &&
          !attemptedDriveIds.has(drive.id)
      ),
    [drives, attemptedDriveIds]
  );

  const filteredDrives = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return availableDrives;

    return availableDrives.filter(
      (drive) =>
        drive.title.toLowerCase().includes(query) ||
        drive.role.toLowerCase().includes(query) ||
        drive.requiredSkills.some((skill) =>
          skill.toLowerCase().includes(query)
        )
    );
  }, [availableDrives, search]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pt-10">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease }}
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Opportunities
          </p>

          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Open drives
          </h1>

          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
            Interview opportunities available to you.
            Start an interview to begin building your profile.
          </p>
        </div>
      </motion.section>

      {/* Search */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease }}
        className="mt-8"
      >
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drives..."
            className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none transition-all placeholder:text-muted focus:border-teal focus:ring-2 focus:ring-teal/10"
          />
        </div>
      </motion.section>

      {/* Drive list */}
      {loading ? (
        <div className="mt-7 flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
        </div>
      ) : error ? (
        <div className="mt-7 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">{error}</p>
        </div>
      ) : (
        <section className="mt-7">
          {filteredDrives.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredDrives.map((drive, index) => (
                <motion.div
                  key={drive.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.15 + index * 0.06,
                    ease,
                  }}
                  whileHover={{ y: -4 }}
                >
                  <DriveCard drive={drive} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper">
                <BriefcaseBusiness className="h-5 w-5 text-muted" />
              </div>

              <h3 className="mt-4 text-sm font-medium text-ink">
                {search ? "No matching drives" : "No new opportunities"}
              </h3>

              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
                {search
                  ? "Try a different search term."
                  : "You've either attempted all currently open drives or there aren't any available right now."}
              </p>
            </motion.div>
          )}
        </section>
      )}
    </main>
  );
}

function DriveCard({ drive }: { drive: Drive }) {
  const interviewUrl = `/interview?driveId=${encodeURIComponent(drive.id)}`;

  return (
    <div className="rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_2px_16px_-4px_rgba(22,33,62,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-ink">
            {drive.title}
          </h3>

          <p className="mt-1 text-sm text-muted">
            {drive.role}
          </p>
        </div>

        <Badge tone="teal">Open</Badge>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {drive.requiredSkills.map((skill) => (
          <Badge key={skill} tone="ink">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {drive.candidateCount} candidate
          {drive.candidateCount === 1 ? "" : "s"}
        </div>

        <Link href={interviewUrl}>
          <Button variant="primary" className="!px-3 !py-1.5 text-xs">
            Start interview
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function StudentDrivesPage() {
  return (
    <AuthGuard role="student">
      <StudentDrivesContent />
    </AuthGuard>
  );
}
