"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FolderInput,
  MoreHorizontal,
  Search,
  Settings2,
  Trash2,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import { useCan } from "@/src/lib/useCan";
import { plural } from "@/src/lib/format";
import { Button, inputCls, sizedInputCls } from "@/src/shared/ui/FormBits";
import { Avatar, StepHeading } from "@/src/shared/ui/Step";
import { useGroups } from "@/src/features/groups/hooks/useGroups";
import type { Group, GroupFilter } from "@/src/features/groups/types/group";
import { ManageGroupsDialog } from "@/src/features/groups/ui/ManageGroupsDialog";
import {
  PutInGroupDialog,
  type GroupSource,
} from "@/src/features/groups/ui/PutInGroupDialog";
import { Modal } from "@/src/shared/ui/Modal";
import {
  useAddContact,
  useContacts,
  useDeleteContact,
  useDeleteContacts,
  useSetSubscription,
} from "../hooks/useContacts";
import type { Contact, ContactStatus } from "../types/contact";
import { ImportDialog } from "./ImportDialog";

const PAGE = 50;

export type Audience = "selected" | "all";

const FILTERS: { value: ContactStatus; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "subscribed", label: "Can receive" },
  { value: "no_consent", label: "Hasn't agreed" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

/** Why someone can't be messaged, in plain words. Null when they can. */
const blockedReason = (c: Contact) =>
  c.optedOutAt
    ? "Unsubscribed"
    : !c.subscribed
      ? "Hasn't agreed to messages"
      : null;

function RowMenu({ c, onGroup }: { c: Contact; onGroup: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { can } = useCan();
  const sub = useSetSubscription();
  const del = useDeleteContact();
  const busy = sub.isPending || del.isPending;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) =>
      !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!can({ contact: ["update"] })) return null;
  const item =
    "block w-full rounded-lg px-3 py-2 text-left hover:bg-mist disabled:opacity-50";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`More for ${c.name ?? c.phone}`}
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink"
      >
        <MoreHorizontal size={17} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-line bg-white p-1 text-sm shadow-[0_8px_24px_-12px_rgb(19_34_42/0.35)]">
          {c.subscribed ? (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                sub.mutate(
                  { id: c.id, subscribed: false },
                  { onSettled: () => setOpen(false) },
                )
              }
              className={item}
            >
              Unsubscribe
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                sub.mutate(
                  { id: c.id, subscribed: true },
                  { onSettled: () => setOpen(false) },
                )
              }
              className={item}
            >
              They agreed to messages
            </button>
          )}
          <button
            type="button"
            onClick={() => (setOpen(false), onGroup())}
            className={item}
          >
            Put in a group…
          </button>
          {can({ contact: ["delete"] }) && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                confirm(`Delete ${c.name ?? c.phone}? This can't be undone.`) &&
                del.mutate(c.id, { onSettled: () => setOpen(false) })
              }
              className={`${item} text-red-700 hover:bg-red-50`}
            >
              Delete contact
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddContact({ onDone }: { onDone?: () => void }) {
  const add = useAddContact();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [added, setAdded] = useState<string | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!phone.trim()) return;
        add.mutate(
          { phone: phone.trim(), name: name.trim() || null, optIn: agreed },
          {
            onSuccess: () => {
              setAdded(name.trim() || phone.trim());
              setPhone("");
              setName("");
            },
          },
        );
      }}
      className="rounded-2xl bg-mist/70 p-3"
    >
      <div className="flex flex-wrap gap-2">
        <input
          value={phone}
          onChange={(e) => (setPhone(e.target.value), setAdded(null))}
          inputMode="tel"
          placeholder="Phone, e.g. 17123456"
          aria-label="Phone number"
          className={`${sizedInputCls} min-w-0 flex-[1_1_9rem]`}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          aria-label="Name"
          className={`${sizedInputCls} min-w-0 flex-[1_1_9rem]`}
        />
        <Button type="submit" loading={add.isPending} disabled={!phone.trim()}>
          Add contact
        </Button>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="size-4 accent-lagoon-deep"
          />
          They agreed to get WhatsApp messages from us
        </label>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            Done
          </button>
        )}
      </div>
      {add.error && (
        <p className="mt-2 text-sm text-red-700">{add.error.message}</p>
      )}
      {added && !add.error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-lagoon-deep">
          <Check size={15} aria-hidden="true" /> Added {added}.
        </p>
      )}
    </form>
  );
}

/** Confirm deleting the ticked contacts. */
function DeleteContactsDialog({
  ids,
  onClose,
  onDeleted,
}: {
  ids: string[] | null;
  onClose: () => void;
  onDeleted: (deleted: number) => void;
}) {
  const del = useDeleteContacts();
  const n = ids?.length ?? 0;
  const label = plural(n, "contact");
  return (
    <Modal
      open={!!ids}
      onClose={onClose}
      locked={del.isPending}
      title={`Delete ${label}?`}
    >
      <div className="space-y-3 px-6 py-5 text-sm text-ink">
        <p>
          This can&apos;t be undone. Their message history goes too, and
          they&apos;re taken out of their groups.
        </p>
        <p className="text-ink-soft">
          To stop messaging someone but keep their history, unsubscribe them
          from the … menu instead.
        </p>
        {del.error && <p className="text-red-700">{del.error.message}</p>}
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <Button variant="ghost" onClick={onClose} disabled={del.isPending}>
          Cancel
        </Button>
        <Button
          variant="danger"
          loading={del.isPending}
          onClick={() =>
            ids &&
            del.mutate(ids, {
              onSuccess: (r) => {
                onDeleted(r.data.deleted);
                del.reset();
              },
            })
          }
        >
          Delete {label}
        </Button>
      </div>
    </Modal>
  );
}

/**
 * Step 1: who gets the message. Tick people, or switch to everyone who can receive it.
 * Anyone can be ticked (to group or delete them); only people who can receive messages get it.
 */
export function ContactsPanel({
  selected,
  onChange,
  audience,
  onAudienceChange,
  group,
  onGroupChange,
}: {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  audience: Audience;
  onAudienceChange: (a: Audience) => void;
  /** Which group the list shows. With "everyone", only that group gets it. */
  group: GroupFilter;
  onGroupChange: (g: GroupFilter) => void;
}) {
  const { can } = useCan();
  const canAdd = can({ contact: ["create"] });
  const canGroup = can({ contact: ["update"] });
  const { data: groups } = useGroups();
  const currentGroup: Group | null =
    groups?.find((g) => g.id === group) ?? null;
  const groupNames = new Map((groups ?? []).map((g) => [g.id, g.name]));
  const canDelete = can({ contact: ["delete"] });
  const [grouping, setGrouping] = useState<GroupSource | null>(null);
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const [managing, setManaging] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const showNote = (m: string) => {
    setNote(m);
    setTimeout(() => setNote((n) => (n === m ? null : n)), 5000);
  };
  const pickGroup = (g: GroupFilter) => (onGroupChange(g), setPage(1));
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContactStatus>("all");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isPending, error, isPlaceholderData } = useContacts({
    search: search || undefined,
    status,
    group,
    page,
    limit: PAGE,
  });
  // "Everyone" means everyone in the group when one is open, otherwise everyone.
  const { data: reachable } = useContacts({
    status: "subscribed",
    group: currentGroup ? currentGroup.id : "all",
    page: 1,
    limit: 1,
  });
  const reachableCount = reachable?.pagination.total ?? null;
  const total = data?.pagination.total ?? 0;
  const empty =
    !isPending &&
    !error &&
    !search &&
    status === "all" &&
    group === "all" &&
    total === 0;

  const rows = data?.data ?? [];
  const picking = audience === "selected";
  const pickable = rows;
  const allPicked =
    pickable.length > 0 && pickable.every((c) => selected.has(c.id));

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onChange(next);
  };
  const toggleAll = () => {
    const next = new Set(selected);
    for (const c of pickable) allPicked ? next.delete(c.id) : next.add(c.id);
    onChange(next);
  };

  return (
    <section
      aria-label="Step 1: who gets it"
      className="min-w-0 rounded-[1.25rem] border border-line bg-white"
    >
      <div className="space-y-4 p-5 pb-4 sm:p-6 sm:pb-4">
        <StepHeading
          n={1}
          title="Who gets it?"
          action={
            canAdd && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setImporting(true)}
                  aria-label="Import contacts from a CSV file"
                >
                  <Upload size={14} aria-hidden="true" />{" "}
                  <span className="hidden sm:inline">Import</span>
                </Button>
                {!adding && !empty && (
                  <Button size="sm" onClick={() => setAdding(true)}>
                    <UserPlus size={14} aria-hidden="true" /> Add
                  </Button>
                )}
              </>
            )
          }
        />

        {canAdd && (adding || empty) && (
          <AddContact onDone={empty ? undefined : () => setAdding(false)} />
        )}

        {!empty && (
          <div
            role="radiogroup"
            aria-label="Who gets it"
            className="grid grid-cols-2 gap-1 rounded-xl bg-mist p-1"
          >
            {(
              [
                [
                  "selected",
                  "People I tick",
                  selected.size ? String(selected.size) : null,
                ],
                [
                  "all",
                  currentGroup
                    ? `Everyone in ${currentGroup.name}`
                    : "Everyone who can receive",
                  reachableCount != null ? String(reachableCount) : null,
                ],
              ] as const
            ).map(([value, label, meta]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={audience === value}
                onClick={() => onAudienceChange(value)}
                className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-sm font-semibold transition-colors ${
                  audience === value
                    ? "bg-white text-ink shadow-[0_1px_2px_rgb(19_34_42/0.12)]"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <span className="truncate">
                  {value === "all" ? (
                    <>
                      <span className="sm:hidden">Everyone</span>
                      <span className="hidden sm:inline">{label}</span>
                    </>
                  ) : (
                    label
                  )}
                </span>
                {meta && (
                  <span
                    className={`rounded-full px-1.5 text-xs tabular-nums ${audience === value ? "bg-marigold text-ink" : "bg-white/80"}`}
                  >
                    {meta}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {!empty && (
        <>
          <div className="space-y-3 border-t border-line px-5 py-3 sm:px-6">
            <div className="relative">
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search by name or number"
                aria-label="Search contacts"
                className={`${inputCls} pl-9 pr-9`}
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-mist"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {(!!groups?.length || group !== "all") && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="group-filter"
                  className="shrink-0 text-sm font-medium text-ink"
                >
                  Group
                </label>
                <select
                  id="group-filter"
                  value={currentGroup || group === "none" ? group : "all"}
                  onChange={(e) => pickGroup(e.target.value)}
                  className={`${sizedInputCls} min-w-0 flex-1`}
                >
                  <option value="all">All contacts</option>
                  <option value="none">Not in a group</option>
                  {groups?.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.count})
                    </option>
                  ))}
                </select>
                {canGroup && !!groups?.length && (
                  <button
                    type="button"
                    onClick={() => setManaging(true)}
                    aria-label="Rename or delete groups"
                    title="Rename or delete groups"
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-soft ring-1 ring-inset ring-line hover:text-ink hover:ring-ink/40"
                  >
                    <Settings2 size={16} />
                  </button>
                )}
              </div>
            )}
            <div
              className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5"
              role="group"
              aria-label="Show"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={status === f.value}
                  onClick={() => (setStatus(f.value), setPage(1))}
                  className={`h-8 shrink-0 rounded-full px-3 text-sm font-medium transition-colors ${
                    status === f.value
                      ? "bg-ink text-white"
                      : "bg-white text-ink-soft ring-1 ring-inset ring-line hover:text-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {picking ? (
            <div className="flex min-h-11 items-center justify-between gap-3 border-y border-line bg-paper px-5 text-sm sm:px-6">
              <label
                className={`flex items-center gap-3 font-medium ${pickable.length ? "cursor-pointer text-ink" : "text-ink-soft"}`}
              >
                <input
                  type="checkbox"
                  checked={allPicked}
                  onChange={toggleAll}
                  disabled={!pickable.length}
                  className="size-[1.125rem] accent-lagoon-deep"
                />
                <span>
                  {allPicked ? "Untick" : "Tick"}
                  <span
                    className={selected.size ? "sr-only sm:not-sr-only" : ""}
                  >
                    {" "}
                    everyone shown
                  </span>
                </span>
              </label>
              {selected.size > 0 && (
                <span className="flex shrink-0 items-center gap-3">
                  {canGroup && (
                    <button
                      type="button"
                      onClick={() => setGrouping({ contactIds: [...selected] })}
                      className="inline-flex items-center gap-1.5 font-medium text-lagoon-deep hover:underline"
                    >
                      <FolderInput size={15} aria-hidden="true" /> Group
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleting([...selected])}
                      className="inline-flex items-center gap-1.5 font-medium text-red-700 hover:underline"
                    >
                      <Trash2 size={15} aria-hidden="true" /> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange(new Set())}
                    className="font-medium text-lagoon-deep hover:underline"
                  >
                    Clear {selected.size}
                  </button>
                </span>
              )}
            </div>
          ) : (
            <p className="border-y border-line bg-lagoon-tint/60 px-5 py-2.5 text-sm text-lagoon-deep sm:px-6">
              {currentGroup
                ? `Everyone in “${currentGroup.name}” who can receive messages gets it${reachableCount != null ? `: ${plural(reachableCount, "person", "people")}` : ""}.`
                : reachableCount != null
                  ? `Everyone who can receive messages gets it: ${plural(reachableCount, "person", "people")}${group === "none" ? ", not only the people shown" : ""}.`
                  : "Everyone who can receive messages gets it."}
            </p>
          )}

          <p
            aria-live="polite"
            className={
              note
                ? "flex items-center gap-1.5 border-b border-line bg-lagoon-tint/60 px-5 py-2 text-sm text-lagoon-deep sm:px-6"
                : "sr-only"
            }
          >
            {note && <Check size={15} aria-hidden="true" />}
            {note}
          </p>

          <div
            className={`transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
          >
            {isPending ? (
              <div className="space-y-1 p-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-mist/70"
                  />
                ))}
              </div>
            ) : error ? (
              <p className="p-6 text-sm text-red-700">{error.message}</p>
            ) : rows.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-ink-soft">
                {search ? `No one matches "${search}".` : "No one here."}{" "}
                <button
                  type="button"
                  onClick={() => (
                    setInput(""),
                    setStatus("all"),
                    pickGroup("all")
                  )}
                  className="font-medium text-lagoon-deep hover:underline"
                >
                  Show everyone
                </button>
              </div>
            ) : (
              <ul className="max-h-[34rem] overflow-y-auto px-2 py-2 sm:px-3">
                {rows.map((c) => {
                  const reason = blockedReason(c);
                  const ticked = selected.has(c.id);
                  const gets = picking ? ticked : !reason;
                  return (
                    <li
                      key={c.id}
                      className={`flex items-center gap-1 rounded-xl pr-1 transition-colors ${gets ? "bg-lagoon-tint/55" : "hover:bg-paper"}`}
                    >
                      <label
                        className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl py-2.5 pl-3 ${picking ? "cursor-pointer" : ""}`}
                      >
                        {picking && (
                          <input
                            type="checkbox"
                            checked={ticked}
                            onChange={() => toggle(c.id)}
                            aria-label={`Tick ${c.name ?? c.phone}`}
                            className="size-[1.125rem] shrink-0 accent-lagoon-deep"
                          />
                        )}
                        <Avatar name={c.name} phone={c.phone} />
                        <span
                          className={`min-w-0 flex-1 ${reason ? "opacity-60" : ""}`}
                        >
                          <span className="block truncate text-[0.9375rem] font-medium text-ink">
                            {c.name || "No name"}
                          </span>
                          <span className="block truncate text-sm text-ink-soft">
                            {c.phone}
                            {!!c.groupIds?.length && (
                              <span className="text-ink-soft/80">
                                {" · "}
                                {c.groupIds
                                  .map((id) => groupNames.get(id))
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            )}
                            {reason && (
                              <span className="sm:hidden"> · {reason}</span>
                            )}
                          </span>
                        </span>
                        {reason && (
                          <span className="hidden shrink-0 text-xs font-medium text-ink-soft sm:block">
                            {reason}
                          </span>
                        )}
                      </label>
                      <RowMenu
                        c={c}
                        onGroup={() => setGrouping({ contactIds: [c.id] })}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex min-h-12 items-center justify-between gap-3 border-t border-line px-5 text-sm text-ink-soft sm:px-6">
            <span className="tabular-nums">
              {data
                ? total > PAGE
                  ? `${(page - 1) * PAGE + 1}–${Math.min(page * PAGE, total)} of ${total}`
                  : plural(total, "contact")
                : ""}
            </span>
            {data && data.pagination.totalPages > 1 && (
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
                  className="grid size-9 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                  className="grid size-9 place-items-center rounded-full hover:bg-mist disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {empty && (
        <p className="px-6 pb-6 text-sm text-ink-soft">
          {canAdd
            ? "Add your first contact, or import a list saved from a spreadsheet as CSV."
            : "No contacts yet. Ask an admin to add some."}
        </p>
      )}

      <ImportDialog open={importing} onClose={() => setImporting(false)} />
      <PutInGroupDialog
        open={!!grouping}
        onClose={() => setGrouping(null)}
        source={grouping}
        from={currentGroup}
        onDone={(m) => {
          showNote(m);
          // Ticked people were grouped: start the next pick fresh.
          if (
            grouping &&
            "contactIds" in grouping &&
            grouping.contactIds.length > 1
          )
            onChange(new Set());
        }}
      />
      <DeleteContactsDialog
        ids={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={(n) => {
          setDeleting(null);
          onChange(new Set());
          showNote(`Deleted ${plural(n, "contact")}.`);
          if (page > 1 && rows.length <= n) setPage(1);
        }}
      />
      <ManageGroupsDialog
        open={managing}
        onClose={() => setManaging(false)}
        onDeleted={(g) => {
          if (g.id === group) pickGroup("all");
          showNote(`Deleted the group “${g.name}”. Its contacts are kept.`);
        }}
      />
    </section>
  );
}
