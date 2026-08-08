"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { StatCard } from "@/components/Card";
import { SessionCard } from "@/components/SessionCard";
import { DriveCard } from "@/components/DriveCard";
import { useAuth } from "@/lib/auth";
import { getSessionsForStudent, getOpenDrivesForStudents } from "@/lib/store";
import type { InterviewSession, Drive } from "@/lib/types";

function StudentDashboardContent() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [openDrives, setOpenDrives] = useState<Drive[]>([]);

  useEffect(() => {
    // Mock store reads localStorage — client-only, hence the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessions(getSessionsForStudent());
    setOpenDrives(getOpenDrivesForStudents());
  }, []);

  const completed = sessions.filter((s) => s.status === "completed");
  const avgScore =
    completed.length > 0
      ? completed.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) /
        completed.length
      : null;

  const attemptedDriveIds = new Set(sessions.map((s) => s.driveId));
  const availableDrives = openDrives.filter(
    (d) => !attemptedDriveIds.has(d.id)
  );

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-wide text-muted">
          {user?.branch}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Interviews completed" value={completed.length} />
          <StatCard label="Open to you" value={availableDrives.length} />
          <StatCard
            label="Avg score"
            value={avgScore !== null ? avgScore.toFixed(1) : "—"}
            suffix="/ 10"
          />
        </div>

        {availableDrives.length > 0 && (
          <>
            <h2 className="mt-10 mb-4 font-mono text-xs uppercase tracking-wide text-muted">
              Open drives
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableDrives.map((drive) => (
                <DriveCard key={drive.id} drive={drive} />
              ))}
            </div>
          </>
        )}

        <h2 className="mt-10 mb-4 font-mono text-xs uppercase tracking-wide text-muted">
          Your sessions
        </h2>
        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <p className="text-sm text-muted">
              No interviews yet — open drives above will show up here once
              you start one.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <AuthGuard role="student">
      <StudentDashboardContent />
    </AuthGuard>
  );
}
