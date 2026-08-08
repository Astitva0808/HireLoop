import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Badge, ScoreReadout } from "@/components/Badge";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="grid gap-12 pt-20 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-28">
          <div>
            <Badge tone="teal">For campus recruiting</Badge>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Interviews that check if you actually know it.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
              A company sets the skills that matter. HireLoop&apos;s AI
              interviewer asks, listens, and probes deeper when an answer is
              thin — then ranks every candidate on substance, not keyword
              overlap.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup?role=company">
                <Button variant="primary">
                  I&apos;m hiring
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup?role=student">
                <Button variant="ghost">I&apos;m a candidate</Button>
              </Link>
            </div>
          </div>

          {/* Signature element: a live "loop" readout of question -> answer -> follow-up -> score */}
          <div className="rounded-xl border border-line bg-surface p-5 shadow-[0_4px_28px_-8px_rgba(22,33,62,0.12)]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                Session · Backend Intern
              </span>
              <Badge tone="amber">Live</Badge>
            </div>

            <div className="mt-4 space-y-3 font-mono text-[13px] leading-relaxed">
              <p>
                <span className="text-muted">Q ·</span>{" "}
                <span className="text-ink">
                  Explain how indexing affects a slow query.
                </span>
              </p>
              <p>
                <span className="text-muted">A ·</span>{" "}
                <span className="text-ink-soft">
                  &ldquo;It makes lookups faster by avoiding a full scan.&rdquo;
                </span>
              </p>
              <p className="rounded-md bg-teal-light px-3 py-2 text-teal-dark">
                ↳ Follow-up · Which column would you index here, and why
                that one?
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm text-muted">Depth-of-knowledge score</span>
              <ScoreReadout value={6.4} size="sm" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="grid gap-6 border-t border-line py-16 sm:grid-cols-3">
          <div>
            <span className="font-mono text-xs text-teal">Company</span>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Define the role and required skills — or paste in your own
              question set.
            </p>
          </div>
          <div>
            <span className="font-mono text-xs text-teal">AI Interviewer</span>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Asks each candidate the same core questions, then follows up
              live wherever an answer is vague.
            </p>
          </div>
          <div>
            <span className="font-mono text-xs text-teal">Ranking</span>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Every candidate gets a skill-by-skill breakdown — the company
              gets a ranked shortlist.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <p className="mx-auto max-w-6xl px-6 font-mono text-xs text-muted">
          HireLoop — built as a college mini-project.
        </p>
      </footer>
    </div>
  );
}
