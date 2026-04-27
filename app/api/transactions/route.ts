import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { readStore, writeStore } from "@/lib/store";

const transactionSchema = z.object({
  label: z.string().min(2),
  notes: z.string().optional(),
  amount: z.number().positive(),
  kind: z.enum(["income", "expense"]),
  category: z.string().min(2),
  merchant: z.string().min(2),
  status: z.enum(["processed", "scheduled"]),
  happenedAt: z.string().datetime()
});

export async function GET() {
  const store = await readStore();
  const transactions = [...store.transactions].sort(
    (left, right) => +new Date(right.happenedAt) - +new Date(left.happenedAt)
  );

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = transactionSchema.parse(body);
  const store = await readStore();
  const created = {
    id: crypto.randomUUID(),
    ...payload
  };
  store.transactions.unshift(created);
  await writeStore(store);

  return NextResponse.json(created, { status: 201 });
}
