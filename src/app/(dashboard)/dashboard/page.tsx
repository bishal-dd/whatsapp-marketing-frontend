import type { Metadata } from "next";
import { CompanyGate } from "@/src/features/company/ui/CompanyGate";
import { SendPage } from "@/src/features/send/ui/SendPage";

export const metadata: Metadata = { title: "Send" };

export default function Page() {
  return (
    <CompanyGate>
      <SendPage />
    </CompanyGate>
  );
}
