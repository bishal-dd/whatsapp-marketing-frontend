"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { plural } from "@/src/lib/format";
import { Button, sizedInputCls } from "@/src/shared/ui/FormBits";
import { Modal } from "@/src/shared/ui/Modal";
import {
  useDeleteGroup,
  useGroups,
  useRenameGroup,
} from "../hooks/useGroups";
import type { Group } from "../types/group";

function Row({
  g,
  onDeleted,
}: {
  g: Group;
  onDeleted: (g: Group) => void;
}) {
  const rename = useRenameGroup();
  const del = useDeleteGroup();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(g.name);

  if (editing)
    return (
      <li className="px-3 py-2.5">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = name.trim();
            if (!n || n === g.name) return setEditing(false);
            rename.mutate(
              { id: g.id, name: n },
              { onSuccess: () => setEditing(false) },
            );
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
            aria-label={`New name for ${g.name}`}
            className={`${sizedInputCls} min-w-0 flex-1`}
          />
          <Button type="submit" size="sm" loading={rename.isPending} className="h-10">
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10"
            onClick={() => (setEditing(false), setName(g.name), rename.reset())}
          >
            Cancel
          </Button>
        </form>
        {rename.error && (
          <p className="mt-1.5 text-sm text-red-700">{rename.error.message}</p>
        )}
      </li>
    );

  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{g.name}</span>
        <span className="block text-xs text-ink-soft">
          {plural(g.count, "person", "people")}
          {g.count > 0 && `, ${g.reachable} can receive`}
        </span>
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Rename ${g.name}`}
        className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-mist hover:text-ink"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        disabled={del.isPending}
        onClick={() =>
          confirm(
            `Delete the group “${g.name}”? The ${plural(g.count, "contact")} in it stay in your contacts.`,
          ) && del.mutate(g.id, { onSuccess: () => onDeleted(g) })
        }
        aria-label={`Delete ${g.name}`}
        className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}

/** Rename or delete groups. New groups are made by putting people in one. */
export function ManageGroupsDialog({
  open,
  onClose,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  onDeleted: (g: Group) => void;
}) {
  const { data: groups, isPending, error } = useGroups();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Groups"
      description="To make a group, tick people and choose Group."
    >
      <div className="overflow-y-auto px-3 py-3">
        {isPending ? (
          <div className="space-y-1 p-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-mist/70" />
            ))}
          </div>
        ) : error ? (
          <p className="p-3 text-sm text-red-700">{error.message}</p>
        ) : !groups?.length ? (
          <p className="p-3 text-sm text-ink-soft">No groups yet.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {groups.map((g) => (
              <Row key={g.id} g={g} onDeleted={onDeleted} />
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-end border-t border-line px-6 py-4">
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  );
}
