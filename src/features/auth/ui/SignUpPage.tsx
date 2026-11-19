"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";
import { Button, Field, inputCls } from "@/src/shared/ui/FormBits";
import { AuthCard } from "./AuthCard";

export function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8)
      return setError("Use at least 8 characters for the password.");
    setError(null);
    setPending(true);
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    if (error) {
      setPending(false);
      return setError(
        error.code === "EMAIL_PASSWORD_SIGN_UP_DISABLED"
          ? "Sign-up is closed. Ask your admin for an invitation."
          : (error.message ?? "Couldn't create the account."),
      );
    }
    // Full page load so the next page sees the new login straight away.
    window.location.replace("/onboarding");
  }

  return (
    <AuthCard
      title="Create your account"
      footer={
        <>
          Already have one?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-lagoon-deep hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Your name" htmlFor="name">
          <input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </Field>
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
        <Field
          label="Password"
          htmlFor="password"
          hint="At least 8 characters."
        >
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </Field>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" loading={pending} className="w-full">
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
