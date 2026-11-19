import type { ReactNode } from "react";

/** A numbered step of the send flow: 1 who, 2 what, 3 send. */
export function StepHeading({ n, title, hint, action }: { n: number; title: string; hint?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-ink/15 text-sm font-semibold tabular-nums text-ink">{n}</span>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-1.5">{action}</div>}
    </div>
  );
}

/** Two initials on a soft colour picked from the name, so the same person always looks the same. */
const TONES = ["bg-lagoon-tint text-lagoon-deep", "bg-marigold-tint text-[#7a5200]", "bg-[#e3e8f4] text-[#2d4373]", "bg-[#f3e3e6] text-[#7a2e3d]", "bg-mist text-ink"];
export function Avatar({ name, phone, size = "md" }: { name: string | null; phone: string; size?: "sm" | "md" }) {
  const key = name || phone;
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const initials = name
    ? name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join("")
    : phone.replace(/\D/g, "").slice(-2);
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-semibold tabular-nums ${size === "sm" ? "size-8 text-xs" : "size-10 text-sm"} ${TONES[h % TONES.length]}`}
    >
      {initials}
    </span>
  );
}
