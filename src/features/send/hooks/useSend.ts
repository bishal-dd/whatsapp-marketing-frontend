"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/src/lib/useOrgId";
import { previewSend, sendNow } from "../api/send";
import type { SendInput } from "../types/send";

/** Debounce so typing a variable doesn't fire a request per key. */
function useDebounced<T>(value: T, ms = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Who'd get it, what it looks like and roughly what it costs. Null input = nothing to preview. */
export function usePreview(input: SendInput | null) {
  const orgId = useOrgId();
  const debounced = useDebounced(input);
  return useQuery({
    queryKey: ["preview", orgId, debounced],
    queryFn: () => previewSend(debounced!),
    select: (r) => r.data,
    enabled: !!orgId && !!debounced,
    retry: false,
  });
}

export function useSendNow() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: ({ input, name }: { input: SendInput; name: string }) =>
      sendNow(input, name),
    onSuccess: () => {
      // The worker starts within a second; start polling the log.
      setTimeout(
        () => qc.invalidateQueries({ queryKey: ["messages", orgId] }),
        1500,
      );
    },
  });
}
