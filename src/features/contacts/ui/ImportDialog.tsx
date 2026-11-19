"use client";

import { useEffect, useState } from "react";
import { FileUp } from "lucide-react";
import { Modal } from "@/src/shared/ui/Modal";
import { Button, inputCls } from "@/src/shared/ui/FormBits";
import { useImportContacts } from "../hooks/useContacts";

const EXAMPLE = `Name,Phone
Karma Dorji,17123456
Emma Clarke,+44 7911 123456`;

/** Paste or upload a CSV. Needs a phone column; name, email and tags are picked up too. */
export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const imp = useImportContacts();
  const [csv, setCsv] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (open) {
      setCsv("");
      setAgreed(false);
      imp.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function readFile(file: File | undefined) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setCsv(String(r.result ?? ""));
    r.readAsText(file);
  }

  const result = imp.data?.data;

  return (
    <Modal open={open} onClose={onClose} locked={imp.isPending} title="Import contacts" description="A CSV with a phone column. Name, email and tags columns are used too.">
      <div className="space-y-4 overflow-y-auto px-6 py-5">
        {result ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-lagoon-tint px-4 py-3 text-sm text-lagoon-deep">
              <strong>{result.created}</strong> added, <strong>{result.updated}</strong> updated
              {result.skippedCount > 0 && (
                <>
                  , <strong>{result.skippedCount}</strong> skipped
                </>
              )}
              .
            </p>
            {result.skipped.length > 0 && (
              <ul className="max-h-40 overflow-y-auto rounded-xl border border-line text-xs">
                {result.skipped.map((s) => (
                  <li key={s.row} className="flex gap-3 border-b border-line px-3 py-1.5 last:border-0">
                    <span className="text-ink-soft">Row {s.row}</span>
                    <span className="min-w-0 flex-1 truncate">{s.value || "(empty)"}</span>
                    <span className="text-red-700">{s.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-5 text-sm font-medium text-ink hover:border-ink/40">
              <FileUp size={16} aria-hidden="true" /> Choose a .csv file
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => readFile(e.target.files?.[0])} />
            </label>
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={7}
              placeholder={`…or paste it here:\n\n${EXAMPLE}`}
              aria-label="CSV"
              className={`${inputCls} h-auto py-2 font-mono text-xs`}
            />
            <label className="flex items-start gap-2 text-sm text-ink">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-lagoon-deep" />
              Everyone in this file agreed to receive WhatsApp messages from us.
            </label>
            <p className="text-xs text-ink-soft">Numbers without a country code are treated as Bhutanese (+975). Existing contacts are updated, not duplicated.</p>
            {imp.error && <p className="text-sm text-red-700">{imp.error.message}</p>}
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        {result ? (
          <Button onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={imp.isPending}>
              Cancel
            </Button>
            <Button onClick={() => imp.mutate({ csv, optIn: agreed })} loading={imp.isPending} disabled={!csv.trim() || !agreed}>
              Import
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
