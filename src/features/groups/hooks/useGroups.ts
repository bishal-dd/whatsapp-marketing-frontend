"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/src/lib/useOrgId";
import {
  addToGroup,
  createGroup,
  deleteGroup,
  listGroups,
  moveToGroup,
  removeFromGroup,
  renameGroup,
} from "../api/groups";

export function useGroups() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["groups", orgId],
    queryFn: listGroups,
    select: (r) => r.data,
    enabled: !!orgId,
  });
}

/** Group changes move people in and out of filtered lists and send counts. */
function useRefresh() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return () => {
    qc.invalidateQueries({ queryKey: ["groups", orgId] });
    qc.invalidateQueries({ queryKey: ["contacts", orgId] });
    qc.invalidateQueries({ queryKey: ["preview", orgId] });
  };
}

export function useCreateGroup() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: createGroup, onSuccess: refresh });
}

export function useRenameGroup() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      renameGroup(id, name),
    onSuccess: refresh,
  });
}

export function useDeleteGroup() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: refresh,
  });
}

/** Add, move (out of `fromId` into `toId`) or remove, in one hook for the dialog. */
export function useChangeMembership() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (
      a:
        | { kind: "add"; toId: string; contactIds: string[] }
        | { kind: "move"; fromId: string; toId: string; contactIds: string[] }
        | { kind: "remove"; fromId: string; contactIds: string[] },
    ): Promise<{
      message: string;
      data: { added?: number; moved?: number; removed?: number };
    }> =>
      a.kind === "add"
        ? addToGroup(a.toId, a.contactIds)
        : a.kind === "move"
          ? moveToGroup(a.fromId, a.toId, a.contactIds)
          : removeFromGroup(a.fromId, a.contactIds),
    onSuccess: refresh,
  });
}
