import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { readStore, writeStore } from "@/lib/store";

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  monthlyIncome: z.number().nonnegative()
});

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store.user);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const payload = profileSchema.parse(body);
  const store = await readStore();

  store.user = {
    ...store.user,
    ...payload
  };

  await writeStore(store);

  return NextResponse.json(store.user);
}
