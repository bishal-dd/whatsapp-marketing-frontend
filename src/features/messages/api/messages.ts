import { api, type Data, type Paged } from "@/src/lib/api";
import type { Message, MessageStatus } from "../types/message";

/** Messages you sent, newest first, one page at a time. */
export const listMessages = (page = 1, limit = 10) =>
  api<Paged<Message>>(
    "GET",
    `/messages?direction=out&page=${page}&limit=${limit}`,
  );

/** How many sent messages are in each status, across all of them. */
export const messageSummary = () =>
  api<Data<Partial<Record<MessageStatus, number>>>>("GET", "/messages/summary");
