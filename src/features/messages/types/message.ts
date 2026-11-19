export type MessageStatus = "queued" | "sending" | "accepted" | "sent" | "delivered" | "read" | "failed" | "cancelled" | "received";

export interface Message {
  id: string;
  contactId: string;
  campaignId: string | null;
  direction: "in" | "out";
  type: string;
  template: { name: string; language: string } | null;
  body: string | null;
  status: MessageStatus;
  error: { code: number | null; title: string | null; detail: string | null } | null;
  source: string;
  createdAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  contact: { phone: string; name: string | null };
}
