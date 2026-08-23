"use client";

/**
 * 访问统计上报（页面加载后调用一次）
 */
import { useEffect, useRef } from "react";

export function VisitTracker() {
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    fetch("/api/visit", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
