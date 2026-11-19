"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOrgId } from "@/src/lib/useOrgId";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  syncTemplates,
} from "../api/templates";
import type { NewTemplate } from "../types/template";

export function useTemplates() {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["templates", orgId],
    queryFn: listTemplates,
    select: (r) => r.data,
    enabled: !!orgId,
  });
}

export function useSyncTemplates() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: syncTemplates,
    onSuccess: (r) => qc.setQueryData(["templates", orgId], r),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: (input: NewTemplate) => createTemplate(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates", orgId] }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates", orgId] }),
  });
}
