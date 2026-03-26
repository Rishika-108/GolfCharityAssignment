"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadDraws();
  }, []);

  const loadDraws = async () => {
    try {
      const res = await fetch("/api/draw/run", {
        method: "GET",
        headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token" }
      });
      if (!res.ok) throw new Error("Failed to load draws");
      const data = await res.json();
      setDraws(data.draws || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runDraw = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/draw/run", {
        method: "POST",
        headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token" }
      });
      if (!res.ok) throw new Error("Failed to run draw");
      const data = await res.json();
      setDraws(prev => [data.draw, ...prev]);
      alert("Draw completed successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const simulateDraw = async (drawId) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/draw/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token"
        },
        body: JSON.stringify({ draw_id: drawId })
      });
      if (!res.ok) throw new Error("Failed to simulate draw");
      const data = await res.json();
      alert(`Simulation complete! Results: ${data.results.length} participants`);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const finalizeDraw = async (drawId) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/draw/finalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token"
        },
        body: JSON.stringify({ draw_id: drawId })
      });
      if (!res.ok) throw new Error("Failed to finalize draw");
      const data = await res.json();
      alert(`Draw finalized! ${data.winnersCreated} winners created`);
      loadDraws();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading admin panel...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ghost-white)" }}>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="heading-1">Admin Panel</h1>
          <p className="subtitle mt-2">Manage draws, winners, and platform operations</p>
        </div>

        {/* Quick Actions */}
        <div className="card card-impact mb-8">
          <h2 className="heading-2 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={runDraw}
              disabled={actionLoading}
              className="btn-primary py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {actionLoading ? "..." : "🎲"} Run New Draw
            </button>
            <button
              onClick={() => window.location.href = "/scores"}
              className="btn-secondary py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              ⛳ Manage Scores
            </button>
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="btn-outline py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              📊 View Dashboard
            </button>
          </div>
        </div>

        {/* Recent Draws */}
        <div className="card">
          <h2 className="heading-2 mb-6">Recent Draws</h2>
          {draws.length === 0 ? (
            <p className="subtitle">No draws yet. Run your first draw!</p>
          ) : (
            <div className="space-y-4">
              {draws.slice(0, 10).map((draw) => (
                <div key={draw.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--color-charcoal)" }}>
                        Draw #{draw.id.substring(0, 8)} - {draw.month}/{draw.year}
                      </h3>
                      <p className="subtitle text-sm">
                        Status: <span style={{
                          color: draw.status === "published" ? "var(--color-active)" :
                                 draw.status === "pending" ? "var(--color-pending)" : "var(--color-muted)"
                        }}>
                          {draw.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {draw.status === "pending" && (
                        <>
                          <button
                            onClick={() => simulateDraw(draw.id)}
                            disabled={actionLoading}
                            className="btn-outline px-3 py-1 text-sm"
                          >
                            Simulate
                          </button>
                          <button
                            onClick={() => finalizeDraw(draw.id)}
                            disabled={actionLoading}
                            className="btn-primary px-3 py-1 text-sm"
                          >
                            Finalize
                          </button>
                        </>
                      )}
                      {draw.status === "published" && (
                        <span className="px-3 py-1 text-sm rounded-full" style={{
                          background: "var(--color-mint-light)",
                          color: "var(--color-deep-forest)"
                        }}>
                          Published
                        </span>
                      )}
                    </div>
                  </div>
                  {draw.draw_numbers && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Numbers:</span>
                      <div className="flex gap-1">
                        {draw.draw_numbers.map((num, i) => (
                          <div key={i} className="score-token" style={{ width: "30px", height: "30px", fontSize: "12px" }}>
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card card-impact">
            <h3 className="heading-3 mb-4">Winner Management</h3>
            <p className="subtitle mb-4">Review and approve winner proofs, manage payouts</p>
            <button className="btn-outline w-full py-2 rounded-lg font-semibold">
              Manage Winners →
            </button>
          </div>

          <div className="card card-impact">
            <h3 className="heading-3 mb-4">System Logs</h3>
            <p className="subtitle mb-4">View admin actions and system events</p>
            <button className="btn-outline w-full py-2 rounded-lg font-semibold">
              View Logs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}