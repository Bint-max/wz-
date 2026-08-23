"use client";

/**
 * 卡哇伊鼠标特效
 * - 鼠标移动时生成彩色泡泡轨迹
 * - 自定义圆形光标 + 拖尾
 * - 点击时产生小星星爆炸
 * 注意：使用 requestAnimationFrame 与数量上限优化性能，
 *       在触屏 / 减少动态效果偏好下自动禁用。
 */
import { useEffect, useRef } from "react";

const BUBBLE_COLORS = [
  "hsl(330 85% 75% / 0.75)",  // 粉
  "hsl(200 90% 72% / 0.75)",  // 蓝
  "hsl(270 80% 78% / 0.75)",  // 紫
  "hsl(45 95% 68% / 0.75)",   // 黄
  "hsl(160 60% 72% / 0.75)",  // 绿
];

const MAX_BUBBLES = 26;
const BUBBLE_INTERVAL = 36; // ms，节流生成泡泡

export function BubbleCursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.body.classList.add("kawaii-cursor-active");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursor = { x: target.x, y: target.y };
    const trail = { x: target.x, y: target.y };
    const active = new Set<HTMLElement>();
    let raf = 0;
    let lastBubble = 0;

    const spawnBubble = (x: number, y: number) => {
      if (active.size >= MAX_BUBBLES) return;
      const el = document.createElement("div");
      el.className = "kawaii-bubble";
      const size = 6 + Math.random() * 24; // 5px ~ 30px
      const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
      const dx = (Math.random() - 0.5) * 40; // 左右轻微飘散
      el.style.left = `${x - size / 2}px`;
      el.style.top = `${y - size / 2}px`;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background = color;
      el.style.setProperty("--bubble-dx", `${dx}px`);
      el.style.animationDuration = `${1 + Math.random() * 1.3}s`;
      wrapperRef.current?.appendChild(el);
      active.add(el);

      const cleanup = () => {
        el.remove();
        active.delete(el);
      };
      el.addEventListener("animationend", cleanup, { once: true });
      window.setTimeout(cleanup, 2600); // 兜底清理，防止事件丢失
    };

    const burst = (x: number, y: number) => {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const star = document.createElement("span");
        star.className = "kawaii-star";
        star.textContent = Math.random() > 0.5 ? "✦" : "★";
        star.style.left = `${x}px`;
        star.style.top = `${y}px`;
        star.style.fontSize = `${8 + Math.random() * 14}px`;
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
        const dist = 30 + Math.random() * 40;
        star.style.setProperty("--star-dx", `${Math.cos(angle) * dist}px`);
        star.style.setProperty("--star-dy", `${Math.sin(angle) * dist}px`);
        star.style.animationDelay = `${Math.random() * 0.05}s`;
        wrapperRef.current?.appendChild(star);
        window.setTimeout(() => star.remove(), 850);
      }
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const now = performance.now();
      if (now - lastBubble > BUBBLE_INTERVAL && active.size < MAX_BUBBLES) {
        spawnBubble(e.clientX, e.clientY);
        lastBubble = now;
      }
    };

    const onClick = (e: MouseEvent) => burst(e.clientX, e.clientY);

    const loop = () => {
      cursor.x += (target.x - cursor.x) * 0.4;
      cursor.y += (target.y - cursor.y) * 0.4;
      trail.x += (target.x - trail.x) * 0.16;
      trail.y += (target.y - trail.y) * 0.16;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      document.body.classList.remove("kawaii-cursor-active");
      active.forEach((el) => el.remove());
      active.clear();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="kawaii-fx" aria-hidden="true">
      <div ref={trailRef} className="kawaii-cursor-trail" />
      <div ref={cursorRef} className="kawaii-cursor" />
    </div>
  );
}
