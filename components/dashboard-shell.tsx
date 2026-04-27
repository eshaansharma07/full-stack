import {
  ArrowUpRight,
  BrainCircuit,
  CircleDollarSign,
  Clock3,
  Goal,
  Sparkles,
  Wallet
} from "lucide-react";

import { currency, percent } from "@/lib/format";

type DashboardData = NonNullable<Awaited<ReturnType<typeof import("@/lib/dashboard").getDashboardData>>>;

export function DashboardShell({ data }: { data: DashboardData }) {
  return (
    <main className="dashboard">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">BudgetSense Future / Personal finance cockpit</div>
            <h1>See every rupee before it moves.</h1>
            <p className="hero-copy">
              A cinematic budget command center for tracking cash flow, monitoring category burn,
              planning savings goals, and spotting pressure points early.
            </p>
            <div className="hero-actions">
              <div className="action">
                <Sparkles size={18} />
                Smart monthly view
              </div>
              <div className="ghost-action">
                <BrainCircuit size={18} />
                AI-style insights
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
          </aside>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Income pulse"
          value={currency(data.overview.income)}
          tone="up"
          detail="Current credited income"
          icon={<CircleDollarSign size={18} />}
        />
        <StatCard
          label="Expense burn"
          value={currency(data.overview.expenses)}
          tone="down"
          detail="Processed spending"
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Scheduled next"
          value={currency(data.overview.scheduled)}
          tone="neutral"
          detail="Upcoming automated moves"
          icon={<Clock3 size={18} />}
        />
        <StatCard
          label="Goals online"
          value={`${data.goals.length}`}
          tone="up"
          detail="Active saving missions"
          icon={<Goal size={18} />}
        />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="row-between">
            <div>
              <h2 className="section-heading">Budget architecture</h2>
              <div className="muted">Category caps, live usage, and momentum signals.</div>
            </div>
            <div className="capsule">Live sync</div>
          </div>

          <div className="budget-list">
            {data.budgets.map((budget) => (
              <article key={budget.id} className="budget-item">
                <div className="budget-top">
                  <div>
                    <strong>{budget.name}</strong>
                    <div className="muted">{budget.category}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong>{currency(budget.spent)}</strong>
                    <div className="muted">of {currency(budget.limit)}</div>
                  </div>
                </div>
                <div className="bar-shell">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.min(100, budget.utilization)}%`,
                      background: `linear-gradient(90deg, ${budget.accent}, rgba(255,255,255,0.85))`
                    }}
                  />
                </div>
                <div className="row-between" style={{ marginTop: 12 }}>
                  <div className="capsule">{budget.utilization.toFixed(1)}% used</div>
                  <div className={budget.trend >= 0 ? "trend-up" : "trend-down"}>
                    {percent(budget.trend)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="row-between">
            <div>
              <h2 className="section-heading">Predictive signals</h2>
              <div className="muted">Fast summaries pulled from recent budget behavior.</div>
            </div>
            <div className="capsule">3 active</div>
          </div>

          <div className="insight-list">
            {data.insights.map((insight) => (
              <article key={insight.title} className="insight">
                <div className="meta">{insight.title}</div>
                <div className="headline-number" style={{ fontSize: "2rem", margin: "10px 0 4px" }}>
                  {insight.value}
                </div>
                <div className="muted">{insight.body}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panels-row">
        <div className="panel">
          <div className="row-between">
            <div>
              <h2 className="section-heading">Transaction stream</h2>
              <div className="muted">Recent money movement across accounts and automations.</div>
            </div>
            <div className="capsule">{data.transactions.length} items</div>
          </div>

          <div className="transaction-list">
            {data.transactions.map((transaction) => (
              <article key={transaction.id} className="transaction-item">
                <div className="transaction-icon">
                  <ArrowUpRight size={18} color={transaction.kind === "income" ? "#52e7c5" : "#5fd3ff"} />
                </div>
                <div className="transaction-main">
                  <div>
                    <strong>{transaction.label}</strong>
                    <div className="muted">
                      {transaction.merchant} / {transaction.category} / {transaction.dateLabel}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>{currency(transaction.amount)}</strong>
                  <div
                    className={`status-pill ${
                      transaction.status === "processed" ? "status-processed" : "status-scheduled"
                    }`}
                  >
                    {transaction.status}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="row-between">
            <div>
              <h2 className="section-heading">Goal engine</h2>
              <div className="muted">Long-horizon savings with visual progress checkpoints.</div>
            </div>
            <div className="capsule">{currency(data.user.monthlyIncome)} income</div>
          </div>

          <div className="goal-list">
            {data.goals.map((goal) => (
              <article key={goal.id} className="goal-card">
                <div className="goal-top">
                  <div>
                    <strong>{goal.name}</strong>
                    <div className="muted">{goal.daysLeft} days left</div>
                  </div>
                  <div className="capsule">{goal.progress.toFixed(0)}% online</div>
                </div>

                <div className="goal-progress">
                  <strong>{currency(goal.current)}</strong>
                  <div className="muted">Target {currency(goal.target)}</div>
                </div>

                <div className="bar-shell">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.min(100, goal.progress)}%`,
                      background: `linear-gradient(90deg, ${goal.accent}, rgba(255,255,255,0.85))`
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
