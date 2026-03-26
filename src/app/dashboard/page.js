"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reports/metrics");
        if (!res.ok) throw new Error(`Server status ${res.status}`);
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard metrics...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="label">Total users</p>
          <p className="text-3xl font-semibold">{metrics.total_users}</p>
        </div>
        <div className="card">
          <p className="label">Active subscriptions</p>
          <p className="text-3xl font-semibold">{metrics.active_subscriptions}</p>
        </div>
        <div className="card">
          <p className="label">Total revenue</p>
          <p className="text-3xl font-semibold">${Number(metrics.total_revenue || 0).toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="label">Charity giving</p>
          <p className="text-3xl font-semibold">${Number(metrics.total_charity_donations || 0).toFixed(2)}</p>
        </div>
      </div>

      <section className="card">
        <h2 className="text-2xl font-semibold mb-2">Monthly prize pools</h2>
        <div className="space-y-2">
          {(metrics.monthly_prize_pool || []).map((row) => (
            <div key={row.draw_id} className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <span className="font-semibold">Draw: {row.draw_id}</span>
              <span>Total: ${Number(row.total_pool).toFixed(2)}</span>
              <span>5-match: ${Number(row.match_5_pool).toFixed(2)}</span>
              <span>4-match: ${Number(row.match_4_pool).toFixed(2)}</span>
              <span>3-match: ${Number(row.match_3_pool).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
