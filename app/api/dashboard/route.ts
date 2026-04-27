import { NextResponse } from "next/server";

import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  const data = await getDashboardData();

  if (!data) {
    return NextResponse.json({ error: "No dashboard data found." }, { status: 404 });
  }

  return NextResponse.json(data);
}
