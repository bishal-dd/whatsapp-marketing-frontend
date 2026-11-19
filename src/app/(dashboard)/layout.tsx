import { AppShell } from "@/src/features/company/ui/AppShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
