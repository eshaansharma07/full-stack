import { readStore, type StoreShape } from "@/lib/store";
import { buildDashboardData } from "@/lib/dashboard-data";
export { buildDashboardData } from "@/lib/dashboard-data";

export async function getDashboardData() {
  const store = await readStore();
  return buildDashboardData(store);
}
