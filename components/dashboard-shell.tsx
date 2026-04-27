"use client";

import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  BrainCircuit,
  CircleDollarSign,
  Clock3,
  Goal,
  Plus,
  Sparkles,
  Wallet
} from "lucide-react";

import { currency, percent } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

type BudgetFormState = {
  name: string;
  category: string;
  limit: string;
  spent: string;
  accent: string;
  trend: string;
};

type TransactionFormState = {
  label: string;
  notes: string;
  amount: string;
  kind: "income" | "expense";
  category: string;
  merchant: string;
  status: "processed" | "scheduled";
  happenedAt: string;
};

type GoalFormState = {
  name: string;
  current: string;
  target: string;
  deadline: string;
  accent: string;
};

type ProfileFormState = {
  name: string;
  email: string;
  monthlyIncome: string;
};

const defaultBudget: BudgetFormState = {
  name: "",
  category: "",
  limit: "",
  spent: "",
  accent: "#5fd3ff",
  trend: "0"
};

const defaultTransaction: TransactionFormState = {
  label: "",
  notes: "",
  amount: "",
  kind: "expense",
  category: "",
  merchant: "",
  status: "processed",
  happenedAt: new Date().toISOString().slice(0, 16)
};

const defaultGoal: GoalFormState = {
  name: "",
  current: "",
  target: "",
  deadline: "",
  accent: "#52e7c5"
};

export function DashboardShell({ data: initialData }: { data: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [profile, setProfile] = useState<ProfileFormState>({
    name: initialData.user.name,
    email: initialData.user.email,
    monthlyIncome: String(initialData.user.monthlyIncome)
  });
  const [budget, setBudget] = useState<BudgetFormState>(defaultBudget);
  const [transaction, setTransaction] = useState<TransactionFormState>(defaultTransaction);
  const [goal, setGoal] = useState<GoalFormState>(defaultGoal);
  const [feedback, setFeedback] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  async function refreshDashboard() {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to refresh dashboard.");
    }

    const nextData = (await response.json()) as DashboardData;
    setData(nextData);
    setProfile({
      name: nextData.user.name,
      email: nextData.user.email,
      monthlyIncome: String(nextData.user.monthlyIncome)
    });
  }

  function runAction(action: () => Promise<void>) {
    setFeedback("");
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          monthlyIncome: Number(profile.monthlyIncome)
        })
      });

      if (!response.ok) {
        throw new Error("Profile update failed.");
      }

      await refreshDashboard();
      setFeedback("Profile saved.");
    });
  }

  async function submitBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: budget.name,
          category: budget.category,
          limit: Number(budget.limit),
          spent: Number(budget.spent),
          accent: budget.accent,
          trend: Number(budget.trend)
        })
      });

      if (!response.ok) {
        throw new Error("Budget could not be added.");
      }

      setBudget(defaultBudget);
      await refreshDashboard();
      setFeedback("Budget added.");
    });
  }

  async function submitTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          label: transaction.label,
          notes: transaction.notes || undefined,
          amount: Number(transaction.amount),
          kind: transaction.kind,
          category: transaction.category,
          merchant: transaction.merchant,
          status: transaction.status,
          happenedAt: new Date(transaction.happenedAt).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error("Transaction could not be added.");
      }

      setTransaction({
        ...defaultTransaction,
        happenedAt: new Date().toISOString().slice(0, 16)
      });
      await refreshDashboard();
      setFeedback("Transaction added.");
    });
  }

  async function submitGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAction(async () => {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: goal.name,
          current: Number(goal.current),
          target: Number(goal.target),
          deadline: new Date(goal.deadline).toISOString(),
          accent: goal.accent
        })
      });

      if (!response.ok) {
        throw new Error("Goal could not be added.");
      }

      setGoal(defaultGoal);
      await refreshDashboard();
      setFeedback("Goal added.");
    });
  }

  return (
    <main className="dashboard">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">BudgetSense Future / Personal finance cockpit</div>
            <h1>Build your budget, not just a dashboard.</h1>
            <p className="hero-copy">
              Add your own income, expenses, goals, and budget limits. The whole board updates from
              your entries, so it behaves like a proper budget maker instead of a static mockup.
            </p>
            <div className="hero-actions">
              <div className="action">
                <Sparkles size={18} />
                Live personal data
              </div>
              <div className="ghost-action">
                <BrainCircuit size={18} />
                Responsive planner
              </div>
            </div>
          </div>

          <aside className="hero-side">
            <div className="meta">Current net position</div>
            <div className="headline-number">{currency(data.overview.netBalance)}</div>
            <div className="muted">
              Tracked for {data.user.name}. Scheduled outflow this cycle: {currency(data.overview.scheduled)}
            </div>
            <div className="side-stats">
              <div className="mini-stat">
                <div className="meta">Savings rate</div>
                <strong>{data.overview.savingsRate.toFixed(1)}%</strong>
              </div>
              <div className="mini-stat">
                <div className="meta">Budget utilization</div>
                <strong>{data.overview.budgetUtilization.toFixed(1)}%</strong>
              </div>
            </div>
            {feedback ? <div className="form-feedback">{feedback}</div> : null}
          </aside>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Income pulse"
          value={currency(data.overview.income)}
          tone="up"
          detail="All credited income"
          icon={<CircleDollarSign size={18} />}
        />
        <StatCard
          label="Expense burn"
          value={currency(data.overview.expenses)}
          tone="down"
          detail="Tracked processed spending"
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Scheduled next"
          value={currency(data.overview.scheduled)}
          tone="neutral"
          detail="Upcoming planned money moves"
          icon={<Clock3 size={18} />}
        />
        <StatCard
          label="Goals online"
          value={`${data.goals.length}`}
          tone="up"
          detail="Savings targets in progress"
          icon={<Goal size={18} />}
        />
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Your profile</h2>
              <div className="muted">Use your own identity and monthly income baseline.</div>
            </div>
            <div className="capsule">Editable</div>
          </div>

          <form className="data-form" onSubmit={submitProfile}>
            <label className="field">
              <span>Name</span>
              <input
                value={profile.name}
                onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                placeholder="Your name"
                required
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="field">
              <span>Monthly income</span>
              <input
                type="number"
                min="0"
                value={profile.monthlyIncome}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, monthlyIncome: event.target.value }))
                }
                placeholder="120000"
                required
              />
            </label>
            <button className="submit-button" disabled={isPending} type="submit">
              <Plus size={16} />
              Save profile
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Add budget bucket</h2>
              <div className="muted">Create category caps and track how much is already spent.</div>
            </div>
            <div className="capsule">{data.budgets.length} budgets</div>
          </div>

          <form className="data-form" onSubmit={submitBudget}>
            <div className="form-grid two-up">
              <label className="field">
                <span>Name</span>
                <input
                  value={budget.name}
                  onChange={(event) => setBudget((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Groceries"
                  required
                />
              </label>
              <label className="field">
                <span>Category</span>
                <input
                  value={budget.category}
                  onChange={(event) =>
                    setBudget((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Food"
                  required
                />
              </label>
            </div>
            <div className="form-grid three-up">
              <label className="field">
                <span>Limit</span>
                <input
                  type="number"
                  min="0"
                  value={budget.limit}
                  onChange={(event) => setBudget((current) => ({ ...current, limit: event.target.value }))}
                  placeholder="10000"
                  required
                />
              </label>
              <label className="field">
                <span>Spent</span>
                <input
                  type="number"
                  min="0"
                  value={budget.spent}
                  onChange={(event) => setBudget((current) => ({ ...current, spent: event.target.value }))}
                  placeholder="2400"
                  required
                />
              </label>
              <label className="field">
                <span>Trend %</span>
                <input
                  type="number"
                  value={budget.trend}
                  onChange={(event) => setBudget((current) => ({ ...current, trend: event.target.value }))}
                  placeholder="8.2"
                  required
                />
              </label>
            </div>
            <label className="field color-field">
              <span>Accent</span>
              <input
                type="color"
                value={budget.accent}
                onChange={(event) => setBudget((current) => ({ ...current, accent: event.target.value }))}
              />
            </label>
            <button className="submit-button" disabled={isPending} type="submit">
              <Plus size={16} />
              Add budget
            </button>
          </form>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Add transaction</h2>
              <div className="muted">Track income and expenses from your own life.</div>
            </div>
            <div className="capsule">{data.transactions.length} recent shown</div>
          </div>

          <form className="data-form" onSubmit={submitTransaction}>
            <div className="form-grid two-up">
              <label className="field">
                <span>Title</span>
                <input
                  value={transaction.label}
                  onChange={(event) =>
                    setTransaction((current) => ({ ...current, label: event.target.value }))
                  }
                  placeholder="Salary"
                  required
                />
              </label>
              <label className="field">
                <span>Merchant</span>
                <input
                  value={transaction.merchant}
                  onChange={(event) =>
                    setTransaction((current) => ({ ...current, merchant: event.target.value }))
                  }
                  placeholder="Bank / UPI / Employer"
                  required
                />
              </label>
            </div>
            <div className="form-grid three-up">
              <label className="field">
                <span>Amount</span>
                <input
                  type="number"
                  min="0"
                  value={transaction.amount}
                  onChange={(event) =>
                    setTransaction((current) => ({ ...current, amount: event.target.value }))
                  }
                  placeholder="2500"
                  required
                />
              </label>
              <label className="field">
                <span>Category</span>
                <input
                  value={transaction.category}
                  onChange={(event) =>
                    setTransaction((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Food"
                  required
                />
              </label>
              <label className="field">
                <span>Date and time</span>
                <input
                  type="datetime-local"
                  value={transaction.happenedAt}
                  onChange={(event) =>
                    setTransaction((current) => ({ ...current, happenedAt: event.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <div className="form-grid three-up">
              <label className="field">
                <span>Type</span>
                <select
                  value={transaction.kind}
                  onChange={(event) =>
                    setTransaction((current) => ({
                      ...current,
                      kind: event.target.value as TransactionFormState["kind"]
                    }))
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  value={transaction.status}
                  onChange={(event) =>
                    setTransaction((current) => ({
                      ...current,
                      status: event.target.value as TransactionFormState["status"]
                    }))
                  }
                >
                  <option value="processed">Processed</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </label>
              <label className="field">
                <span>Notes</span>
                <input
                  value={transaction.notes}
                  onChange={(event) =>
                    setTransaction((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Optional note"
                />
              </label>
            </div>
            <button className="submit-button" disabled={isPending} type="submit">
              <Plus size={16} />
              Add transaction
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Add saving goal</h2>
              <div className="muted">Plan bigger targets with a deadline and live progress.</div>
            </div>
            <div className="capsule">{data.goals.length} goals</div>
          </div>

          <form className="data-form" onSubmit={submitGoal}>
            <label className="field">
              <span>Goal name</span>
              <input
                value={goal.name}
                onChange={(event) => setGoal((current) => ({ ...current, name: event.target.value }))}
                placeholder="Emergency fund"
                required
              />
            </label>
            <div className="form-grid three-up">
              <label className="field">
                <span>Current saved</span>
                <input
                  type="number"
                  min="0"
                  value={goal.current}
                  onChange={(event) => setGoal((current) => ({ ...current, current: event.target.value }))}
                  placeholder="25000"
                  required
                />
              </label>
              <label className="field">
                <span>Target</span>
                <input
                  type="number"
                  min="0"
                  value={goal.target}
                  onChange={(event) => setGoal((current) => ({ ...current, target: event.target.value }))}
                  placeholder="100000"
                  required
                />
              </label>
              <label className="field">
                <span>Deadline</span>
                <input
                  type="date"
                  value={goal.deadline}
                  onChange={(event) => setGoal((current) => ({ ...current, deadline: event.target.value }))}
                  required
                />
              </label>
            </div>
            <label className="field color-field">
              <span>Accent</span>
              <input
                type="color"
                value={goal.accent}
                onChange={(event) => setGoal((current) => ({ ...current, accent: event.target.value }))}
              />
            </label>
            <button className="submit-button" disabled={isPending} type="submit">
              <Plus size={16} />
              Add goal
            </button>
          </form>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Budget architecture</h2>
              <div className="muted">Category caps, live usage, and momentum signals.</div>
            </div>
            <div className="capsule">Live sync</div>
          </div>

          <div className="budget-list">
            {data.budgets.map((budgetItem) => (
              <article key={budgetItem.id} className="budget-item">
                <div className="budget-top">
                  <div>
                    <strong>{budgetItem.name}</strong>
                    <div className="muted">{budgetItem.category}</div>
                  </div>
                  <div className="metric-block">
                    <strong>{currency(budgetItem.spent)}</strong>
                    <div className="muted">of {currency(budgetItem.limit)}</div>
                  </div>
                </div>
                <div className="bar-shell">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.min(100, budgetItem.utilization)}%`,
                      background: `linear-gradient(90deg, ${budgetItem.accent}, rgba(255,255,255,0.85))`
                    }}
                  />
                </div>
                <div className="row-between budget-meta">
                  <div className="capsule">{budgetItem.utilization.toFixed(1)}% used</div>
                  <div className={budgetItem.trend >= 0 ? "trend-up" : "trend-down"}>
                    {percent(budgetItem.trend)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Predictive signals</h2>
              <div className="muted">Fast summaries pulled from recent budget behavior.</div>
            </div>
            <div className="capsule">Auto</div>
          </div>

          <div className="insight-list">
            {data.insights.map((insight) => (
              <article key={insight.title} className="insight">
                <div className="meta">{insight.title}</div>
                <div className="headline-number insight-value">{insight.value}</div>
                <div className="muted">{insight.body}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panels-row">
        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Transaction stream</h2>
              <div className="muted">Recent money movement across your budget engine.</div>
            </div>
            <div className="capsule">{data.transactions.length} shown</div>
          </div>

          <div className="transaction-list">
            {data.transactions.map((item) => (
              <article key={item.id} className="transaction-item">
                <div className="transaction-icon">
                  <ArrowUpRight size={18} color={item.kind === "income" ? "#52e7c5" : "#5fd3ff"} />
                </div>
                <div className="transaction-main">
                  <div>
                    <strong>{item.label}</strong>
                    <div className="muted">
                      {item.merchant} / {item.category} / {item.dateLabel}
                    </div>
                  </div>
                </div>
                <div className="metric-block">
                  <strong>{currency(item.amount)}</strong>
                  <div
                    className={`status-pill ${
                      item.status === "processed" ? "status-processed" : "status-scheduled"
                    }`}
                  >
                    {item.status}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Goal engine</h2>
              <div className="muted">Long-horizon savings with clear checkpoints.</div>
            </div>
            <div className="capsule">{currency(data.user.monthlyIncome)} income</div>
          </div>

          <div className="goal-list">
            {data.goals.map((item) => (
              <article key={item.id} className="goal-card">
                <div className="goal-top">
                  <div>
                    <strong>{item.name}</strong>
                    <div className="muted">{item.daysLeft} days left</div>
                  </div>
                  <div className="capsule">{item.progress.toFixed(0)}% online</div>
                </div>

                <div className="goal-progress">
                  <strong>{currency(item.current)}</strong>
                  <div className="muted">Target {currency(item.target)}</div>
                </div>

                <div className="bar-shell">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.min(100, item.progress)}%`,
                      background: `linear-gradient(90deg, ${item.accent}, rgba(255,255,255,0.85))`
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  detail,
  icon,
  label,
  tone,
  value
}: {
  label: string;
  value: string;
  detail: string;
  tone: "up" | "down" | "neutral";
  icon: React.ReactNode;
}) {
  return (
    <article className="card">
      <div className="stat-top">
        <div className="stat-label">{label}</div>
        <div className={tone === "up" ? "trend-up" : tone === "down" ? "trend-down" : "muted"}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="muted">{detail}</div>
    </article>
  );
}
