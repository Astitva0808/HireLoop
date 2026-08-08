"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { StatCard } from "@/components/Card";
import { DriveCard } from "@/components/DriveCard";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { getDrives } from "@/lib/store";
import type { Drive } from "@/lib/types";

function CompanyDashboardContent() {
  const { user } = useAuth();
  const [drives, setDrives] = useState<Drive[]>([]);

  useEffect(() => {
    // Mock store reads localStorage — client-only, hence the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrives(getDrives());
  }, []);

  const openDrives = drives.filter((d) => d.status === "open");
  const totalCandidates = drives.reduce((sum, d) => sum + d.candidateCount, 0);
  const scored = drives.filter((d) => d.avgScore !== null);
  const avgAcrossDrives =
    scored.length > 0
      ? scored.reduce((sum, d) => sum + (d.avgScore ?? 0), 0) / scored.length
      : null;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-muted">
              {user?.companyName}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
              Interview drives
            </h1>
          </div>
          <Link href="/dashboard/company/new">
            <Button variant="primary">
              <Plus className="h-4 w-4" />
              New drive
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Open drives" value={openDrives.length} />
          <StatCard label="Total drives" value={drives.length} />
          <StatCard label="Candidates screened" value={totalCandidates} />
          <StatCard
            label="Avg score"
            value={avgAcrossDrives !== null ? avgAcrossDrives.toFixed(1) : "—"}
            suffix="/ 10"
          />
        </div>

        <h2 className="mt-10 mb-4 font-mono text-xs uppercase tracking-wide text-muted">
          All drives
        </h2>
        {drives.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <p className="text-sm text-muted">
              No drives yet. Create one to start screening candidates.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drives.map((drive) => (
              <DriveCard key={drive.id} drive={drive} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CompanyDashboardPage() {
  return (
    <AuthGuard role="company">
      <CompanyDashboardContent />
    </AuthGuard>
  );
}
