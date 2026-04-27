import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { getDashboardData } from "@/lib/dashboard";

export default async function HomePage() {
  const data = await getDashboardData();

  if (!data) {
    return <EmptyState />;
  }

  return <DashboardShell data={data} />;
}
