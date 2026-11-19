"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useCompany } from "../hooks/useCompany";
import { NumberBadge } from "@/src/features/settings/ui/NumberBadge";
import { Logo } from "@/src/shared/ui/Logo";

/** Signed-in frame: top bar with the logo, the sending number and sign-out. Sends people where they belong. */
export function AppShell({ children }: { children: ReactNode }) {
  const c = useCompany();
  const router = useRouter();

  useEffect(() => {
    if (c.loading) return;
    if (!c.session) router.replace("/sign-in");
    else if (c.companies.length === 0) router.replace("/onboarding");
  }, [c.loading, c.session, c.companies.length, router]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <Link
            href="/dashboard"
            aria-label="WhatsApp Marketing home"
            className="rounded-xl"
          >
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <NumberBadge />
            <span className="hidden max-w-48 truncate text-sm text-ink-soft lg:block">
              {c.user?.email}
            </span>
            <button
              type="button"
              onClick={c.signOut}
              aria-label="Sign out"
              className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
      {c.error && (
        <p className="mx-auto max-w-7xl px-6 pt-4 text-sm text-red-700">
          {c.error}
        </p>
      )}
      <main className="mx-auto max-w-7xl px-4 pb-36 pt-6 sm:px-6 sm:pt-8">
        {/* Always render children: each page gates itself with <CompanyGate>. */}
        {children}
      </main>
    </div>
  );
}
