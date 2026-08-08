"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "./Card";
import {
  ScoreReadout,
  StatusBadge,
} from "./Badge";
import { Button } from "./Button";
import type { InterviewSession } from "@/lib/types";

export function SessionCard({
  session,
}: {
  session: InterviewSession;
}) {
  const router = useRouter();

  const isDone =
    session.status === "completed";

  const isInProgress =
    session.status === "in_progress";

  function handleStartInterview() {
    if (!session.id) {
      console.error(
        "Session ID is missing."
      );
      return;
    }

    const params =
      new URLSearchParams();

    params.set(
      "sessionId",
      session.id
    );

    if (session.driveId) {
      params.set(
        "driveId",
        session.driveId
      );
    }

    router.push(
      `/interview?${params.toString()}`
    );
  }

  function handleViewReport() {
    /*
     * The current feedback page reads its data from
     * sessionStorage under "hireloop-feedback".
     *
     * If feedback is available, open it directly.
     *
     * If it isn't available, don't send the student
     * into a new interview accidentally.
     */
    const storedFeedback =
      sessionStorage.getItem(
        "hireloop-feedback"
      );

    if (storedFeedback) {
      router.push("/feedback");
      return;
    }

    console.warn(
      "Feedback report is not available for this session."
    );

    /*
     * The report API/database connection can be
     * added later without changing this card's UI.
     */
  }

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <Card>
        {/* Header */}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold text-ink">
              {session.driveTitle}
            </h3>

            <p className="mt-1 truncate text-sm text-muted">
              {session.companyName}
            </p>
          </div>

          <StatusBadge
            status={session.status}
          />
        </div>

        {/* Skill breakdown */}

        {isDone &&
          session.skillBreakdown && (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
              {Object.entries(
                session.skillBreakdown
              ).map(
                ([skill, score]) => (
                  <div
                    key={skill}
                    className="flex items-baseline gap-1.5"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                      {skill}
                    </span>

                    <ScoreReadout
                      value={score}
                      size="sm"
                    />
                  </div>
                )
              )}
            </div>
          )}

        {/* Footer */}

        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wide text-muted">
              Overall score
            </p>

            <div className="mt-1">
              <ScoreReadout
                value={
                  session.overallScore
                }
              />
            </div>
          </div>

          {isDone ? (
            <Button
              type="button"
              variant="ghost"
              className="!px-4 !py-2 text-sm"
              onClick={handleViewReport}
            >
              View report
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant={
                isInProgress
                  ? "primary"
                  : "secondary"
              }
              className="!px-4 !py-2 text-sm"
              onClick={
                handleStartInterview
              }
            >
              {isInProgress ? (
                <>
                  Continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Start interview
                  <RotateCcw className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}