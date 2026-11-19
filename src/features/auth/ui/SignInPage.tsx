"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";
import { Button, Field, inputCls } from "@/src/shared/ui/FormBits";
import { AuthCard } from "./AuthCard";

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    if (error) {
      setPending(false);
      return setError(error.message ?? "Couldn't sign in.");
    }
    // Full page load, so the dashboard starts with the new login instead of the
    // signed-out state cached in this tab (which sent people back here the first time).
    window.location.replace("/dashboard");
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Send WhatsApp messages to your contacts."
      footer={
        <>
          New here?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-lagoon-deep hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </Field>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={pending} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
