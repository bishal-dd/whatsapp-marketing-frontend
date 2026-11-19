import { api, type Data, type Paged } from "@/src/lib/api";
import type { Contact, ContactStatus, ImportResult, NewContact } from "../types/contact";

export const listContacts = (q: { search?: string; status: ContactStatus; page: number; limit: number }) => {
  const p = new URLSearchParams({ status: q.status, page: String(q.page), limit: String(q.limit) });
  if (q.search) p.set("search", q.search);
  return api<Paged<Contact>>("GET", `/contacts?${p}`);
};
export const addContact = (input: NewContact) => api<Data<Contact>>("POST", "/contacts", input);
export const deleteContact = (id: string) => api<{ success: boolean }>("DELETE", `/contacts/${id}`);
export const setSubscription = (id: string, subscribed: boolean) => api<Data<Contact>>("POST", `/contacts/${id}/subscription`, { subscribed });
export const importContacts = (input: { csv: string; optIn: boolean; tags?: string[] }) =>
  api<Data<ImportResult> & { message: string }>("POST", "/contacts/import", { ...input, optInSource: "CSV import" });
