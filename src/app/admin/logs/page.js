"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminAuthenticated");
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch("/api/admin/logs", {
        headers: { "x-admin-token": "admin-token" }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
               📜 System Logs
             </h1>
             <Link href="/admin" className="text-emerald hover:underline text-sm font-medium mt-1 inline-block">&larr; Back to Admin Panel</Link>
          </div>
          <button onClick={fetchLogs} className="bg-white border p-2 rounded-lg hover:bg-gray-50 active:scale-95 transition">
             🔄 Refresh
          </button>
        </div>

        {loading ? (
           <div className="py-20 text-center text-gray-500 font-medium">Crunching audit data...</div>
        ) : logs.length === 0 ? (
           <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
             <p className="text-gray-400">The audit trail is currently empty.</p>
           </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="divide-y divide-gray-50">
               {logs.map((log) => (
                 <div key={log.id} className="p-4 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4 items-start">
                       <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                         {log.action.substring(0, 2)}
                       </div>
                       <div>
                          <div className="text-gray-900 font-bold capitalize">{log.action.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-gray-500">
                             {log.entity_type} {log.entity_id && `ID: ${log.entity_id.substring(0, 8)}`}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-medium text-gray-700">
                         {new Date(log.created_at).toLocaleString()}
                       </div>
                       <div className="text-[10px] text-gray-300 font-mono">
                         ADMIN: {log.admin_id?.substring(0, 12)}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
