import { api, type Data, type Paged } from "@/src/lib/api";
import type { GroupFilter } from "@/src/features/groups/types/group";
import type {
  Contact,
  ContactStatus,
  ImportResult,
  NewContact,
} from "../types/contact";

export type ContactQuery = {
  search?: string;
  status: ContactStatus;
  group?: GroupFilter;
  page: number;
  limit: number;
};

export const listContacts = (q: ContactQuery) => {
  const p = new URLSearchParams({
    status: q.status,
    page: String(q.page),
    limit: String(q.limit),
  });
  if (q.search) p.set("search", q.search);
  if (q.group && q.group !== "all") p.set("group", q.group);
  return api<Paged<Contact>>("GET", `/contacts?${p}`);
};
export const addContact = (input: NewContact) =>
  api<Data<Contact>>("POST", "/contacts", input);
export const deleteContact = (id: string) =>
  api<{ success: boolean }>("DELETE", `/contacts/${id}`);
export const deleteContacts = (contactIds: string[]) =>
  api<Data<{ deleted: number }> & { message: string }>(
    "POST",
    "/contacts/bulk-delete",
    { contactIds },
  );
export const setSubscription = (id: string, subscribed: boolean) =>
  api<Data<Contact>>("POST", `/contacts/${id}/subscription`, { subscribed });
export const importContacts = (input: {
  csv: string;
  optIn: boolean;
  tags?: string[];
}) =>
  api<Data<ImportResult> & { message: string }>("POST", "/contacts/import", {
    ...input,
    optInSource: "CSV import",
  });
