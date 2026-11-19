import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { ac, organizationRoles } from "./permissions";

/** Same roles as the backend (copy of its permissions.ts). */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [organizationClient({ ac, roles: organizationRoles })],
});
