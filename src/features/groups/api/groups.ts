import { api, type Data } from "@/src/lib/api";
import type { Group } from "../types/group";

type Done<T> = Data<T> & { message: string };

export const listGroups = () => api<Data<Group[]>>("GET", "/groups");

/** Start a group with some contacts, or with everyone a send went to. */
export const createGroup = (input: {
  name: string;
  contactIds?: string[];
  campaignId?: string;
}) => api<Done<Group & { added: number }>>("POST", "/groups", input);

export const renameGroup = (id: string, name: string) =>
  api<Done<Group>>("PATCH", `/groups/${id}`, { name });

export const deleteGroup = (id: string) =>
  api<{ success: boolean; message: string }>("DELETE", `/groups/${id}`);

export const addToGroup = (id: string, contactIds: string[]) =>
  api<Done<{ added: number }>>("POST", `/groups/${id}/contacts`, {
    contactIds,
  });

export const removeFromGroup = (id: string, contactIds: string[]) =>
  api<Done<{ removed: number }>>("POST", `/groups/${id}/contacts/remove`, {
    contactIds,
  });

export const moveToGroup = (
  fromId: string,
  toGroupId: string,
  contactIds: string[],
) =>
  api<Done<{ moved: number }>>("POST", `/groups/${fromId}/contacts/move`, {
    contactIds,
    toGroupId,
  });
