"use client";

import { useEffect, useState, useCallback } from "react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (loading) return <div className="p-8">Loading dashboard metrics...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ghost-white)" }}>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="heading-1">Admin Dashboard</h1>
          <p className="subtitle mt-2">Monitor platform metrics and manage operations</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Users Card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="label mb-2">Total Users</p>
                <p className="heading-2">{metrics.total_users || 0}</p>
              </div>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "var(--color-mint-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                👥
              </div>
            </div>
          </div>

          {/* Active Subscriptions Card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="label mb-2">Active Subscriptions</p>
                <p className="heading-2">{metrics.active_subscriptions || 0}</p>
              </div>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "var(--color-mint-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                ✅
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="label mb-2">Total Revenue</p>
                <p className="heading-2">${Number(metrics.total_revenue || 0).toFixed(2)}</p>
              </div>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "var(--color-mint-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                💰
              </div>
            </div>
          </div>

          {/* Charity Donations Card */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="label mb-2">Charity Giving</p>
                <p className="heading-2">${Number(metrics.total_charity_donations || 0).toFixed(2)}</p>
              </div>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "var(--color-mint-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                ❤️
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Prize Pool */}
        {metrics.monthly_prize_pool && metrics.monthly_prize_pool.length > 0 && (
          <div className="card card-prize" style={{ background: "linear-gradient(135deg, #52b788, #2d6a4f)", marginBottom: "24px" }}>
            <h2 className="heading-2 text-white mb-6">Monthly Prize Pool</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
              <div>
                <p className="text-sm opacity-80">Total Pool</p>
                <p className="text-3xl font-bold">${Number(metrics.monthly_prize_pool[0]?.total_pool || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Rollover Amount</p>
                <p className="text-3xl font-bold">${Number(metrics.monthly_prize_pool[0]?.rollover_amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Match Distribution</p>
                <div className="text-sm mt-2 space-y-1">
                  <p>Match 5: ${Number(metrics.monthly_prize_pool[0]?.match_5_pool || 0).toFixed(2)}</p>
                  <p>Match 4: ${Number(metrics.monthly_prize_pool[0]?.match_4_pool || 0).toFixed(2)}</p>
                  <p>Match 3: ${Number(metrics.monthly_prize_pool[0]?.match_3_pool || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/admin" className="card card-impact text-center cursor-pointer border-2" style={{ borderColor: "var(--color-emerald)", transition: "all 0.3s ease" }}>
            <div className="text-4xl mb-4">🎲</div>
            <h3 className="heading-3 mb-2">Manage Draws</h3>
            <p className="subtitle">Run, simulate, and finalize draws</p>
          </a>
          <a href="/scores" className="card card-impact text-center cursor-pointer border-2" style={{ borderColor: "var(--color-emerald)", transition: "all 0.3s ease" }}>
            <div className="text-4xl mb-4">⛳</div>
            <h3 className="heading-3 mb-2">Score Manager</h3>
            <p className="subtitle">Add and manage user scores</p>
          </a>
          <a href="/dashboard" className="card card-impact text-center cursor-pointer border-2" style={{ borderColor: "var(--color-emerald)", transition: "all 0.3s ease" }}>
            <div className="text-4xl mb-4">📊</div>
            <h3 className="heading-3 mb-2">Reports</h3>
            <p className="subtitle">View detailed analytics</p>
          </a>
        </div>
      </div>
    </div>
  );
}
