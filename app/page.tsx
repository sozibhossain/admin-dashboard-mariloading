import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function Home() {
  return (
    <DashboardShell>
      <DashboardHome />
    </DashboardShell>
  );
}
