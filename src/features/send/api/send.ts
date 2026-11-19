import { api, type Data } from "@/src/lib/api";
import type { Preview, SendInput } from "../types/send";

const audience = (r: SendInput["recipients"]) => ({
  tags: [],
  match: "any" as const,
  excludeTags: [],
  ...(r.mode === "selected" ? { contactIds: r.contactIds } : {}),
});

export const previewSend = (input: SendInput) =>
  api<Data<Preview>>("POST", "/campaigns/preview", { templateId: input.templateId, variables: input.variables, audience: audience(input.recipients) });

/**
 * One click = a campaign under the hood (so it's queued, paced, limit-aware and
 * reported), created and sent straight away.
 */
export async function sendNow(input: SendInput, name: string) {
  const created = await api<Data<{ id: string }>>("POST", "/campaigns", {
    name,
    templateId: input.templateId,
    variables: input.variables,
    audience: audience(input.recipients),
  });
  return api<Data<{ id: string; status: string }>>("POST", `/campaigns/${created.data.id}/send`, {});
}
