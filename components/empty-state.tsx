export function EmptyState() {
  return (
    <main className="empty-shell">
      <section className="empty-panel">
        <div className="eyebrow">BudgetSense Future / Setup required</div>
        <h1 style={{ marginBottom: 12 }}>No finance profile found yet.</h1>
        <p className="hero-copy">
          The local demo store is missing. Restore <code>data/demo-store.json</code> to bring the dashboard back.
        </p>
      </section>
    </main>
  );
}
