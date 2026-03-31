"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminDashboard() {
  const router = useRouter();
  const { addToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [recentDraws, setRecentDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token";

  async function fetchData() {
    try {
      const resM = await fetch("/api/admin/analytics", { headers: { "x-admin-token": adminToken } });
      if (resM.ok) {
        const data = await resM.json();
        setMetrics(data.metrics);
      }
      const resD = await fetch("/api/draw/run", { headers: { "x-admin-token": adminToken } });
      if (resD.ok) {
         const data = await resD.json();
         setRecentDraws(data.draws || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminAuthenticated");
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    fetchData();
  }, []);

  const handleSimulate = async (type = "random") => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/draw/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ draw_type: type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast(`Simulation: ${data.numbers}`, "info");
      fetchData();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRun = async (type = "random") => {
    if (!confirm(`Run ${type.toUpperCase()} draw?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/draw/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ draw_type: type })
      });
      if (!res.ok) throw new Error("Failed to run draw");
      addToast("Draw Published!");
      fetchData();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async (drawId) => {
    if (!confirm("Finalize draw?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/draw/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ draw_id: drawId })
      });
      if (!res.ok) throw new Error("Failed to finalize draw");
      addToast("Draw Finalized");
      fetchData();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    router.push("/admin/login");
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 bg-gray-50 p-8 flex flex-col justify-between">
        <div>
           <div className="mb-10">
              <h1 className="text-xl font-bold tracking-tight text-emerald">ADMIN PANEL</h1>
           </div>
           <nav className="space-y-4">
              {[
                { label: "Dashboard", href: "/admin", icon: "📊" },
                { label: "Users", href: "/admin/users", icon: "👥" },
                { label: "Winners", href: "/admin/winners", icon: "🏅" },
                { label: "Charities", href: "/admin/charities", icon: "❤️" },
                { label: "Logs", href: "/admin/logs", icon: "📜" }
              ].map((item, idx) => (
                <Link key={idx} href={item.href} className="flex items-center gap-3 text-sm font-medium text-gray-600 hover:text-emerald transition">
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
           </nav>
        </div>
        <div className="pt-6 border-t border-gray-200">
           <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700 transition">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold">Overview</h2>
           <Link href="/" className="text-sm font-medium text-emerald hover:underline">View Live Site &rarr;</Link>
        </div>

        {/* Basic Metrics */}
        {metrics && (
           <div className="grid grid-cols-4 gap-6 mb-10">
              {[
                { label: "Users", val: metrics.total_users },
                { label: "Prize Pool", val: `$${metrics.total_prize_pool}` },
                { label: "Donations", val: `$${metrics.total_donations}` },
                { label: "Draws", val: metrics.total_draws }
              ].map((m, i) => (
                <div key={i} className="border border-gray-100 p-6 rounded shadow-sm">
                   <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{m.label}</p>
                   <p className="text-xl font-bold mt-1">{m.val}</p>
                </div>
              ))}
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* Orchestration */}
           <div className="space-y-8">
              <section className="border border-gray-100 p-6 rounded flex flex-col gap-6">
                 <h3 className="font-bold text-sm uppercase text-gray-400 tracking-wider">Draw Orchestra</h3>
                 <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                       <span className="font-bold text-sm">Random Protocol</span>
                       <div className="flex gap-2">
                          <button disabled={actionLoading} onClick={() => handleSimulate('random')} className="px-4 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-white transition">Simulate</button>
                          <button disabled={actionLoading} onClick={() => handleRun('random')} className="px-4 py-1.5 bg-gray-900 text-white rounded text-xs font-bold hover:bg-black transition">Run & Publish</button>
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                       <span className="font-bold text-sm">Algorithmic Protocol</span>
                       <div className="flex gap-2">
                          <button disabled={actionLoading} onClick={() => handleSimulate('algorithmic')} className="px-4 py-1.5 border border-gray-200 rounded text-xs font-bold hover:bg-white transition">Simulate</button>
                          <button disabled={actionLoading} onClick={() => handleRun('algorithmic')} className="px-4 py-1.5 bg-emerald text-white rounded text-xs font-bold hover:bg-emerald-700 transition">Initiate</button>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Draw History List */}
              <section className="border border-gray-100 p-6 rounded">
                 <h3 className="font-bold text-sm uppercase text-gray-400 tracking-wider mb-6">Draw Lifecycle</h3>
                 <div className="space-y-4">
                    {recentDraws.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No historical draws.</p>
                    ) : recentDraws.map(draw => (
                      <div key={draw.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                         <div>
                            <p className="text-xs font-bold text-gray-800">{new Date(draw.created_at).toLocaleDateString()} // {(draw.type || 'standard').toUpperCase()}</p>
                            <p className="text-sm font-mono text-gray-400 mt-0.5">{draw.numbers || 'PENDING'}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald opacity-60">{draw.status}</span>
                            {draw.status === 'published' && (
                               <button onClick={() => handleFinalize(draw.id)} className="px-3 py-1 bg-emerald text-white rounded text-[10px] font-bold uppercase transition hover:bg-emerald-700">Finalize</button>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </main>
    </div>
  );
}