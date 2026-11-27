"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCan } from "@/src/lib/useCan";
import { plural } from "@/src/lib/format";
import { Button, inputCls, sizedInputCls } from "@/src/shared/ui/FormBits";
import { Modal } from "@/src/shared/ui/Modal";
import { StepHeading } from "@/src/shared/ui/Step";
import { WhatsAppChat, WithBlanks } from "@/src/shared/ui/WhatsAppChat";
import type { Audience } from "@/src/features/contacts/ui/ContactsPanel";
import { useAccount } from "@/src/features/settings/hooks/useAccount";
import {
  useDeleteTemplate,
  useSyncTemplates,
  useTemplates,
} from "@/src/features/templates/hooks/useTemplates";
import type { Template } from "@/src/features/templates/types/template";
import { usePreview, useSendNow } from "../hooks/useSend";
import type { Preview, SendInput, VariableSource } from "../types/send";
import { NewTemplateDialog } from "../../templates/ui/NewTemplateDialog";
import { useGroups } from "@/src/features/groups/hooks/useGroups";
import type { GroupFilter } from "@/src/features/groups/types/group";
import {
  PutInGroupDialog,
  sentGroupName,
} from "@/src/features/groups/ui/PutInGroupDialog";

type VarChoice = {
  kind: "first_name" | "name" | "phone" | "text";
  value: string;
};

const toSource = (v: VarChoice): VariableSource =>
  v.kind === "text"
    ? { type: "text", value: v.value.trim() }
    : {
        type: "field",
        field: v.kind,
        ...(v.value.trim() ? { fallback: v.value.trim() } : {}),
      };

const defaults = (n: number): VarChoice[] =>
  Array.from({ length: n }, (_, i) =>
    i === 0
      ? { kind: "first_name", value: "there" }
      : { kind: "text", value: "" },
  );

/** "welcome_message" → "Welcome message" */
export const templateTitle = (name: string) => {
  const s = name.replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const CATEGORY: Record<string, { label: string; cls: string }> = {
  UTILITY: { label: "Update", cls: "bg-lagoon-tint text-lagoon-deep" },
  MARKETING: { label: "Promotion", cls: "bg-marigold-tint text-[#7a5200]" },
  AUTHENTICATION: { label: "Login code", cls: "bg-mist text-ink" },
};

/** "0.12 USD", or "under 0.01 USD" for tiny totals. */
const money = (total: number, currency: string) =>
  total < 0.01 ? `under 0.01 ${currency}` : `${total.toFixed(2)} ${currency}`;

function TemplatePicker({
  templates,
  value,
  onChange,
}: {
  templates: Template[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Message"
      className="grid max-h-[18.5rem] gap-2 overflow-y-auto p-0.5"
    >
      {templates.map((t) => {
        const on = t.id === value;
        const cat = CATEGORY[t.category];
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(t.id)}
            className={`rounded-xl px-4 py-3 text-left transition-colors ${on ? "bg-lagoon-tint/60 ring-2 ring-lagoon-deep" : "ring-1 ring-line hover:ring-ink/30"}`}
          >
            <span className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate font-medium text-ink">
                {templateTitle(t.name)}
              </span>
              {cat && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cat.cls}`}
                >
                  {cat.label}
                </span>
              )}
            </span>
            <span className="mt-1 line-clamp-2 block text-sm text-ink-soft">
              <WithBlanks text={t.body} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Messages sent to WhatsApp for review, and ones it turned down (with its reason). */
function WaitingTemplates({
  templates,
  canDelete,
}: {
  templates: Template[];
  canDelete: boolean;
}) {
  const del = useDeleteTemplate();
  if (!templates.length) return null;
  return (
    <div className="rounded-2xl bg-paper p-3">
      <p className="px-1 pb-2 text-sm font-medium text-ink">
        Not ready to send yet
      </p>
      <ul className="space-y-1.5">
        {templates.map((t) => {
          const rejected = t.status === "REJECTED";
          const state = rejected
            ? "Rejected by WhatsApp"
            : t.status === "PENDING" || t.status === "IN_APPEAL"
              ? "Waiting for approval"
              : t.unsupportedReason
                ? `Can't be sent from here: ${t.unsupportedReason.toLowerCase()}`
                : `Status: ${t.status.toLowerCase()}`;
          return (
            <li
              key={t.id}
              className="flex items-start gap-2.5 rounded-xl bg-white px-3 py-2.5 ring-1 ring-line"
            >
              {rejected ? (
                <XCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600"
                  aria-hidden="true"
                />
              ) : (
                <Clock
                  size={16}
                  className="mt-0.5 shrink-0 text-marigold"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {templateTitle(t.name)}
                </p>
                <p
                  className={`text-xs ${rejected ? "text-red-700" : "text-ink-soft"}`}
                >
                  {state}
                  {rejected && t.rejectedReason
                    ? ` (${t.rejectedReason.toLowerCase().replace(/_/g, " ")})`
                    : ""}
                </p>
              </div>
              {canDelete && (
                <button
                  type="button"
                  onClick={() =>
                    confirm(
                      `Delete “${templateTitle(t.name)}”? It's also removed from WhatsApp.`,
                    ) && del.mutate(t.id)
                  }
                  disabled={del.isPending}
                  aria-label={`Delete ${templateTitle(t.name)}`}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {del.error && (
        <p className="mt-2 px-1 text-sm text-red-700">{del.error.message}</p>
      )}
    </div>
  );
}

function ConfirmSend({
  open,
  onClose,
  onConfirm,
  sending,
  error,
  template,
  preview,
  skipped,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sending: boolean;
  error: Error | null;
  template: Template;
  preview: Preview;
  skipped: number;
}) {
  const people = plural(preview.recipients, "person", "people");
  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={sending}
      title={`Send to ${people}?`}
      description={`“${templateTitle(template.name)}” goes out on WhatsApp right away.`}
    >
      <div className="space-y-3 px-6 py-5 text-sm">
        {preview.samples[0] && (
          <p className="rounded-xl bg-chat/60 p-3 text-ink">
            {preview.samples[0].body}
          </p>
        )}
        {skipped > 0 && (
          <p className="flex items-start gap-2 text-ink-soft">
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-marigold"
              aria-hidden="true"
            />
            {plural(skipped, "ticked person")} won&apos;t get it because they
            unsubscribed or haven&apos;t agreed to messages.
          </p>
        )}
        {preview.exceedsDailyLimit && (
          <p className="flex items-start gap-2 text-ink-soft">
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 text-marigold"
              aria-hidden="true"
            />
            WhatsApp lets your number start chats with {preview.dailyLimit} new
            people a day. The rest go out automatically over the next days.
          </p>
        )}
        {preview.cost.total > 0 && (
          <p className="text-ink-soft">
            WhatsApp charges about{" "}
            <strong className="font-semibold text-ink">
              {money(preview.cost.total, preview.cost.currency)}
            </strong>{" "}
            for this.
          </p>
        )}
        {error && <p className="text-red-700">{error.message}</p>}
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <Button variant="ghost" onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button onClick={onConfirm} loading={sending}>
          {!sending && <Send size={15} aria-hidden="true" />} Send to {people}
        </Button>
      </div>
    </Modal>
  );
}

/** Step 3, pinned to the bottom: what's about to happen, and the button that does it. */
function SendBar({
  state,
  count,
  title,
  cost,
  onSend,
  done,
  onDismiss,
  onSaveGroup,
}: {
  state: "ready" | "loading" | { hint: string };
  count: number | null;
  title: string | null;
  cost: string | null;
  onSend: () => void;
  done: string | null;
  onDismiss: () => void;
  /** Offered after a send: keep who got it as a group. */
  onSaveGroup?: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-6 sm:pb-5">
      <div
        role="region"
        aria-label="Step 3: send"
        aria-live="polite"
        className="bar-in pointer-events-auto mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-ink py-2.5 pl-3 pr-2.5 text-white shadow-[0_18px_40px_-18px_rgb(19_34_42/0.7)] sm:gap-4 sm:pl-4"
      >
        {done ? (
          <>
            <CheckCircle2
              size={22}
              className="shrink-0 text-marigold"
              aria-hidden="true"
            />
            <p className="min-w-0 flex-1 text-sm">
              {done}{" "}
              <a
                href="#sent"
                className="font-semibold underline underline-offset-2"
              >
                See progress
              </a>
            </p>
            {onSaveGroup && (
              <button
                type="button"
                onClick={onSaveGroup}
                className="h-10 shrink-0 rounded-xl bg-white px-3 text-sm font-semibold text-ink hover:bg-marigold"
              >
                Save as group
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="h-10 shrink-0 rounded-xl px-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
            >
              New message
            </button>
          </>
        ) : (
          <>
            <span
              className={`grid h-11 min-w-11 shrink-0 place-items-center rounded-xl px-2 text-lg font-semibold tabular-nums ${count ? "bg-marigold text-ink" : "bg-white/10 text-white/60"}`}
              aria-hidden="true"
            >
              {count ?? "–"}
            </span>
            <div className="min-w-0 flex-1">
              {typeof state === "object" ? (
                <p className="text-sm text-white/75">{state.hint}</p>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold">
                    {count != null
                      ? plural(count, "person", "people")
                      : "Counting…"}{" "}
                    {title && (
                      <span className="font-normal text-white/70">
                        get “{title}”
                      </span>
                    )}
                  </p>
                  {cost && (
                    <p className="truncate text-xs text-white/60">
                      About {cost} in WhatsApp charges
                    </p>
                  )}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onSend}
              disabled={state !== "ready"}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-marigold disabled:bg-white/15 disabled:text-white/45"
            >
              <Send size={16} aria-hidden="true" /> Send
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Step 2: pick an approved message, fill its blanks, check how it looks. Also renders the send bar (step 3). */
export function ComposePanel({
  selected,
  audience,
  group,
  onSent,
}: {
  selected: Set<string>;
  audience: Audience;
  /** With "everyone", only this group gets it (when it's a group's id). */
  group: GroupFilter;
  onSent: () => void;
}) {
  const { can } = useCan();
  const canSend = can({ campaign: ["create", "send"] });
  const { data: account } = useAccount();
  const { data: templates, isPending: loadingTemplates } = useTemplates();
  const sync = useSyncTemplates();
  const send = useSendNow();

  const [templateId, setTemplateId] = useState("");
  const [vars, setVars] = useState<VarChoice[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const { data: groups } = useGroups();
  const groupId = groups?.some((g) => g.id === group) ? group : undefined;
  /** The send that just went out, to save who got it as a group. */
  const [lastSend, setLastSend] = useState<{
    campaignId: string;
    count: number;
    saved: boolean;
  } | null>(null);
  const [savingGroup, setSavingGroup] = useState(false);
  const [creating, setCreating] = useState(false);

  const sendable = useMemo(
    () => (templates ?? []).filter((t) => t.sendable),
    [templates],
  );
  const waiting = useMemo(
    () =>
      (templates ?? []).filter(
        (t) => !t.sendable && t.status !== "DELETED" && t.status !== "DISABLED",
      ),
    [templates],
  );
  const pending = waiting.some((t) => t.status === "PENDING");

  // While WhatsApp is reviewing something, check for its answer every minute.
  const syncNow = sync.mutate;
  useEffect(() => {
    if (!pending) return;
    const t = setInterval(
      () => document.visibilityState === "visible" && syncNow(),
      60_000,
    );
    return () => clearInterval(t);
  }, [pending, syncNow]);
  const template = sendable.find((t) => t.id === templateId) ?? null;

  useEffect(() => {
    if (!templateId && sendable[0]) setTemplateId(sendable[0].id);
  }, [sendable, templateId]);
  useEffect(() => {
    setVars(defaults(template?.variableCount ?? 0));
  }, [template?.id, template?.variableCount]);
  // Ticking someone new starts the next message.
  useEffect(() => {
    if (selected.size > 0) setDone(null);
  }, [selected.size]);

  const varsReady = vars.every((v) => v.kind !== "text" || v.value.trim());
  const input: SendInput | null =
    template && varsReady && (audience === "all" || selected.size > 0)
      ? {
          templateId: template.id,
          variables: vars.map(toSource),
          recipients:
            audience === "all"
              ? { mode: "all", groupId }
              : { mode: "selected", contactIds: [...selected] },
        }
      : null;
  const {
    data: preview,
    isFetching: previewing,
    error: previewError,
  } = usePreview(input);

  const from =
    account?.verifiedName || account?.displayPhone || "Your business";
  const count = input
    ? (preview?.recipients ?? null)
    : audience === "selected"
      ? selected.size || null
      : null;
  const cost =
    preview && preview.cost.total > 0
      ? money(preview.cost.total, preview.cost.currency)
      : null;

  const barState: "ready" | "loading" | { hint: string } = !canSend
    ? {
        hint: "Your role can prepare messages but not send them. Ask an admin to send.",
      }
    : !template
      ? { hint: "Pick a message in step 2." }
      : audience === "selected" && selected.size === 0
        ? { hint: "Tick the people who should get it in step 1." }
        : !varsReady
          ? { hint: "Fill in the blanks in step 2." }
          : previewError
            ? { hint: previewError.message }
            : !preview || previewing
              ? "loading"
              : preview.recipients === 0
                ? {
                    hint: "None of them can receive messages. They unsubscribed or haven't agreed yet.",
                  }
                : "ready";

  function confirmSend() {
    if (!input || !preview || !template) return;
    const people = plural(preview.recipients, "person", "people");
    const stamp = new Date().toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    send.mutate(
      { input, name: `${template.name} · ${stamp}` },
      {
        onSuccess: (r) => {
          setConfirming(false);
          setDone(`Sending to ${people}.`);
          setLastSend({
            campaignId: r.data.id,
            count: preview.recipients,
            saved: false,
          });
          onSent();
        },
      },
    );
  }

  if (account && !account.connected)
    return (
      <section
        aria-label="Step 2: what they get"
        className="min-w-0 rounded-[1.25rem] border border-line bg-white p-5 sm:p-6"
      >
        <StepHeading n={2} title="What do they get?" />
        <div className="mt-4 space-y-2 rounded-2xl bg-marigold-tint p-4 text-sm">
          <p className="font-semibold text-ink">
            No WhatsApp number is connected yet.
          </p>
          <p className="text-ink">
            Add{" "}
            <code className="rounded bg-white/70 px-1">
              WHATSAPP_PHONE_NUMBER_ID
            </code>
            ,{" "}
            <code className="rounded bg-white/70 px-1">
              WHATSAPP_BUSINESS_ACCOUNT_ID
            </code>{" "}
            and{" "}
            <code className="rounded bg-white/70 px-1">
              WHATSAPP_ACCESS_TOKEN
            </code>{" "}
            to the server&apos;s .env, then restart it.
            {account.managedByEnv &&
              " The number in .env is already used by another company in this app."}
          </p>
        </div>
      </section>
    );

  return (
    <>
      <section
        aria-label="Step 2: what they get"
        className="min-w-0 space-y-5 rounded-[1.25rem] border border-line bg-white p-5 sm:p-6"
      >
        <StepHeading
          n={2}
          title="What do they get?"
          hint="WhatsApp only allows messages it has approved."
          action={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sync.mutate()}
                loading={sync.isPending}
                title="Check WhatsApp for approvals and changes"
                aria-label="Refresh messages from WhatsApp"
              >
                {!sync.isPending && <RefreshCw size={14} aria-hidden="true" />}
              </Button>
              {can({ template: ["create"] }) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCreating(true)}
                >
                  <Plus size={14} aria-hidden="true" /> New
                </Button>
              )}
            </>
          }
        />

        {sync.error && (
          <p className="text-sm text-red-700">{sync.error.message}</p>
        )}

        {loadingTemplates ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[4.5rem] animate-pulse rounded-xl bg-mist/70"
              />
            ))}
          </div>
        ) : sendable.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-5 text-sm">
            <p className="font-medium text-ink">
              {waiting.length
                ? "No approved messages yet."
                : "You don't have any messages yet."}
            </p>
            <p className="mt-1 text-ink-soft">
              {waiting.length
                ? "WhatsApp is still reviewing yours. This page checks every minute."
                : "Write one with New. WhatsApp reviews it, usually within a few minutes, and then you can send it."}
            </p>
            {!waiting.length && can({ template: ["create"] }) && (
              <Button
                size="sm"
                className="mt-3"
                onClick={() => setCreating(true)}
              >
                <Plus size={14} aria-hidden="true" /> New message
              </Button>
            )}
          </div>
        ) : (
          <TemplatePicker
            templates={sendable}
            value={templateId}
            onChange={setTemplateId}
          />
        )}

        {vars.length > 0 && (
          <fieldset className="space-y-2.5">
            <legend className="mb-2 text-sm font-medium text-ink">
              Fill in the blanks
            </legend>
            {vars.map((v, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <span
                  className="grid h-10 w-14 shrink-0 place-items-center rounded-xl bg-marigold-tint text-sm font-semibold tabular-nums text-[#7a5200]"
                  aria-hidden="true"
                >
                  {`{{${i + 1}}}`}
                </span>
                <select
                  value={v.kind}
                  onChange={(e) =>
                    setVars((all) =>
                      all.map((x, j) =>
                        j === i
                          ? {
                              kind: e.target.value as VarChoice["kind"],
                              value: e.target.value === "text" ? "" : "there",
                            }
                          : x,
                      ),
                    )
                  }
                  aria-label={`Blank ${i + 1}`}
                  className={`${sizedInputCls} min-w-0 flex-[1_1_9rem]`}
                >
                  <option value="first_name">Their first name</option>
                  <option value="name">Their full name</option>
                  <option value="phone">Their phone number</option>
                  <option value="text">Text I type</option>
                </select>
                <input
                  value={v.value}
                  onChange={(e) =>
                    setVars((all) =>
                      all.map((x, j) =>
                        j === i ? { ...x, value: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder={
                    v.kind === "text"
                      ? "Type the text"
                      : "If we don't have it, use…"
                  }
                  aria-label={
                    v.kind === "text"
                      ? `Text for blank ${i + 1}`
                      : `Fallback for blank ${i + 1}`
                  }
                  className={`${inputCls} min-w-0 flex-[1_1_10rem] sm:w-auto`}
                />
              </div>
            ))}
          </fieldset>
        )}

        {template && (
          <WhatsAppChat
            from={from}
            header={
              template.components?.find((c) => c.type === "HEADER" && c.text)
                ?.text
            }
            body={
              preview?.samples[0]?.body ?? <WithBlanks text={template.body} />
            }
            footer={template.components?.find((c) => c.type === "FOOTER")?.text}
            buttons={
              template.components?.find((c) => c.type === "BUTTONS")?.buttons ??
              []
            }
            caption={
              preview?.samples[0]
                ? `How ${preview.samples[0].name || preview.samples[0].phone} will see it`
                : null
            }
          />
        )}

        <WaitingTemplates
          templates={waiting}
          canDelete={can({ template: ["delete"] })}
        />
      </section>

      <SendBar
        state={barState}
        count={count}
        title={template ? templateTitle(template.name) : null}
        cost={cost}
        onSend={() => (send.reset(), setConfirming(true))}
        done={done}
        onDismiss={() => setDone(null)}
        onSaveGroup={
          lastSend && !lastSend.saved && can({ contact: ["update"] })
            ? () => setSavingGroup(true)
            : undefined
        }
      />

      <PutInGroupDialog
        open={savingGroup}
        onClose={() => setSavingGroup(false)}
        source={
          lastSend
            ? { campaignId: lastSend.campaignId, count: lastSend.count }
            : null
        }
        defaultName={sentGroupName(groups)}
        onDone={(m) => {
          setLastSend((s) => (s ? { ...s, saved: true } : s));
          setDone(m);
        }}
      />

      <NewTemplateDialog
        open={creating}
        onClose={() => setCreating(false)}
        from={from}
      />

      {template && preview && (
        <ConfirmSend
          open={confirming}
          onClose={() => setConfirming(false)}
          onConfirm={confirmSend}
          sending={send.isPending}
          error={send.error}
          template={template}
          preview={preview}
          skipped={
            audience === "selected"
              ? Math.max(0, selected.size - preview.recipients)
              : 0
          }
        />
      )}
    </>
  );
}
