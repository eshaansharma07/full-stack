import type { getDashboardData } from "@/lib/dashboard";
import type { StoreShape } from "@/lib/store";

export type DashboardData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>;
export type { StoreShape };
