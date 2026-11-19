"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/src/lib/auth-client";

/** The company this browser used last, so people in several companies return to it. */
const LAST_KEY = "wam:lastCompany";
const readLast = () => {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
};
const remember = (id: string) => {
  try {
    localStorage.setItem(LAST_KEY, id);
  } catch {
    /* not critical */
  }
};

/**
 * Session, the active company (a Better Auth organization), switching and
 * sign-out. Same pattern as HMT's useAgencyDashboard.
 */
export function useCompany() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: active, isPending: activePending } = authClient.useActiveOrganization();
  const { data: companies, isPending: listPending } = authClient.useListOrganizations();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function switchCompany(organizationId: string) {
    if (!organizationId || organizationId === active?.id) return;
    setError(null);
    setSwitching(true);
    const { error } = await authClient.organization.setActive({ organizationId });
    setSwitching(false);
    if (error) return setError(error.message ?? "Couldn't switch company.");
    remember(organizationId);
    // Never show the previous company's data.
    await queryClient.resetQueries();
  }

  useEffect(() => {
    if (active?.id) remember(active.id);
  }, [active?.id]);

  // Signed in with companies but none active (e.g. older session): pick the last used one.
  const tried = useRef<string | null>(null);
  useEffect(() => {
    if (sessionPending || activePending || listPending || !session || active || switching || !companies?.length) return;
    if (tried.current === session.session.id) return;
    tried.current = session.session.id;
    const last = readLast();
    void switchCompany((companies.find((c) => c.id === last) ?? companies[0])!.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, active, companies, sessionPending, activePending, listPending, switching]);

  async function signOut() {
    await authClient.signOut();
    queryClient.clear();
    router.replace("/sign-in");
  }

  const members = (active as { members?: { userId: string; role: string }[] } | null)?.members;
  const role = members?.find((m) => m.userId === session?.user.id)?.role ?? null;

  return {
    session,
    user: session?.user ?? null,
    active: active ?? null,
    companies: companies ?? [],
    role,
    loading: sessionPending || listPending || (!!session && !!companies?.length && (activePending || !active)),
    switching,
    error,
    switchCompany,
    signOut,
  };
}

export type CompanyState = ReturnType<typeof useCompany>;
