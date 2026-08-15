"use client";

import { useEffect, useRef } from "react";

/** When Ably is live: slow safety-net poll. When offline: backoff 1s → 3s → 10s. */
export function useBackupPoll(enabled: boolean, live: boolean, tick: () => Promise<void>) {
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let timer = 0;
    let delay = live ? 20_000 : 1_000;

    const schedule = (ms: number) => {
      timer = window.setTimeout(run, ms);
    };

    const run = async () => {
      try {
        await tickRef.current();
        if (!alive) return;
        if (live) {
          delay = 20_000;
        } else if (delay < 3_000) {
          delay = 3_000;
        } else {
          delay = 10_000;
        }
      } catch {
        if (!alive) return;
        delay = live ? 20_000 : 1_000;
      }
      if (alive) schedule(delay);
    };

    schedule(live ? 20_000 : 1_000);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [enabled, live]);
}
