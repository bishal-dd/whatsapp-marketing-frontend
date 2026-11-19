import { Logo } from "@/src/shared/ui/Logo";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo size={40} />
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-7">
          <h1 className="text-xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && (
          <p className="mt-4 text-center text-sm text-ink-soft">{footer}</p>
        )}
      </div>
    </main>
  );
}
