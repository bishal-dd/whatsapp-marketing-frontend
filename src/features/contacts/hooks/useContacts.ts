"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useOrgId } from "@/src/lib/useOrgId";
import {
  addContact,
  deleteContact,
  deleteContacts,
  importContacts,
  listContacts,
  setSubscription,
  type ContactQuery,
} from "../api/contacts";
import type { NewContact } from "../types/contact";

export function useContacts(q: ContactQuery) {
  const orgId = useOrgId();
  return useQuery({
    queryKey: ["contacts", orgId, q],
    queryFn: () => listContacts(q),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
  });
}

function useRefresh() {
  const qc = useQueryClient();
  const orgId = useOrgId();
  return () => {
    qc.invalidateQueries({ queryKey: ["contacts", orgId] });
    qc.invalidateQueries({ queryKey: ["preview", orgId] });
    qc.invalidateQueries({ queryKey: ["groups", orgId] });
  };
}

export function useAddContact() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: NewContact) => addContact(input),
    onSuccess: refresh,
  });
}
export function useDeleteContact() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: refresh,
  });
}
export function useDeleteContacts() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (ids: string[]) => deleteContacts(ids),
    onSuccess: refresh,
  });
}
export function useSetSubscription() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, subscribed }: { id: string; subscribed: boolean }) =>
      setSubscription(id, subscribed),
    onSuccess: refresh,
  });
}
export function useImportContacts() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: importContacts, onSuccess: refresh });
}
