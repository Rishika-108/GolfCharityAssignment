"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [drawType, setDrawType] = useState("random");

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminAuthenticated");
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    loadDraws();
    loadAnalytics();
  }, [router]);

  const loadAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { "x-admin-token": "admin-token" }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (err) { console.error(err); }
  };

  const runDraw = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/draw/run", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-token": "admin-token" 
        },
        body: JSON.stringify({ draw_type: drawType })
      });
      if (!res.ok) throw new Error("Failed to run draw");
      const data = await res.json();
      setDraws(prev => [data.draw, ...prev]);
      addToast(`${drawType.toUpperCase()} Draw completed successfully!`);
      loadAnalytics();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const loadDraws = async () => {
    try {
      const res = await fetch("/api/draw/run", {
        method: "GET",
        headers: { "x-admin-token": "admin-token" }
      });
      if (!res.ok) throw new Error("Failed to load draws");
      const data = await res.json();
      setDraws(data.draws || []);
    } catch (err) {
      setError(err.message);
      addToast("Connection issue with draw server", "error");
    } finally {
      setLoading(false);
    }
  };

  const simulateDraw = async (drawId) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/draw/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "admin-token"
        },
        body: JSON.stringify({ draw_id: drawId })
      });
      if (!res.ok) throw new Error("Failed to simulate draw");
      const data = await res.json();
      addToast(`Simulation complete! Results: ${data.results.length} participants`);
    } catch (err) {
      addToast(err.message, "error");
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
          "x-admin-token": "admin-token"
        },
        body: JSON.stringify({ draw_id: drawId })
      });
      if (!res.ok) throw new Error("Failed to finalize draw");
      const data = await res.json();
      addToast(`Draw finalized! ${data.winnersCreated} winners created`);
      loadDraws();
      loadAnalytics();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading admin panel...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ghost-white)" }}>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="heading-1">Admin Panel</h1>
            <p className="subtitle mt-2">Manage draws, winners, and platform operations</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => { localStorage.removeItem("isAdminAuthenticated"); router.push("/"); }}
               className="text-sm font-bold text-red-400 hover:text-red-500 transition"
             >
               Logout Admin
             </button>
             <Link href="/" className="text-sm font-medium text-gray-500 hover:text-emerald">Live Site &nearr;</Link>
          </div>
        </div>

        {/* Analytics Section */}
        {metrics && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: "Total Users", val: metrics.total_users, icon: "👥" },
                { label: "Total Draws", val: metrics.total_draws, icon: "🎲" },
                { label: "Prize Pool", val: `$${Number(metrics.total_prize_pool).toFixed(2)}`, icon: "💰" },
                { label: "Donations", val: `$${Number(metrics.total_donations).toFixed(2)}`, icon: "❤️" }
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-2xl">{m.icon}</span>
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{m.label}</span>
                   </div>
                   <div className="text-2xl font-black text-gray-900">{m.val}</div>
                </div>
              ))}
           </div>
        )}

        {/* Quick Actions */}
        <div className="card card-impact mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <h2 className="heading-2">Draw Controls</h2>
            <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
               <button onClick={() => setDrawType("random")} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${drawType === 'random' ? 'bg-white shadow-sm text-emerald' : 'text-gray-400'}`}>Random</button>
               <button onClick={() => setDrawType("algorithmic")} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${drawType === 'algorithmic' ? 'bg-white shadow-sm text-emerald' : 'text-gray-400'}`}>Algorithmic</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={runDraw}
              disabled={actionLoading}
              className="btn-primary py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {actionLoading ? "..." : "🎲"} Run {drawType} Draw
            </button>
            <button
              onClick={() => window.location.href = "/admin/charities"}
              className="btn-secondary py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              🏢 Manage Charities
            </button>
            <button
              onClick={() => window.location.href = "/admin/winners"}
              className="btn-outline py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              🏆 Manage Winners
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
            <button onClick={() => window.location.href = "/admin/winners"} className="btn-outline w-full py-2 rounded-lg font-semibold border border-emerald text-emerald hover:bg-emerald/10 transition">
              Manage Winners &rarr;
            </button>
          </div>

          <div className="card card-impact">
            <h3 className="heading-3 mb-4">System Logs</h3>
            <p className="subtitle mb-4">View admin actions and system events</p>
            <button onClick={() => window.location.href = "/admin/logs"} className="btn-outline w-full py-2 rounded-lg font-semibold border border-emerald text-emerald hover:bg-emerald/10 transition">
              View Logs &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}