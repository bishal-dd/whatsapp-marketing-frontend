"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Link2, Plus, Reply, Trash2 } from "lucide-react";
import { Modal } from "@/src/shared/ui/Modal";
import { Button, Field, inputCls } from "@/src/shared/ui/FormBits";
import { WhatsAppChat } from "@/src/shared/ui/WhatsAppChat";
import { useCreateTemplate } from "../hooks/useTemplates";
import type { NewTemplate, TemplateButton } from "../types/template";

/** "Project update!" → "project_update" (Meta: lowercase letters, numbers, underscores). */
const toName = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);

/** The highest {{n}} in the text. */
const blankCount = (text: string) => Math.max(0, ...[...text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)].map((m) => Number(m[1])));

/** Same checks as the server and Meta, said plainly. */
function problems(body: string, examples: string[], buttons: TemplateButton[]) {
  const out: string[] = [];
  const nums = [...body.matchAll(/\{\{\s*(\d+)\s*\}\}/g)].map((m) => Number(m[1]));
  const max = blankCount(body);
  for (let i = 1; i <= max; i++) if (!nums.includes(i)) out.push(`Blank {{${i}}} is missing. Number the blanks 1, 2, 3 in order.`);
  if (/^\s*\{\{/.test(body) || /\{\{\s*\d+\s*\}\}\s*$/.test(body)) out.push("WhatsApp doesn't allow a blank at the very start or end. Add some words around it.");
  if (max > 0 && body.replace(/\{\{\s*\d+\s*\}\}/g, "").trim().split(/\s+/).length < max * 3)
    out.push("Add more fixed words around the blanks. WhatsApp rejects messages that are mostly blanks.");
  if (examples.slice(0, max).some((e) => !e.trim())) out.push("Give an example for every blank. WhatsApp's reviewers need them.");
  for (const b of buttons) {
    if (!b.text.trim()) out.push("Every button needs a label.");
    if (b.type === "URL" && !/^https?:\/\/\S+\.\S+/.test(b.url)) out.push(`The link for "${b.text || "button"}" should start with https://`);
  }
  return [...new Set(out)];
}

const TYPES = [
  { value: "UTILITY", label: "Update", hint: "About an order, booking, account or service. Cheaper, approved faster." },
  { value: "MARKETING", label: "Promotion", hint: "Offers, news and announcements. Costs more." },
] as const;

/** Write a new message template and send it to WhatsApp for approval. */
export function NewTemplateDialog({ open, onClose, from }: { open: boolean; onClose: () => void; from: string }) {
  const create = useCreateTemplate();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<NewTemplate["category"]>("UTILITY");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [examples, setExamples] = useState<string[]>([]);
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setCategory("UTILITY");
    setHeader("");
    setBody("");
    setFooter("");
    setExamples([]);
    setButtons([]);
    setTried(false);
    create.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const blanks = blankCount(body);
  useEffect(() => {
    setExamples((ex) => Array.from({ length: blanks }, (_, i) => ex[i] ?? ""));
  }, [blanks]);

  const name = toName(title);
  const issues = useMemo(() => problems(body, examples, buttons), [body, examples, buttons]);
  const ready = !!name && !!body.trim() && issues.length === 0;

  function addBlank() {
    const el = bodyRef.current;
    const token = `{{${blanks + 1}}}`;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    const before = body.slice(0, start);
    const pad = before && !/\s$/.test(before) ? " " : "";
    const next = before + pad + token + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      const pos = (before + pad + token).length;
      el?.focus();
      el?.setSelectionRange(pos, pos);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!ready) return;
    create.mutate({
      name,
      language: "en",
      category,
      ...(header.trim() ? { header: header.trim() } : {}),
      body: body.trim(),
      ...(footer.trim() ? { footer: footer.trim() } : {}),
      examples: examples.map((x) => x.trim()),
      buttons: buttons.map((b) => (b.type === "URL" ? { type: "URL", text: b.text.trim(), url: b.url.trim() } : { type: "QUICK_REPLY", text: b.text.trim() })),
    });
  }

  const previewBody = body.trim()
    ? body.replace(/\{\{\s*(\d+)\s*\}\}/g, (m, n: string) => examples[Number(n) - 1]?.trim() || m.replace(/\s/g, ""))
    : "Your message shows here as you type.";

  const done = create.isSuccess;

  return (
    <Modal open={open} onClose={onClose} locked={create.isPending} size="lg" title="New message" description="WhatsApp reviews every message before you can send it. This usually takes a few minutes.">
      {done ? (
        <div className="space-y-4 px-6 py-8 text-center">
          <CheckCircle2 size={36} className="mx-auto text-lagoon-deep" aria-hidden="true" />
          <div>
            <p className="text-lg font-semibold text-ink">Sent to WhatsApp for approval</p>
            <p className="mt-1 text-sm text-ink-soft">“{title.trim()}” is listed at the bottom of step 2 while WhatsApp reviews it. Once it&apos;s approved, you can pick it and send it.</p>
          </div>
          <Button onClick={onClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-6 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <div className="space-y-5">
              <Field label="Name" htmlFor="tpl-title" hint={name ? `Saved in WhatsApp as ${name}` : "Only you see this, e.g. Project update"}>
                <input id="tpl-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} className={inputCls} autoFocus />
              </Field>

              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-ink">Type</legend>
                <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={category === t.value}
                      onClick={() => setCategory(t.value)}
                      className={`rounded-xl px-3.5 py-3 text-left transition-colors ${category === t.value ? "bg-lagoon-tint/60 ring-2 ring-lagoon-deep" : "ring-1 ring-line hover:ring-ink/30"}`}
                    >
                      <span className="block font-medium text-ink">{t.label}</span>
                      <span className="mt-0.5 block text-sm text-ink-soft">{t.hint}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-ink-soft">WhatsApp may change the type if the wording doesn&apos;t match.</p>
              </fieldset>

              <Field label="Heading (optional)" htmlFor="tpl-header" hint="Bold line at the top. No blanks here.">
                <input id="tpl-header" value={header} onChange={(e) => setHeader(e.target.value.replace(/\{|\}/g, ""))} maxLength={60} className={inputCls} />
              </Field>

              <div>
                <div className="mb-1.5 flex items-end justify-between gap-2">
                  <label htmlFor="tpl-body" className="text-sm font-medium text-ink">
                    Message
                  </label>
                  <Button variant="secondary" size="sm" onClick={addBlank} title="Add a blank, filled per person when you send">
                    <Plus size={13} aria-hidden="true" /> Add blank
                  </Button>
                </div>
                <textarea
                  id="tpl-body"
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  maxLength={1024}
                  placeholder={"Hi {{1}}, your website is ready for review. Reply here with any changes."}
                  className={`${inputCls} h-auto py-2.5 leading-relaxed`}
                />
                <p className="mt-1 flex justify-between gap-3 text-xs text-ink-soft">
                  <span>Blanks like {"{{1}}"} are filled for each person when you send, e.g. with their first name.</span>
                  <span className="shrink-0 tabular-nums">{body.length}/1024</span>
                </p>
              </div>

              {blanks > 0 && (
                <fieldset className="space-y-2">
                  <legend className="mb-1.5 text-sm font-medium text-ink">Examples for WhatsApp&apos;s reviewers</legend>
                  {examples.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="grid h-10 w-14 shrink-0 place-items-center rounded-xl bg-marigold-tint text-sm font-semibold text-[#7a5200]" aria-hidden="true">{`{{${i + 1}}}`}</span>
                      <input
                        value={ex}
                        onChange={(e) => setExamples((all) => all.map((x, j) => (j === i ? e.target.value : x)))}
                        placeholder={i === 0 ? "e.g. Karma" : "Example"}
                        aria-label={`Example for blank ${i + 1}`}
                        maxLength={200}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </fieldset>
              )}

              <Field
                label="Small print (optional)"
                htmlFor="tpl-footer"
                hint={
                  category === "MARKETING" && !footer ? (
                    <button type="button" onClick={() => setFooter("Reply STOP to unsubscribe")} className="font-medium text-lagoon-deep hover:underline">
                      Add “Reply STOP to unsubscribe”
                    </button>
                  ) : (
                    "Grey line under the message."
                  )
                }
              >
                <input id="tpl-footer" value={footer} onChange={(e) => setFooter(e.target.value.replace(/\{|\}/g, ""))} maxLength={60} className={inputCls} />
              </Field>

              <fieldset className="space-y-2">
                <legend className="mb-1.5 text-sm font-medium text-ink">Buttons (optional)</legend>
                {buttons.map((b, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-mist/60 p-2">
                    {b.type === "URL" ? <Link2 size={16} className="ml-1 text-ink-soft" aria-label="Link button" /> : <Reply size={16} className="ml-1 text-ink-soft" aria-label="Reply button" />}
                    <input
                      value={b.text}
                      onChange={(e) => setButtons((all) => all.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                      placeholder={b.type === "URL" ? "Label, e.g. Visit website" : "Label, e.g. Yes please"}
                      aria-label="Button label"
                      maxLength={25}
                      className={`${inputCls} min-w-0 flex-[1_1_8rem]`}
                    />
                    {b.type === "URL" && (
                      <input
                        value={b.url}
                        onChange={(e) => setButtons((all) => all.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                        placeholder="https://lightwebx.com"
                        aria-label="Button link"
                        inputMode="url"
                        className={`${inputCls} min-w-0 flex-[2_1_10rem]`}
                      />
                    )}
                    <button type="button" onClick={() => setButtons((all) => all.filter((_, j) => j !== i))} aria-label="Remove button" className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-white hover:text-red-700">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {buttons.length < 3 && (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setButtons((all) => [...all, { type: "QUICK_REPLY", text: "" }])}>
                      <Reply size={13} aria-hidden="true" /> Reply button
                    </Button>
                    {!buttons.some((b) => b.type === "URL") && (
                      <Button variant="secondary" size="sm" onClick={() => setButtons((all) => [...all, { type: "URL", text: "", url: "" }])}>
                        <Link2 size={13} aria-hidden="true" /> Link button
                      </Button>
                    )}
                  </div>
                )}
              </fieldset>
            </div>

            <div className="md:sticky md:top-0 md:self-start">
              <p className="mb-1.5 text-sm font-medium text-ink">Preview</p>
              <WhatsAppChat
                from={from}
                header={header.trim() || undefined}
                body={<span className={body.trim() ? "" : "text-ink-soft"}>{previewBody}</span>}
                footer={footer.trim() || undefined}
                buttons={buttons}
                caption={blanks ? "Blanks show your examples" : null}
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-line px-6 py-4">
            {tried && issues.length > 0 && (
              <ul className="space-y-1 text-sm text-red-700">
                {issues.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
            {tried && !name && <p className="text-sm text-red-700">Give it a name.</p>}
            {create.error && <p className="text-sm text-red-700">{create.error.message}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
                Cancel
              </Button>
              <Button type="submit" loading={create.isPending} disabled={!body.trim() || !title.trim()}>
                Submit for approval
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
