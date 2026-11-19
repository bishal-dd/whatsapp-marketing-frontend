import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, ownerAc, adminAc, memberAc } from "better-auth/plugins/organization/access";

/** Everything you can do inside a brand. */
export const statement = {
  ...defaultStatements,
  settings: ["read", "update"],
  contact: ["read", "create", "update", "delete"],
  template: ["read", "create", "delete"],
  campaign: ["read", "create", "update", "send", "delete"],
  message: ["read", "send"],
  apiKey: ["read", "create", "revoke"],
} as const;

export type PermissionInput = Partial<{
  [R in keyof typeof statement]: Array<(typeof statement)[R][number]>;
}>;

export const ac = createAccessControl(statement);

const everything = {
  settings: ["read", "update"],
  contact: ["read", "create", "update", "delete"],
  template: ["read", "create", "delete"],
  campaign: ["read", "create", "update", "send", "delete"],
  message: ["read", "send"],
  apiKey: ["read", "create", "revoke"],
} as const;

/** Owner: everything, including deleting the brand. */
export const owner = ac.newRole({ ...ownerAc.statements, ...everything });

/** Admin: everything except deleting the brand. */
export const admin = ac.newRole({ ...adminAc.statements, ...everything });

/** Member: day-to-day messaging. Can't send campaigns, change settings or manage API keys. */
export const member = ac.newRole({
  ...memberAc.statements,
  settings: ["read"],
  contact: ["read", "create", "update"],
  template: ["read"],
  campaign: ["read", "create", "update"],
  message: ["read", "send"],
});

export const organizationRoles = { owner, admin, member } as const;
