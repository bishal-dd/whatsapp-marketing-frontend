import type { ReactNode } from "react";
import { CheckCheck, ExternalLink, Reply } from "lucide-react";

/** Template text with each {{n}} shown as a blank to fill. */
export function WithBlanks({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{\{\s*\d+\s*\}\})/).map((part, i) =>
        /^\{\{\s*\d+\s*\}\}$/.test(part) ? (
          <span key={i} className="rounded bg-marigold-tint px-1 font-medium text-[#7a5200]">
            {part.replace(/\s/g, "")}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * A WhatsApp chat as the recipient sees it: your business at the top,
 * the message as a bubble (optional header, footer and buttons).
 */
export function WhatsAppChat({
  from,
  header,
  body,
  footer,
  buttons = [],
  caption,
}: {
  from: string;
  header?: string;
  body: ReactNode;
  footer?: string;
  buttons?: { type: string; text: string }[];
  caption?: string | null;
}) {
  const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return (
    <figure className="overflow-hidden rounded-2xl border border-line">
      <div className="flex items-center gap-2.5 bg-[#f0f2f0] px-4 py-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-lagoon-deep text-xs font-semibold text-white" aria-hidden="true">
          {from.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{from}</span>
          <span className="block text-xs text-ink-soft">Business account</span>
        </span>
      </div>
      <div className="bg-chat px-3 py-5 sm:px-5">
        <div className="ml-auto w-fit min-w-40 max-w-[88%]">
          <div className={`rounded-xl rounded-tr-sm bg-wa px-3 pb-1.5 pt-2 text-[0.9375rem] leading-relaxed text-ink shadow-[0_1px_0.5px_rgb(19_34_42/0.13)] ${buttons.length ? "rounded-b-md" : ""}`}>
            {header && <p className="mb-1 font-semibold">{header}</p>}
            <p className="whitespace-pre-wrap break-words">{body}</p>
            {footer && <p className="mt-1 text-[0.8125rem] text-ink-soft">{footer}</p>}
            <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-ink-soft">
              {time} <CheckCheck size={14} className="text-sky-500" aria-hidden="true" />
            </p>
          </div>
          {buttons.map((b, i) => (
            <div
              key={i}
              className={`mt-0.5 flex items-center justify-center gap-1.5 bg-wa px-3 py-2 text-sm font-medium text-sky-700 shadow-[0_1px_0.5px_rgb(19_34_42/0.13)] ${
                i === buttons.length - 1 ? "rounded-b-xl" : "rounded-md"
              }`}
            >
              {b.type === "URL" ? <ExternalLink size={14} aria-hidden="true" /> : <Reply size={14} aria-hidden="true" />}
              {b.text || "Button"}
            </div>
          ))}
        </div>
      </div>
      {caption && <figcaption className="border-t border-line bg-white px-4 py-2 text-xs text-ink-soft">{caption}</figcaption>}
    </figure>
  );
}
