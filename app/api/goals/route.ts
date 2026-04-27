import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { readStore, writeStore } from "@/lib/store";

const goalSchema = z.object({
  name: z.string().min(2),
  current: z.number().nonnegative(),
  target: z.number().positive(),
  deadline: z.string().datetime(),
  accent: z.string().min(4)
});

export async function GET() {
  const store = await readStore();
  const goals = [...store.goals].sort(
    (left, right) => +new Date(left.deadline) - +new Date(right.deadline)
  );

  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const payload = goalSchema.parse(body);
  const store = await readStore();
  const created = {
    id: crypto.randomUUID(),
    ...payload
  };
  store.goals.unshift(created);
  await writeStore(store);

  return NextResponse.json(created, { status: 201 });
}
