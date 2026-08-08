"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { useAuth } from "@/lib/auth";
import { createDrive } from "@/lib/api";
import type { QuestionSource } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

function NewDriveContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [questionSource, setQuestionSource] =
    useState<QuestionSource>("auto");
  const [customQuestions, setCustomQuestions] =
    useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSkill() {
    const trimmed = skillInput.trim();

    if (
      trimmed &&
      !skills.some(
        (skill) =>
          skill.toLowerCase() ===
          trimmed.toLowerCase()
      )
    ) {
      setSkills([...skills, trimmed]);
    }

    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills(
      skills.filter((s) => s !== skill)
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      await createDrive({
        title,
        role,
        requiredSkills: skills,
        questionSource,
        status: "draft",
      });

      router.push("/dashboard/company");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create drive");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-8 sm:pt-10">
        {/* ------------------------------------------------ */}
        {/* Back navigation                                 */}
        {/* ------------------------------------------------ */}

        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/company")
            }
            className="group inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to dashboard
          </button>
        </motion.div>

        {/* ------------------------------------------------ */}
        {/* Header                                          */}
        {/* ------------------------------------------------ */}

        <motion.section
          initial={{
            opacity: 0,
            y: 18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.05,
            ease,
          }}
          className="mt-8"
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.45,
                delay: 0.15,
                ease,
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-light text-teal-dark"
            >
              <BriefcaseBusiness className="h-5 w-5" />
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Recruitment
                </span>

                <span className="h-1 w-1 rounded-full bg-line" />

                <span className="font-mono text-[10px] uppercase tracking-widest text-teal">
                  New drive
                </span>
              </div>

              <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Create an interview drive
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Define what you&apos;re hiring for.
                HireLoop will use these requirements
                to structure the candidate interview.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ------------------------------------------------ */}
        {/* Progress indicator                               */}
        {/* ------------------------------------------------ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.2,
            ease,
          }}
          className="mt-8 flex items-center gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-white">
              1
            </span>

            <span className="text-xs font-medium text-ink">
              Drive details
            </span>
          </div>

          <ChevronRight className="h-3.5 w-3.5 text-muted" />

          <div className="flex items-center gap-2 text-muted">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-[10px] font-medium">
              2
            </span>

            <span className="text-xs">
              Interview setup
            </span>
          </div>

          <ChevronRight className="hidden h-3.5 w-3.5 text-muted sm:block" />

          <div className="hidden items-center gap-2 text-muted sm:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-[10px] font-medium">
              3
            </span>

            <span className="text-xs">
              Publish
            </span>
          </div>
        </motion.div>

        {/* ------------------------------------------------ */}
        {/* Form                                             */}
        {/* ------------------------------------------------ */}

        <motion.form
          onSubmit={handleSubmit}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            delay: 0.25,
            ease,
          }}
          className="mt-6 overflow-hidden rounded-xl border border-line bg-surface shadow-[0_4px_28px_-12px_rgba(22,33,62,0.10)]"
        >
          {/* Form header */}

          <div className="border-b border-line px-6 py-5 sm:px-7">
            <h2 className="text-sm font-semibold text-ink">
              Role details
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-muted">
              These details help define what candidates
              will be evaluated on.
            </p>
          </div>

          <div className="flex flex-col gap-6 p-6 sm:p-7">
            {/* ------------------------------------------------ */}
            {/* Drive title                                     */}
            {/* ------------------------------------------------ */}

            <Field
              label="Drive title"
              htmlFor="title"
              hint="Shown to candidates"
            >
              <Input
                id="title"
                required
                placeholder="SDE Intern — Backend"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />
            </Field>

            {/* ------------------------------------------------ */}
            {/* Role                                             */}
            {/* ------------------------------------------------ */}

            <Field
              label="Role"
              htmlFor="role"
            >
              <Input
                id="role"
                required
                placeholder="Software Development Engineer Intern"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
              />
            </Field>

            {/* ------------------------------------------------ */}
            {/* Skills                                           */}
            {/* ------------------------------------------------ */}

            <Field
              label="Required skills"
              htmlFor="skills"
              hint="Press Enter to add each skill"
            >
              <div className="relative">
                <Input
                  id="skills"
                  placeholder="e.g. DSA, DBMS, System Design"
                  value={skillInput}
                  onChange={(e) =>
                    setSkillInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />

                <AnimatePresence>
                  {skillInput.trim() && (
                    <motion.button
                      type="button"
                      initial={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                      }}
                      onClick={addSkill}
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-ink text-white transition-transform hover:scale-105"
                      aria-label="Add skill"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {skills.length > 0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                    }}
                    className="mt-3 flex flex-wrap gap-1.5 overflow-hidden"
                  >
                    {skills.map((skill) => (
                      <motion.div
                        key={skill}
                        initial={{
                          opacity: 0,
                          scale: 0.85,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.85,
                        }}
                        layout
                      >
                        <Badge
                          tone="ink"
                          className="gap-1 pr-1"
                        >
                          {skill}

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(skill)
                            }
                            className="rounded-full p-0.5 transition-colors hover:bg-ink/10"
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Field>

            {/* ------------------------------------------------ */}
            {/* Question source                                  */}
            {/* ------------------------------------------------ */}

            <Field
              label="Question source"
              htmlFor="questionSource"
            >
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-paper p-1">
                <button
                  type="button"
                  onClick={() =>
                    setQuestionSource("auto")
                  }
                  className={`relative rounded-md px-3 py-3 text-left transition-colors ${
                    questionSource === "auto"
                      ? "bg-ink text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />

                    <span className="text-sm font-medium">
                      AI-generated
                    </span>

                    {questionSource === "auto" && (
                      <Check className="ml-auto h-3.5 w-3.5" />
                    )}
                  </div>

                  <p
                    className={`mt-1 pl-6 text-[11px] leading-relaxed ${
                      questionSource === "auto"
                        ? "text-white/60"
                        : "text-muted"
                    }`}
                  >
                    Let HireLoop create the
                    interview questions.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setQuestionSource("custom")
                  }
                  className={`relative rounded-md px-3 py-3 text-left transition-colors ${
                    questionSource === "custom"
                      ? "bg-ink text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileIcon />

                    <span className="text-sm font-medium">
                      Custom questions
                    </span>

                    {questionSource === "custom" && (
                      <Check className="ml-auto h-3.5 w-3.5" />
                    )}
                  </div>

                  <p
                    className={`mt-1 pl-6 text-[11px] leading-relaxed ${
                      questionSource === "custom"
                        ? "text-white/60"
                        : "text-muted"
                    }`}
                  >
                    Provide your own interview
                    questions.
                  </p>
                </button>
              </div>
            </Field>

            {/* ------------------------------------------------ */}
            {/* Custom questions                                 */}
            {/* ------------------------------------------------ */}

            <AnimatePresence initial={false}>
              {questionSource === "custom" && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  className="overflow-hidden"
                >
                  <Field
                    label="Your questions"
                    htmlFor="customQuestions"
                    hint="One question per line"
                  >
                    <Textarea
                      id="customQuestions"
                      rows={5}
                      placeholder={
                        "What is database normalization?\nExplain the CAP theorem.\nHow would you optimize a slow API?"
                      }
                      value={customQuestions}
                      onChange={(e) =>
                        setCustomQuestions(
                          e.target.value
                        )
                      }
                    />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ------------------------------------------------ */}
          {/* Footer                                           */}
          {/* ------------------------------------------------ */}

          <div className="flex flex-col gap-3 border-t border-line bg-paper/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />

              <p className="max-w-md text-[11px] leading-relaxed text-muted">
                The drive will be saved as a draft.
                AI generation and live scoring will be
                connected once the interview engine is
                wired in.
              </p>
            </div>

              <div className="flex items-center justify-end gap-2">
                {error && (
                  <span className="text-xs text-signal">
                    {error}
                  </span>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    router.push(
                      "/dashboard/company"
                    )
                  }
                  disabled={submitting}
                >
                  Cancel
                </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    Save as draft
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.form>
      </main>
    </div>
  );
}

/* -------------------------------------------------- */
/* Small inline icon                                  */
/* -------------------------------------------------- */

function FileIcon() {
  return (
    <span className="flex h-4 w-4 items-center justify-center">
      <span className="h-3.5 w-2.5 rounded-[2px] border border-current" />
    </span>
  );
}

export default function NewDrivePage() {
  return (
    <AuthGuard role="company">
      <NewDriveContent />
    </AuthGuard>
  );
}