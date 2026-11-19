"use client";

import type { ReactNode } from "react";
import { authClient } from "@/src/lib/auth-client";

/**
 * Shows the page only once someone is signed in and a company is active.
 * It lives inside each page (not the layout) so the layout always renders
 * {children}, which Next.js needs to check instant navigation.
 * Redirects to sign-in / onboarding are handled by AppShell.
 */
export function CompanyGate({ children }: { children: ReactNode }) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: active, isPending: activePending } = authClient.useActiveOrganization();

  const ready = !sessionPending && !activePending && !!session && !!active;
  if (!ready) return <div className="h-96 animate-pulse rounded-2xl bg-mist" aria-label="Loading" />;
  return <>{children}</>;
}
