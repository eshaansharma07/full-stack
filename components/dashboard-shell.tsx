"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BrainCircuit,
  CircleDollarSign,
  Clock3,
  Download,
  Goal,
  Plus,
  RotateCcw,
  Sparkles,
  Upload,
  Wallet
} from "lucide-react";

import { buildDashboardData } from "@/lib/dashboard-data";
import { currency, percent } from "@/lib/format";
import type { DashboardData, StoreShape } from "@/lib/types";

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

const storageKey = "budgetsense-future-store-v1";

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

export function DashboardShell({
  data: initialData,
  initialStore
}: {
  data: DashboardData;
  initialStore: StoreShape;
}) {
  const [store, setStore] = useState<StoreShape>(initialStore);
  const [data, setData] = useState(initialData);
  const [profile, setProfile] = useState<ProfileFormState>({
    name: initialStore.user.name,
    email: initialStore.user.email,
    monthlyIncome: String(initialStore.user.monthlyIncome)
  });
  const [budget, setBudget] = useState<BudgetFormState>(defaultBudget);
  const [transaction, setTransaction] = useState<TransactionFormState>(defaultTransaction);
  const [goal, setGoal] = useState<GoalFormState>(defaultGoal);
  const [feedback, setFeedback] = useState<string>("Your edits save in this browser, including on Vercel.");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as StoreShape;
      setStore(parsed);
      setData(buildDashboardData(parsed));
      setProfile({
        name: parsed.user.name,
        email: parsed.user.email,
        monthlyIncome: String(parsed.user.monthlyIncome)
      });
    } catch {
      setFeedback("Saved browser data could not be loaded, so demo data is being used.");
    }
  }, []);

  function saveStore(nextStore: StoreShape, message: string) {
    setStore(nextStore);
    setData(buildDashboardData(nextStore));
    setProfile({
      name: nextStore.user.name,
      email: nextStore.user.email,
      monthlyIncome: String(nextStore.user.monthlyIncome)
    });
    window.localStorage.setItem(storageKey, JSON.stringify(nextStore));
    setFeedback(message);
  }

  function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile.name.trim() || !profile.email.trim()) {
      setFeedback("Name and email are required.");
      return;
    }

    const monthlyIncome = Number(profile.monthlyIncome);
    if (Number.isNaN(monthlyIncome) || monthlyIncome < 0) {
      setFeedback("Monthly income must be a valid number.");
      return;
    }

    saveStore(
      {
        ...store,
        user: {
          ...store.user,
          name: profile.name.trim(),
          email: profile.email.trim(),
          monthlyIncome
        }
      },
      "Profile saved in your browser."
    );
  }

  function submitBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const limit = Number(budget.limit);
    const spent = Number(budget.spent);
    const trend = Number(budget.trend);

    if (!budget.name.trim() || !budget.category.trim()) {
      setFeedback("Budget name and category are required.");
      return;
    }

    if ([limit, spent, trend].some(Number.isNaN) || limit < 0 || spent < 0) {
      setFeedback("Budget values must be valid numbers.");
      return;
    }

    saveStore(
      {
        ...store,
        budgets: [
          {
            id: crypto.randomUUID(),
            name: budget.name.trim(),
            category: budget.category.trim(),
            limit,
            spent,
            accent: budget.accent,
            trend
          },
          ...store.budgets
        ]
      },
      "Budget bucket added."
    );
    setBudget(defaultBudget);
  }

  function submitTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(transaction.amount);

    if (
      !transaction.label.trim() ||
      !transaction.category.trim() ||
      !transaction.merchant.trim() ||
      !transaction.happenedAt
    ) {
      setFeedback("Transaction title, merchant, category, and date are required.");
      return;
    }

    if (Number.isNaN(amount) || amount < 0) {
      setFeedback("Transaction amount must be a valid number.");
      return;
    }

    saveStore(
      {
        ...store,
        transactions: [
          {
            id: crypto.randomUUID(),
            label: transaction.label.trim(),
            notes: transaction.notes.trim() || undefined,
            amount,
            kind: transaction.kind,
            category: transaction.category.trim(),
            merchant: transaction.merchant.trim(),
            status: transaction.status,
            happenedAt: new Date(transaction.happenedAt).toISOString()
          },
          ...store.transactions
        ]
      },
      "Transaction added."
    );
    setTransaction({
      ...defaultTransaction,
      happenedAt: new Date().toISOString().slice(0, 16)
    });
  }

  function submitGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = Number(goal.current);
    const target = Number(goal.target);

    if (!goal.name.trim() || !goal.deadline) {
      setFeedback("Goal name and deadline are required.");
      return;
    }

    if (Number.isNaN(current) || Number.isNaN(target) || current < 0 || target <= 0) {
      setFeedback("Goal amounts must be valid and target must be greater than zero.");
      return;
    }

    saveStore(
      {
        ...store,
        goals: [
          {
            id: crypto.randomUUID(),
            name: goal.name.trim(),
            current,
            target,
            deadline: new Date(goal.deadline).toISOString(),
            accent: goal.accent
          },
          ...store.goals
        ]
      },
      "Goal added."
    );
    setGoal(defaultGoal);
  }

  function resetToDemo() {
    window.localStorage.removeItem(storageKey);
    setStore(initialStore);
    setData(initialData);
    setProfile({
      name: initialStore.user.name,
      email: initialStore.user.email,
      monthlyIncome: String(initialStore.user.monthlyIncome)
    });
    setFeedback("Reset to demo data.");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "budgetsense-data.json";
    link.click();
    URL.revokeObjectURL(url);
    setFeedback("Data exported.");
  }

  function importData(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StoreShape;
        saveStore(parsed, "Imported data loaded.");
      } catch {
        setFeedback("Import failed. Please choose a valid JSON export.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <main className="dashboard">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">BudgetSense Future / Personal finance cockpit</div>
            <h1>Build your budget, not just a dashboard.</h1>
            <p className="hero-copy">
              Your entries now save in this browser, so the app works on Vercel too. Add your own
              profile, budgets, expenses, incomes, and goals without hitting the old server-write wall.
            </p>
            <div className="hero-actions">
              <div className="action">
                <Sparkles size={18} />
                Personal data mode
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
            <div className="hero-tools">
              <button className="ghost-button" onClick={exportData} type="button">
                <Download size={16} />
                Export
              </button>
              <button className="ghost-button" onClick={resetToDemo} type="button">
                <RotateCcw size={16} />
                Reset
              </button>
              <label className="ghost-button file-button">
                <Upload size={16} />
                Import
                <input accept="application/json" onChange={importData} type="file" />
              </label>
            </div>
            {feedback ? <div className="form-feedback">{feedback}</div> : null}
          </aside>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Income pulse" value={currency(data.overview.income)} tone="up" detail="All credited income" icon={<CircleDollarSign size={18} />} />
        <StatCard label="Expense burn" value={currency(data.overview.expenses)} tone="down" detail="Tracked processed spending" icon={<Wallet size={18} />} />
        <StatCard label="Scheduled next" value={currency(data.overview.scheduled)} tone="neutral" detail="Upcoming planned money moves" icon={<Clock3 size={18} />} />
        <StatCard label="Goals online" value={`${data.goals.length}`} tone="up" detail="Savings targets in progress" icon={<Goal size={18} />} />
      </section>

      <section className="workspace-grid">
        <div className="panel">
          <div className="row-between panel-heading">
            <div>
              <h2 className="section-heading">Your profile</h2>
              <div className="muted">Use your own identity and monthly income baseline.</div>
            </div>
            <div className="capsule">Browser saved</div>
          </div>

          <form className="data-form" onSubmit={submitProfile}>
            <label className="field">
              <span>Name</span>
              <input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" required />
            </label>
            <label className="field">
              <span>Monthly income</span>
              <input type="number" min="0" value={profile.monthlyIncome} onChange={(event) => setProfile((current) => ({ ...current, monthlyIncome: event.target.value }))} placeholder="120000" required />
            </label>
            <button className="submit-button" type="submit">
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
                <input value={budget.name} onChange={(event) => setBudget((current) => ({ ...current, name: event.target.value }))} placeholder="Groceries" required />
              </label>
              <label className="field">
                <span>Category</span>
                <input value={budget.category} onChange={(event) => setBudget((current) => ({ ...current, category: event.target.value }))} placeholder="Food" required />
              </label>
            </div>
            <div className="form-grid three-up">
              <label className="field">
                <span>Limit</span>
                <input type="number" min="0" value={budget.limit} onChange={(event) => setBudget((current) => ({ ...current, limit: event.target.value }))} placeholder="10000" required />
              </label>
              <label className="field">
                <span>Spent</span>
                <input type="number" min="0" value={budget.spent} onChange={(event) => setBudget((current) => ({ ...current, spent: event.target.value }))} placeholder="2400" required />
              </label>
              <label className="field">
                <span>Trend %</span>
                <input type="number" value={budget.trend} onChange={(event) => setBudget((current) => ({ ...current, trend: event.target.value }))} placeholder="8.2" required />
              </label>
            </div>
            <label className="field color-field">
              <span>Accent</span>
              <input type="color" value={budget.accent} onChange={(event) => setBudget((current) => ({ ...current, accent: event.target.value }))} />
            </label>
            <button className="submit-button" type="submit">
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
            <div className="capsule">{store.transactions.length} total</div>
          </div>

          <form className="data-form" onSubmit={submitTransaction}>
            <div className="form-grid two-up">
              <label className="field">
                <span>Title</span>
                <input value={transaction.label} onChange={(event) => setTransaction((current) => ({ ...current, label: event.target.value }))} placeholder="Salary" required />
              </label>
              <label className="field">
                <span>Merchant</span>
                <input value={transaction.merchant} onChange={(event) => setTransaction((current) => ({ ...current, merchant: event.target.value }))} placeholder="Bank / UPI / Employer" required />
              </label>
            </div>
            <div className="form-grid three-up">
              <label className="field">
                <span>Amount</span>
                <input type="number" min="0" value={transaction.amount} onChange={(event) => setTransaction((current) => ({ ...current, amount: event.target.value }))} placeholder="2500" required />
              </label>
              <label className="field">
                <span>Category</span>
                <input value={transaction.category} onChange={(event) => setTransaction((current) => ({ ...current, category: event.target.value }))} placeholder="Food" required />
              </label>
              <label className="field">
                <span>Date and time</span>
                <input type="datetime-local" value={transaction.happenedAt} onChange={(event) => setTransaction((current) => ({ ...current, happenedAt: event.target.value }))} required />
              </label>
            </div>
            <div className="form-grid three-up">
              <label className="field">
                <span>Type</span>
                <select value={transaction.kind} onChange={(event) => setTransaction((current) => ({ ...current, kind: event.target.value as TransactionFormState["kind"] }))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label className="field">
                <span>Status</span>
                <select value={transaction.status} onChange={(event) => setTransaction((current) => ({ ...current, status: event.target.value as TransactionFormState["status"] }))}>
                  <option value="processed">Processed</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </label>
              <label className="field">
                <span>Notes</span>
                <input value={transaction.notes} onChange={(event) => setTransaction((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional note" />
              </label>
            </div>
            <button className="submit-button" type="submit">
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
              <input value={goal.name} onChange={(event) => setGoal((current) => ({ ...current, name: event.target.value }))} placeholder="Emergency fund" required />
            </label>
            <div className="form-grid three-up">
              <label className="field">
                <span>Current saved</span>
                <input type="number" min="0" value={goal.current} onChange={(event) => setGoal((current) => ({ ...current, current: event.target.value }))} placeholder="25000" required />
              </label>
              <label className="field">
                <span>Target</span>
                <input type="number" min="0" value={goal.target} onChange={(event) => setGoal((current) => ({ ...current, target: event.target.value }))} placeholder="100000" required />
              </label>
              <label className="field">
                <span>Deadline</span>
                <input type="date" value={goal.deadline} onChange={(event) => setGoal((current) => ({ ...current, deadline: event.target.value }))} required />
              </label>
            </div>
            <label className="field color-field">
              <span>Accent</span>
              <input type="color" value={goal.accent} onChange={(event) => setGoal((current) => ({ ...current, accent: event.target.value }))} />
            </label>
            <button className="submit-button" type="submit">
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
                  <div className="bar-fill" style={{ width: `${Math.min(100, budgetItem.utilization)}%`, background: `linear-gradient(90deg, ${budgetItem.accent}, rgba(255,255,255,0.85))` }} />
                </div>
                <div className="row-between budget-meta">
                  <div className="capsule">{budgetItem.utilization.toFixed(1)}% used</div>
                  <div className={budgetItem.trend >= 0 ? "trend-up" : "trend-down"}>{percent(budgetItem.trend)}</div>
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
                    <div className="muted">{item.merchant} / {item.category} / {item.dateLabel}</div>
                  </div>
                </div>
                <div className="metric-block">
                  <strong>{currency(item.amount)}</strong>
                  <div className={`status-pill ${item.status === "processed" ? "status-processed" : "status-scheduled"}`}>
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
                  <div className="bar-fill" style={{ width: `${Math.min(100, item.progress)}%`, background: `linear-gradient(90deg, ${item.accent}, rgba(255,255,255,0.85))` }} />
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
