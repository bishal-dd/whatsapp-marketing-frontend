"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";
import { AuthCard } from "@/src/features/auth/ui/AuthCard";
import { Button, Field, inputCls } from "@/src/shared/ui/FormBits";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "company";

/** Create a company (a Better Auth organization). It becomes the active one. */
export function OnboardingPage() {
  const { data: session, isPending } = authClient.useSession();
  const { data: companies } = authClient.useListOrganizations();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter your company's name.");
    setError(null);
    setPending(true);
    // A short random ending keeps slugs unique without asking the user.
    const slug = `${slugify(trimmed)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await authClient.organization.create({
      name: trimmed,
      slug,
    });
    if (error) {
      setPending(false);
      return setError(error.message ?? "Couldn't create the company.");
    }
    // Full page load so the dashboard sees the new company straight away.
    window.location.replace("/dashboard");
  }

  if (!isPending && !session)
    return (
      <AuthCard title="Please sign in first">
        <Link
          href="/sign-in"
          className="font-semibold text-lagoon-deep hover:underline"
        >
          Go to sign in
        </Link>
      </AuthCard>
    );

  const hasCompany = (companies?.length ?? 0) > 0;
  return (
    <AuthCard
      title={hasCompany ? "Add another company" : "Set up your company"}
      subtitle="Messages go out under this name. You can connect its WhatsApp number next."
      footer={
        hasCompany ? (
          <Link
            href="/dashboard"
            className="font-semibold text-lagoon-deep hover:underline"
          >
            Back to the dashboard
          </Link>
        ) : undefined
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Company name" htmlFor="company">
          <input
            id="company"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Help Make Travel"
            className={inputCls}
          />
        </Field>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={pending} className="w-full">
          Continue
        </Button>
      </form>
    </AuthCard>
  );
}
