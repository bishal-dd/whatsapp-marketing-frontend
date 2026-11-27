export interface Contact {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  tags: string[];
  attributes: Record<string, string>;
  optedInAt: string | null;
  optInSource: string | null;
  optedOutAt: string | null;
  subscribed: boolean;
  /** Free text allowed until then (24h after their last message). */
  windowOpenUntil: string | null;
  createdAt: string;
  /** Groups they're in (ids). Only in lists. */
  groupIds?: string[];
}

export type ContactStatus =
  | "all"
  | "subscribed"
  | "unsubscribed"
  | "no_consent";

export interface NewContact {
  phone: string;
  name?: string | null;
  tags?: string[];
  optIn: boolean;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: { row: number; value: string; reason: string }[];
  skippedCount: number;
}
