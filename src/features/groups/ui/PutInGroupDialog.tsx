"use client";

import { useState } from "react";
import { plural } from "@/src/lib/format";
import { Button, inputCls } from "@/src/shared/ui/FormBits";
import { Modal } from "@/src/shared/ui/Modal";
import {
  useChangeMembership,
  useCreateGroup,
  useGroups,
} from "../hooks/useGroups";
import type { Group } from "../types/group";

const NEW = "__new__";

/**
 * Who goes in the group: some contacts (ticked, or one from a row's menu),
 * or everyone a send just went to.
 */
export type GroupSource =
  | { contactIds: string[] }
  | { campaignId: string; count: number };

/** "Sent 27 Nov", made unique against the existing names. */
export function sentGroupName(groups: Group[] | undefined) {
  const base = `Sent ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  const taken = new Set((groups ?? []).map((g) => g.name.toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  for (let i = 2; ; i++)
    if (!taken.has(`${base} (${i})`.toLowerCase())) return `${base} (${i})`;
}

function Body({
  source,
  from,
  defaultName,
  onClose,
  onDone,
}: {
  source: GroupSource;
  from: Group | null;
  defaultName: string;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const { data: groups } = useGroups();
  const create = useCreateGroup();
  const change = useChangeMembership();
  const fromCampaign = "campaignId" in source;
  const others = fromCampaign
    ? []
    : (groups ?? []).filter((g) => g.id !== from?.id);
  const [choice, setChoice] = useState<string>(NEW);
  const [name, setName] = useState(defaultName);
  const [takeOut, setTakeOut] = useState(true);

  const target = others.find((g) => g.id === choice) ?? null;
  const moving = !!from && !!target && takeOut;
  const busy = create.isPending || change.isPending;
  const error = create.error ?? change.error;

  function submit() {
    if (choice === NEW) {
      const n = name.trim();
      if (!n) return;
      create.mutate(
        fromCampaign
          ? { name: n, campaignId: source.campaignId }
          : { name: n, contactIds: source.contactIds },
        {
          onSuccess: (r) =>
            onDone(
              `Saved ${plural(r.data.added, "person", "people")} as “${r.data.name}”.`,
            ),
        },
      );
      return;
    }
    if (!target || fromCampaign) return;
    change.mutate(
      moving
        ? {
            kind: "move",
            fromId: from!.id,
            toId: target.id,
            contactIds: source.contactIds,
          }
        : { kind: "add", toId: target.id, contactIds: source.contactIds },
      {
        onSuccess: (r) => {
          const d = r.data;
          onDone(
            moving
              ? `Moved ${plural(d.moved ?? 0, "person", "people")} to “${target.name}”.`
              : d.added
                ? `Added ${plural(d.added, "person", "people")} to “${target.name}”.`
                : `They're already in “${target.name}”.`,
          );
        },
      },
    );
  }

  function remove() {
    if (!from || fromCampaign) return;
    change.mutate(
      { kind: "remove", fromId: from.id, contactIds: source.contactIds },
      {
        onSuccess: (r) => {
          const d = r.data;
          onDone(
            `Took ${plural(d.removed ?? 0, "person", "people")} out of “${from.name}”.`,
          );
        },
      },
    );
  }

  const option = (on: boolean) =>
    `flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
      on ? "bg-lagoon-tint/60 ring-2 ring-lagoon-deep" : "ring-1 ring-line hover:ring-ink/30"
    }`;

  return (
    <form
      className="flex min-h-0 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="space-y-3 overflow-y-auto px-6 py-5">
        {others.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium text-ink">
              Which group?
            </legend>
            <div className="grid max-h-64 gap-2 overflow-y-auto p-0.5">
              {others.map((g) => (
                <label key={g.id} className={option(choice === g.id)}>
                  <input
                    type="radio"
                    name="group"
                    checked={choice === g.id}
                    onChange={() => setChoice(g.id)}
                    className="size-4 accent-lagoon-deep"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-ink">
                    {g.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-soft">
                    {plural(g.count, "person", "people")}
                  </span>
                </label>
              ))}
              <label className={option(choice === NEW)}>
                <input
                  type="radio"
                  name="group"
                  checked={choice === NEW}
                  onChange={() => setChoice(NEW)}
                  className="size-4 accent-lagoon-deep"
                />
                <span className="font-medium text-ink">A new group</span>
              </label>
            </div>
          </fieldset>
        )}

        {choice === NEW && (
          <div>
            <label
              htmlFor="group-name"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Group name
            </label>
            <input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoFocus
              placeholder="e.g. Batch 1"
              className={inputCls}
            />
          </div>
        )}

        {from && target && (
          <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={takeOut}
              onChange={(e) => setTakeOut(e.target.checked)}
              className="mt-0.5 size-4 accent-lagoon-deep"
            />
            Take them out of “{from.name}”
          </label>
        )}

        {error && <p className="text-sm text-red-700">{error.message}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-6 py-4">
        {from && !fromCampaign && (
          <Button
            variant="danger"
            onClick={remove}
            disabled={busy}
            className="mr-auto"
          >
            Remove from “{from.name}”
          </Button>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={busy}
            disabled={choice === NEW ? !name.trim() : !target}
          >
            {choice === NEW ? "Create group" : moving ? "Move" : "Add"}
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Put contacts in a group (new or existing), move them between groups, or take them out. */
export function PutInGroupDialog({
  open,
  onClose,
  source,
  from = null,
  defaultName = "",
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  source: GroupSource | null;
  /** The group being looked at, so they can be moved out of it. */
  from?: Group | null;
  defaultName?: string;
  onDone: (message: string) => void;
}) {
  if (!source) return null;
  const count = "campaignId" in source ? source.count : source.contactIds.length;
  const people = plural(count, "person", "people");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={"campaignId" in source ? "Save as a group" : `Group ${people}`}
      description={
        "campaignId" in source
          ? `The ${people} you just sent to, so you can find them or message them again.`
          : "A contact can be in more than one group."
      }
    >
      {/* Mounted only while open, so each opening starts fresh. */}
      {open && (
        <Body
          source={source}
          from={from}
          defaultName={defaultName}
          onClose={onClose}
          onDone={(m) => {
            onDone(m);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}
