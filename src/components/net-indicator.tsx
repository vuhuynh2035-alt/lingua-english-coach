"use client";

import { useEffect, useState } from "react";
import { NetState, subscribeNetActivity } from "@/lib/net-activity";

/** Seconds since `since`, updating every half second. */
export function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.floor((now - since) / 1000));
  return seconds >= 1 ? <span className="net-elapsed">{seconds}s</span> : null;
}

/**
 * A bar across the top and a small notice while the app waits for the network, so a slow
 * connection never looks like a frozen app (and nobody taps again "to make it work").
 */
export function NetIndicator() {
  const [state, setState] = useState<NetState>({ active: 0, since: null });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => subscribeNetActivity(setState), []);
  useEffect(() => {
    if (!state.active) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [state.active]);

  // Quick requests do not flash anything.
  const waited = state.since ? now - state.since : 0;
  if (!state.active || waited < 500) return null;
  const seconds = Math.floor(waited / 1000);
  const slow = seconds >= 8;
  return (
    <>
      <div className="net-bar" role="progressbar" aria-label="Đang tải dữ liệu" />
      <div className={`net-chip${slow ? " slow" : ""}`} role="status" aria-live="polite">
        <span className="net-dot" aria-hidden="true" />
        {slow
          ? <>Mạng chậm — đang chờ phản hồi ({seconds}s). Vui lòng đợi, không cần bấm lại.</>
          : <>Đang tải{seconds ? ` · ${seconds}s` : "…"}</>}
      </div>
    </>
  );
}
