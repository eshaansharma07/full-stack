import type { getDashboardData } from "@/lib/dashboard";

export type DashboardData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>;
