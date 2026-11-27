"use client";

import { useState } from "react";
import {
  ContactsPanel,
  type Audience,
} from "@/src/features/contacts/ui/ContactsPanel";
import type { GroupFilter } from "@/src/features/groups/types/group";
import { RecentMessages } from "@/src/features/messages/ui/RecentMessages";
import { ComposePanel } from "./ComposePanel";

/**
 * The whole app on one page, in the order you use it:
 * 1 who gets it (left), 2 what they get (right), 3 send (bar pinned to the bottom),
 * then what happened to it (below).
 */
export function SendPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [audience, setAudience] = useState<Audience>("selected");
  const [group, setGroup] = useState<GroupFilter>("all");
  return (
    <div className="space-y-6">
      <h1 className="sr-only">Send a WhatsApp message</h1>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
        <ContactsPanel
          selected={selected}
          onChange={setSelected}
          audience={audience}
          onAudienceChange={setAudience}
          group={group}
          onGroupChange={setGroup}
        />
        <div className="min-w-0">
          <ComposePanel
            selected={selected}
            audience={audience}
            group={group}
            onSent={() => setSelected(new Set())}
          />
        </div>
      </div>
      <RecentMessages />
    </div>
  );
}
