"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useOrgId } from "@/src/lib/useOrgId";
import { listMessages, messageSummary } from "../api/messages";

const ACTIVE = new Set(["queued", "sending", "accepted", "sent"]);

/** One page of sent messages. Refreshes every 4s while something on it is still on its way. */
export function useRecentMessages(page: number, limit = 10) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["messages", orgId, "list", page, limit],
    queryFn: () => listMessages(page, limit),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
    refetchInterval: (q) =>
      q.state.data?.data.some((m) => ACTIVE.has(m.status)) ? 4000 : false,
  });
}

/** Counts per status for the summary. Refreshes while anything is still on its way. */
export function useMessageSummary() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["messages", orgId, "summary"],
    queryFn: messageSummary,
    select: (r) => r.data,
    enabled: !!orgId,
    refetchInterval: (q) => {
      const c = q.state.data?.data;
      return c && (c.queued || c.sending) ? 4000 : 15000;
    },
  });
}
