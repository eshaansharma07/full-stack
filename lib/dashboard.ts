import { differenceInCalendarDays, format } from "date-fns";

import { readStore } from "@/lib/store";

export async function getDashboardData() {
  const store = await readStore();
  const user = store.user;
  const budgets = [...store.budgets].sort((left, right) => right.spent - left.spent);
  const sortedTransactions = [...store.transactions].sort(
    (left, right) => +new Date(right.happenedAt) - +new Date(left.happenedAt)
  );
  const transactions = sortedTransactions.slice(0, 8);
  const goals = [...store.goals].sort(
    (left, right) => +new Date(left.deadline) - +new Date(right.deadline)
  );

  const expenses = sortedTransactions
    .filter((transaction) => transaction.kind === "expense" && transaction.status !== "scheduled")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const income = sortedTransactions
    .filter((transaction) => transaction.kind === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const scheduled = sortedTransactions
    .filter((transaction) => transaction.status === "scheduled")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const budgetTotal = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const spentTotal = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const savingsRate = income === 0 ? 0 : ((income - expenses) / income) * 100;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      monthlyIncome: user.monthlyIncome
    },
    overview: {
      netBalance: income - expenses,
      expenses,
      income,
      scheduled,
      savingsRate,
      budgetUtilization: budgetTotal === 0 ? 0 : (spentTotal / budgetTotal) * 100
    },
    budgets: budgets.map((budget) => ({
      id: budget.id,
      name: budget.name,
      category: budget.category,
      limit: budget.limit,
      spent: budget.spent,
      accent: budget.accent,
      trend: budget.trend,
      utilization: budget.limit === 0 ? 0 : (budget.spent / budget.limit) * 100
    })),
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      label: transaction.label,
      notes: transaction.notes,
      amount: transaction.amount,
      kind: transaction.kind,
      category: transaction.category,
      merchant: transaction.merchant,
      status: transaction.status,
      happenedAt: transaction.happenedAt,
      dateLabel: format(new Date(transaction.happenedAt), "dd MMM")
    })),
    goals: goals.map((goal) => ({
      id: goal.id,
      name: goal.name,
      current: goal.current,
      target: goal.target,
      accent: goal.accent,
      deadline: goal.deadline,
      daysLeft: differenceInCalendarDays(new Date(goal.deadline), new Date()),
      progress: goal.target === 0 ? 0 : (goal.current / goal.target) * 100
    })),
    insights: [
      {
        title: "Stability score",
        value: `${Math.max(42, Math.round(100 - (spentTotal / budgetTotal) * 38))}/100`,
        tone: "calm",
        body: "Your essentials are steady and discretionary spend has room before month-end pressure hits."
      },
      {
        title: "Fastest burn",
        value: budgets[0]?.category ?? "Lifestyle",
        tone: "alert",
        body: "This category is pacing fastest relative to its cap. A quick nudge here has the highest payoff."
      },
      {
        title: "Next checkpoint",
        value: format(new Date(), "dd MMM"),
        tone: "bright",
        body: "Review scheduled transfers and shift any low-priority purchases after the next salary cycle."
      }
    ]
  };
}
