import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/empty-state";
import { getDashboardData } from "@/lib/dashboard";
import { readStore } from "@/lib/store";

export default async function HomePage() {
  const data = await getDashboardData();
  const store = await readStore();

  if (!data) {
    return <EmptyState />;
  }

  return <DashboardShell data={data} initialStore={store} />;
}
