"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token";

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdminAuthenticated");
    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs", {
        headers: { "x-admin-token": adminToken }
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

  const getActionColor = (action) => {
    if (action.includes('draw')) return 'bg-emerald text-white';
    if (action.includes('payout')) return 'bg-blue-500 text-white';
    if (action.includes('winner')) return 'bg-violet-500 text-white';
    return 'bg-gray-400 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 italic">
               AUDIT TRAIL
             </h1>
             <Link href="/admin" className="text-emerald hover:underline text-sm font-bold mt-1 inline-block uppercase tracking-widest">&larr; Dashboard</Link>
          </div>
          <button onClick={fetchLogs} className="bg-white border-2 border-gray-100 p-3 rounded-2xl hover:bg-gray-50 active:scale-95 transition shadow-sm font-black text-xs uppercase">
             🔄 Refresh Trace
          </button>
        </div>

        {loading ? (
            <div className="py-20 text-center text-gray-400 font-black animate-pulse uppercase tracking-widest">Compiling Transactional History...</div>
        ) : logs.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
               <div className="text-6xl mb-6 opacity-20">🍃</div>
               <p className="text-gray-400 font-bold italic tracking-wide">The ledger is currently blank. Execute platform actions to generate logs.</p>
            </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
             <div className="divide-y divide-gray-50">
               {logs.map((log) => (
                 <div key={log.id} className="p-6 hover:bg-emerald/5 transition flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex gap-6 items-start">
                       <div className={`w-12 h-12 rounded-2xl ${getActionColor(log.action)} flex items-center justify-center shrink-0 font-black text-xs uppercase shadow-lg shadow-current/20`}>
                         {log.action.substring(0, 2)}
                       </div>
                       <div>
                          <div className="text-gray-900 font-black tracking-tight text-lg uppercase">{log.action.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-gray-400 font-medium mt-1">
                             {log.entity_type.toUpperCase()} // <span className="font-mono text-[10px] text-gray-300">{log.entity_id || 'SYSTEM_LEVEL'}</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <div className="text-xs font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                         {new Date(log.created_at).toLocaleString('en-GB', { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </div>
                       <div className="text-[10px] text-gray-300 font-bold mt-2 uppercase tracking-widest leading-none">
                         OPERATOR: {log.admin_id}
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
