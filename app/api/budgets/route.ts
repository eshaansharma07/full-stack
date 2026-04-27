import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { readStore, writeStore } from "@/lib/store";

const budgetSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  limit: z.number().positive(),
  spent: z.number().nonnegative(),
  accent: z.string().min(4),
  trend: z.number()
});

export async function GET() {
  const store = await readStore();
  const budgets = [...store.budgets].sort((left, right) => right.spent - left.spent);

  return NextResponse.json(budgets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = budgetSchema.parse(body);
  const store = await readStore();
  const created = {
    id: crypto.randomUUID(),
    ...payload
  };
  store.budgets.unshift(created);
  await writeStore(store);

  return NextResponse.json(created, { status: 201 });
}
