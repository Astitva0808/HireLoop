"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentFeedbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/feedback");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted">Redirecting to feedback...</p>
    </main>
  );
}
