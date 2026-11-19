import type { Metadata } from "next";
import { SignInPage } from "@/src/features/auth/ui/SignInPage";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return <SignInPage />;
}
