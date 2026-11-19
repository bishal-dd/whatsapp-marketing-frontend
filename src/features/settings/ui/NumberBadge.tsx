"use client";

import { useAccount } from "../hooks/useAccount";

/** The WhatsApp number messages go out from, with a dot for whether it's connected. */
export function NumberBadge() {
  const { data: acc, isPending } = useAccount();
  if (isPending) return <span className="hidden h-8 w-44 animate-pulse rounded-full bg-mist sm:block" />;
  if (!acc) return null;

  const label = acc.connected ? acc.displayPhone || acc.verifiedName || "WhatsApp connected" : "No WhatsApp number";
  return (
    <span
      className={`hidden h-8 items-center gap-2 rounded-full px-3 text-xs font-medium sm:inline-flex ${
        acc.connected ? "bg-lagoon-tint text-lagoon-deep" : "bg-marigold-tint text-ink"
      }`}
      title={acc.connected ? "Messages are sent from this number" : "Add the WhatsApp number to the server's .env"}
    >
      <span className={`size-2 rounded-full ${acc.connected ? "bg-lagoon" : "bg-marigold"}`} aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
    </span>
  );
}
