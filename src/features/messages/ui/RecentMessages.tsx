"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import { formatDateTime } from "@/src/lib/format";
import { Avatar } from "@/src/shared/ui/Step";
import { useMessageSummary, useRecentMessages } from "../hooks/useMessages";
import type { Message, MessageStatus } from "../types/message";

const PAGE = 10;

/** WhatsApp's own ticks: clock waiting, ✓ sent, ✓✓ delivered, blue ✓✓ read. */
function Ticks({ m }: { m: Message }) {
  switch (m.status) {
    case "queued":
    case "sending":
      return <Clock size={15} className="text-ink-soft" aria-hidden="true" />;
    case "accepted":
    case "sent":
      return <Check size={16} className="text-ink-soft" aria-hidden="true" />;
    case "delivered":
      return (
        <CheckCheck size={16} className="text-ink-soft" aria-hidden="true" />
      );
    case "read":
      return (
        <CheckCheck size={16} className="text-sky-500" aria-hidden="true" />
      );
    case "failed":
    case "cancelled":
      return <XCircle size={15} className="text-red-600" aria-hidden="true" />;
    case "received":
      return (
        <ArrowDownLeft
          size={15}
          className="text-lagoon-deep"
          aria-hidden="true"
        />
      );
    default:
      return null;
  }
}

const LABEL: Record<Message["status"], string> = {
  queued: "Waiting",
  sending: "Sending",
  accepted: "Sent",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Didn't arrive",
  cancelled: "Not sent",
  received: "Replied",
};

/** WhatsApp's error codes, said plainly with what to do about them. */
const EXPLAIN: Record<number, string> = {
  131026: "This number isn't on WhatsApp, or they're on an old version.",
  131030:
    "Meta's test number can only message numbers you've added in the developer dashboard.",
  131042:
    "WhatsApp needs a payment method on your account. Add one in WhatsApp Manager.",
  131047:
    "More than 24 hours since they last wrote, so only an approved message can be sent.",
  131049:
    "WhatsApp held it back so this person doesn't get too many promotions. Try again later.",
  131050: "They've stopped promotional messages from businesses in WhatsApp.",
  131056: "Too many messages to this person in a short time. It'll be retried.",
  131058:
    "Hello world can only be sent from Meta's test number. Use one of your own messages.",
  132001:
    "This message isn't approved for your number. Press Refresh in step 2.",
  132012: "The blanks didn't match what WhatsApp expects for this message.",
  133010: "Your WhatsApp number isn't registered yet.",
};

function reason(m: Message) {
  if (!m.error) return null;
  return (
    (m.error.code && EXPLAIN[m.error.code]) ||
    [m.error.title, m.error.detail].filter(Boolean).join(": ") ||
    "WhatsApp didn't say why."
  );
}

/** Group the per-status counts the way the summary shows them. */
const tally = (c: Partial<Record<MessageStatus, number>> = {}) => ({
  waiting:
    (c.queued ?? 0) + (c.sending ?? 0) + (c.accepted ?? 0) + (c.sent ?? 0),
  delivered: c.delivered ?? 0,
  read: c.read ?? 0,
  failed: (c.failed ?? 0) + (c.cancelled ?? 0),
});

/** Messages you sent, 10 per page, with counts for all of them. Refreshes while any are on their way. */
export function RecentMessages() {
  const [page, setPage] = useState(1);
  const { data, isPending, error, isPlaceholderData } = useRecentMessages(
    page,
    PAGE,
  );
  const { data: counts } = useMessageSummary();
  const rows = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const pages = data?.pagination.totalPages ?? 1;
  const t = tally(counts);

  return (
    <section
      id="sent"
      aria-labelledby="sent-title"
      className="scroll-mt-24 rounded-[1.25rem] border border-line bg-white"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 p-5 sm:p-6">
        <div>
          <h2
            id="sent-title"
            className="text-xl font-semibold tracking-tight text-ink"
          >
            Sent messages
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            Newest first. This updates by itself while messages are on their
            way.
          </p>
        </div>
        {total > 0 && (
          <dl className="flex gap-5 text-sm">
            {(
              [
                ["Waiting", t.waiting, "text-ink"],
                ["Delivered", t.delivered, "text-ink"],
                ["Read", t.read, "text-sky-600"],
                [
                  "Didn't arrive",
                  t.failed,
                  t.failed ? "text-red-700" : "text-ink",
                ],
              ] as const
            ).map(([label, n, cls]) => (
              <div key={label}>
                <dt className="text-ink-soft">{label}</dt>
                <dd className={`text-xl font-semibold tabular-nums ${cls}`}>
                  {n}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {isPending ? (
        <div className="space-y-1 border-t border-line p-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-mist/70" />
          ))}
        </div>
      ) : error ? (
        <p className="border-t border-line p-6 text-sm text-red-700">
          {error.message}
        </p>
      ) : rows.length === 0 ? (
        <p className="border-t border-line px-6 py-10 text-center text-sm text-ink-soft">
          Nothing sent yet. Messages you send show up here with their ticks.
        </p>
      ) : (
        <ul
          className={`divide-y divide-line border-t border-line transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
        >
          {rows.map((m) => {
            const failed = m.status === "failed" || m.status === "cancelled";
            const why = failed ? reason(m) : null;
            return (
              <li
                key={m.id}
                className="flex items-start gap-3 px-5 py-2.5 sm:px-6"
              >
                <Avatar
                  name={m.contact.name}
                  phone={m.contact.phone}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate font-medium text-ink">
                      {m.contact.name || m.contact.phone}
                    </span>
                    {m.contact.name && (
                      <span className="hidden shrink-0 text-sm text-ink-soft sm:inline">
                        {m.contact.phone}
                      </span>
                    )}
                    <span
                      className={`ml-auto flex shrink-0 items-center gap-1 text-xs font-medium ${failed ? "text-red-700" : m.status === "read" ? "text-sky-600" : "text-ink-soft"}`}
                    >
                      <Ticks m={m} /> {LABEL[m.status] ?? m.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <p
                      className="min-w-0 flex-1 truncate text-sm text-ink-soft"
                      title={m.body ?? undefined}
                    >
                      {m.body}
                    </p>
                    <span className="shrink-0 text-xs tabular-nums text-ink-soft">
                      {formatDateTime(m.createdAt)}
                    </span>
                  </div>
                  {why && <p className="mt-1 text-sm text-red-700">{why}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {total > PAGE && (
        <div className="flex min-h-12 items-center justify-between gap-3 border-t border-line px-5 text-sm text-ink-soft sm:px-6">
          <span className="tabular-nums">
            {(page - 1) * PAGE + 1}–{Math.min(page * PAGE, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Newer messages"
              className="grid size-9 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-14 text-center tabular-nums">
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Older messages"
              className="grid size-9 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
