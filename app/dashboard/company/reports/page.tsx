"use client";

import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { getMyDrives, getDriveReports } from "@/lib/api";
import type { Report as ApiReport } from "@/lib/api";

const reports: { title: string; candidates: number; score: number; date: string; status: string }[] = [];

function ReportsContent() {
  const [reportsData, setReportsData] = useState<typeof reports>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const drives = await getMyDrives();
        const allReports: typeof reports = [];

        for (const drive of drives) {
          try {
            const driveReports = await getDriveReports(drive.id);
            for (const report of driveReports) {
              allReports.push({
                title: drive.title,
                candidates: 1,
                score: report.overall_score ?? 0,
                date: report.created_at ? new Date(report.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
                status: report.status || "Ready",
              });
            }
          } catch {
            // Skip drives that fail to load reports
          }
        }

        setReportsData(allReports);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Evaluation
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Reports
            </h1>

            <p className="mt-1 text-sm text-muted">
              Candidate and interview evaluation reports.
            </p>
          </div>

          <Button variant="ghost">
            <Download className="h-4 w-4" />
            Export reports
          </Button>
        </div>
      </motion.div>

      <section className="mt-8 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-teal" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
            <p className="text-sm font-medium text-ink">{error}</p>
          </div>
        ) : reportsData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
            <p className="text-sm font-medium text-ink">No reports yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
              Interview reports will appear here once evaluations are complete.
            </p>
          </div>
        ) : (
          <>
            {reportsData.map((report, index) => (
              <motion.div
                key={report.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_8px_30px_-15px_rgba(22,33,62,0.2)] sm:flex-row sm:items-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-light text-teal-dark">
                  <FileText className="h-4 w-4" />
                </div>

                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-ink">
                    {report.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                    <span>
                      {report.candidates} candidates
                    </span>

                    <span>
                      Avg. {report.score.toFixed(1)} / 10
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {report.date}
                    </span>
                  </div>
                </div>

                <Badge tone="teal">{report.status}</Badge>

                <button className="flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs font-medium text-ink hover:bg-paper">
                  View
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </>
        )}
      </section>
    </main>
  );
}

export default function CompanyReportsPage() {
  return (
    <AuthGuard role="company">
      <ReportsContent />
    </AuthGuard>
  );
}