/**
 * 页面漂浮装饰：小星星、云朵、爱心、花朵与小动物
 * 固定在页面背景层，pointer-events 禁用，不影响交互。
 */
type DecorItem = {
  top: string;
  left: string;
  type: "star" | "heart" | "cloud" | "flower" | "cat" | "rabbit" | "bear";
  size: number;
  color?: string;
  duration?: string;
  delay?: string;
  opacity?: number;
};

const ITEMS: DecorItem[] = [
  { top: "12%", left: "5%", type: "star", size: 24, color: "#f9a8d4", duration: "9s" },
  { top: "18%", left: "88%", type: "cloud", size: 46, color: "#ffffff", duration: "11s" },
  { top: "70%", left: "3%", type: "heart", size: 26, color: "#fbcfe8", duration: "8s" },
  { top: "80%", left: "90%", type: "flower", size: 28, color: "#c4b5fd", duration: "10s" },
  { top: "40%", left: "95%", type: "star", size: 20, color: "#fde68a", duration: "7s" },
  { top: "8%", left: "45%", type: "rabbit", size: 26, duration: "12s", opacity: 0.7 },
  { top: "85%", left: "45%", type: "cat", size: 24, duration: "10s", opacity: 0.6 },
  { top: "55%", left: "8%", type: "cloud", size: 36, color: "#fff7ed", duration: "13s" },
  { top: "30%", left: "80%", type: "heart", size: 20, color: "#ddd6fe", duration: "9s" },
  { top: "65%", left: "82%", type: "bear", size: 26, duration: "11s", opacity: 0.6 },
];

function Shape({ item }: { item: DecorItem }) {
  const common = {
    width: item.size,
    height: item.size,
    opacity: item.opacity ?? 0.9,
  };

  if (item.type === "star") {
    return (
      <svg viewBox="0 0 24 24" fill={item.color} {...common}>
        <path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.5L12 16.3l-5.8 3.3 1.6-6.5L2.7 8.7l6.7-.5L12 2z" />
      </svg>
    );
  }
  if (item.type === "heart") {
    return (
      <svg viewBox="0 0 24 24" fill={item.color} {...common}>
        <path d="M12 21s-7.5-4.7-9.7-9C.8 8.6 2.7 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.3 0 5.2 3.6 3.7 7-2.2 4.3-9.7 9-9.7 9z" />
      </svg>
    );
  }
  if (item.type === "cloud") {
    return (
      <svg viewBox="0 0 64 40" fill={item.color} width={item.size * 1.6} height={item.size}>
        <path d="M50 40H18a12 12 0 0 1-2.5-23.7A16 16 0 0 1 46 14a14 14 0 0 1 4 26z" />
      </svg>
    );
  }
  if (item.type === "flower") {
    return (
      <svg viewBox="0 0 32 32" {...common}>
        <g fill={item.color}>
          <ellipse cx="16" cy="8" rx="5" ry="7" />
          <ellipse cx="16" cy="24" rx="5" ry="7" />
          <ellipse cx="8" cy="16" rx="7" ry="5" />
          <ellipse cx="24" cy="16" rx="7" ry="5" />
        </g>
        <circle cx="16" cy="16" r="5" fill="#fde68a" />
      </svg>
    );
  }

  const emoji: Record<string, string> = {
    cat: "🐱",
    rabbit: "🐰",
    bear: "🐻",
  };
  return (
    <span style={{ fontSize: item.size * 1.2, lineHeight: 1 }}>{emoji[item.type]}</span>
  );
}

export function FloatingDecor() {
  return (
    <div className="floating-decor" aria-hidden="true">
      {ITEMS.map((item, i) => (
        <span
          key={i}
          className="decor-item"
          style={{
            top: item.top,
            left: item.left,
            animationDuration: item.duration ?? "8s",
            animationDelay: item.delay ?? `${i * 0.35}s`,
          }}
        >
          <Shape item={item} />
        </span>
      ))}
    </div>
  );
}
