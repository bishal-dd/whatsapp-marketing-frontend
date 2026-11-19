import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export const inputCls =
  "h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-lagoon-deep focus:ring-2 focus:ring-lagoon-deep/15 focus-visible:outline-none disabled:bg-mist";

/** inputCls without w-full, for inputs sized with their own width. */
export const sizedInputCls = inputCls.replace(/\bw-full\b/, "").trim();

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

const VARIANTS = {
  primary: "bg-lagoon-deep text-white hover:bg-ink",
  secondary: "bg-white text-ink ring-1 ring-inset ring-line hover:ring-ink/40",
  ghost: "text-ink-soft hover:bg-mist hover:text-ink",
  danger: "bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANTS; size?: "sm" | "md"; loading?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:opacity-50 ${
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"
      } ${VARIANTS[variant]} ${className}`}
    >
      {loading && <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function ErrorText({ error }: { error: unknown }) {
  if (!error) return null;
  return <p className="text-sm text-red-700">{error instanceof Error ? error.message : "Something went wrong"}</p>;
}

export function Card({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-line bg-white ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {title && <h2 className="font-semibold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
