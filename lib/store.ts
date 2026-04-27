import { promises as fs } from "node:fs";
import path from "node:path";

export type StoreBudget = {
  id: string;
  name: string;
  category: string;
  limit: number;
  spent: number;
  accent: string;
  trend: number;
};

export type StoreTransaction = {
  id: string;
  label: string;
  notes?: string;
  amount: number;
  kind: "income" | "expense";
  category: string;
  merchant: string;
  status: "processed" | "scheduled";
  happenedAt: string;
};

export type StoreGoal = {
  id: string;
  name: string;
  current: number;
  target: number;
  deadline: string;
  accent: string;
};

type StoreShape = {
  user: {
    id: string;
    name: string;
    email: string;
    monthlyIncome: number;
  };
  budgets: StoreBudget[];
  transactions: StoreTransaction[];
  goals: StoreGoal[];
};

const storePath = path.join(process.cwd(), "data", "demo-store.json");

export async function readStore() {
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as StoreShape;
}

export async function writeStore(store: StoreShape) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2));
}
