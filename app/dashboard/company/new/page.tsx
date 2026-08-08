"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { Field, Input, Textarea } from "@/components/Input";
import { Badge } from "@/components/Badge";
import { useAuth } from "@/lib/auth";
import { createDrive } from "@/lib/store";
import type { QuestionSource } from "@/lib/types";

function NewDriveContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [questionSource, setQuestionSource] =
    useState<QuestionSource>("auto");
  const [customQuestions, setCustomQuestions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    createDrive({
      companyId: user.id,
      companyName: user.companyName ?? user.name,
      title,
      role,
      requiredSkills: skills,
      questionSource,
      status: "draft",
    });

    router.push("/dashboard/company");
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink">
          New interview drive
        </h1>
        <p className="mt-1 text-sm text-muted">
          Define what you&apos;re hiring for. Question generation and live
          scoring connect once the AI engine is wired in — for now this
          saves the drive as a draft.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-5 rounded-xl border border-line bg-surface p-6"
        >
          <Field label="Drive title" htmlFor="title" hint="Shown to candidates">
            <Input
              id="title"
              required
              placeholder="SDE Intern — Backend"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field label="Role" htmlFor="role">
            <Input
              id="role"
              required
              placeholder="Software Development Engineer Intern"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </Field>

          <Field
            label="Required skills"
            htmlFor="skills"
            hint="Press Enter to add each skill"
          >
            <Input
              id="skills"
              placeholder="e.g. DSA, DBMS, System Design"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge key={skill} tone="ink" className="gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="rounded-full p-0.5 hover:bg-ink/10"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Field>

          <Field label="Question source" htmlFor="questionSource">
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-paper p-1">
              {(["auto", "custom"] as QuestionSource[]).map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setQuestionSource(source)}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${
                    questionSource === source
                      ? "bg-ink text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {source === "auto" ? "AI-generated" : "I'll provide my own"}
                </button>
              ))}
            </div>
          </Field>

          {questionSource === "custom" && (
            <Field
              label="Your questions"
              htmlFor="customQuestions"
              hint="One question per line — wiring this into the question bank comes later"
            >
              <Textarea
                id="customQuestions"
                rows={4}
                placeholder={"What is database normalization?\nExplain the CAP theorem."}
                value={customQuestions}
                onChange={(e) => setCustomQuestions(e.target.value)}
              />
            </Field>
          )}

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/dashboard/company")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : "Save as draft"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewDrivePage() {
  return (
    <AuthGuard role="company">
      <NewDriveContent />
    </AuthGuard>
  );
}
