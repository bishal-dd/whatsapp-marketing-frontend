"use client";

import { authClient } from "./auth-client";
import { organizationRoles, type PermissionInput } from "./permissions";

type RoleName = keyof typeof organizationRoles;

/** Same roles as the backend, checked locally. A member may hold several ("admin,member"). */
export function roleCan(role: string | null | undefined, needs?: PermissionInput) {
  if (!needs || Object.keys(needs).length === 0) return true;
  if (!role) return false;
  return role.split(",").some((r) => {
    const def = organizationRoles[r.trim() as RoleName];
    return !!def && def.authorize(needs as Parameters<typeof def.authorize>[0]).success;
  });
}

/** const { can } = useCan(); can({ campaign: ["send"] }) */
export function useCan() {
  const { data: session } = authClient.useSession();
  const { data: org, isPending } = authClient.useActiveOrganization();
  const members = (org as { members?: { userId: string; role: string }[] } | null)?.members;
  const role = members?.find((m) => m.userId === session?.user.id)?.role ?? null;
  return { role, ready: !isPending && !!members, can: (needs?: PermissionInput) => roleCan(role, needs) };
}
