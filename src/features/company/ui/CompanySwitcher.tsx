"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import type { CompanyState } from "../hooks/useCompany";

const ROLE: Record<string, string> = { owner: "Owner", admin: "Admin", member: "Member" };

export function CompanySwitcher({ c }: { c: CompanyState }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!c.active) return <div className="h-9 w-40 animate-pulse rounded-xl bg-mist" />;
  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 max-w-full items-center gap-2 rounded-xl px-2.5 text-left hover:bg-mist"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-lagoon-tint text-sm font-bold text-lagoon-deep">
          {c.active.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{c.active.name}</span>
          <span className="block text-[11px] leading-tight text-ink-soft">{c.switching ? "Switching…" : (c.role && ROLE[c.role.split(",")[0]!]) || "Company"}</span>
        </span>
        <ChevronDown size={15} className="shrink-0 text-ink-soft" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-30 w-64 rounded-xl border border-line bg-white p-1.5 shadow-lg">
          <ul role="listbox" aria-label="Companies" className="max-h-72 overflow-y-auto">
            {c.companies.map((co) => (
              <li key={co.id} role="option" aria-selected={co.id === c.active?.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void c.switchCompany(co.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-mist"
                >
                  <Building2 size={15} className="shrink-0 text-ink-soft" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{co.name}</span>
                  {co.id === c.active?.id && <Check size={15} className="text-lagoon-deep" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
          <Link href="/onboarding" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 border-t border-line px-2.5 pb-1.5 pt-2.5 text-sm font-medium text-lagoon-deep">
            <Plus size={15} aria-hidden="true" /> Add a company
          </Link>
        </div>
      )}
    </div>
  );
}
