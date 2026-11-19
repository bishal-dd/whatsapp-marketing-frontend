"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/src/lib/useOrgId";
import { checkAccount, getAccount, saveAccount } from "../api/account";
import type { SaveAccountInput } from "../types/account";

export function useAccount() {
  const orgId = useOrgId();
  return useQuery({ queryKey: ["account", orgId], queryFn: getAccount, select: (r) => r.data, enabled: !!orgId });
}

export function useSaveAccount() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({ mutationFn: (i: SaveAccountInput) => saveAccount(i), onSuccess: (r) => qc.setQueryData(["account", orgId], r) });
}

export function useCheckAccount() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({ mutationFn: checkAccount, onSuccess: () => qc.invalidateQueries({ queryKey: ["account", orgId] }) });
}
