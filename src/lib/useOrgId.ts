"use client";

import { authClient } from "./auth-client";

/** Query keys start with the company id, so switching never shows another company's data. */
export function useOrgId() {
  return authClient.useActiveOrganization().data?.id;
}
