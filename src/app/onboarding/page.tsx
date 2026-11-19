import type { Metadata } from "next";
import { OnboardingPage } from "@/src/features/company/ui/OnboardingPage";

export const metadata: Metadata = { title: "Set up your company" };

export default function Page() {
  return <OnboardingPage />;
}
