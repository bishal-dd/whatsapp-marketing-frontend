"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

/** A centred dialog (bottom sheet on phones). Escape and the backdrop close it unless `locked`. */
export function Modal({
  open,
  onClose,
  title,
  description,
  locked,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  locked?: boolean;
  /** lg: wide dialog with room for a side-by-side preview. */
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && !locked && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, locked, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !locked && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={`flex max-h-[92dvh] w-full ${size === "lg" ? "max-w-4xl" : "max-w-lg"} flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 id={id} className="font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close"
            className="grid size-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
