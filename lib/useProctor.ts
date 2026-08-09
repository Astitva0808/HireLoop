"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseProctorOptions {
  sessionId: string;
  enabled?: boolean;
  onSecondViolation?: (sessionId: string) => void;
}

export interface UseProctorReturn {
  violationCount: number;
  warningVisible: boolean;
  isSuspended: boolean;
  dismissWarning: () => void;
}

export function useProctor({
  sessionId,
  enabled = true,
  onSecondViolation,
}: UseProctorOptions): UseProctorReturn {
  const [violationCount, setViolationCount] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const countRef = useRef(0);

  const dismissWarning = useCallback(() => {
    setWarningVisible(false);
  }, []);

  useEffect(() => {
    if (!enabled || isSuspended) return;

    function handleViolation() {
      countRef.current += 1;
      setViolationCount(countRef.current);

      if (countRef.current === 1) {
        setWarningVisible(true);
      } else if (countRef.current >= 2) {
        setIsSuspended(true);
        setWarningVisible(false);
        onSecondViolation?.(sessionId);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        handleViolation();
      }
    }

    function handleBlur() {
      if (document.visibilityState === "hidden") {
        handleViolation();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, isSuspended, sessionId, onSecondViolation]);

  return {
    violationCount,
    warningVisible,
    isSuspended,
    dismissWarning,
  };
}
