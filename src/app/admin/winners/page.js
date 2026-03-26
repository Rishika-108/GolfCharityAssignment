"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminWinnersPage() {
  const router = useRouter();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Authentication check isn't strictly necessary here if middleware protects but
  // we do check token for fetching inside admin pages implicitly.
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token";

  const loadWinners = useCallback(async () => {
    try {
      const res = await fetch("/api/reports/export?report=winners&format=json");
      if (!res.ok) throw new Error("Failed to load winners");
      const data = await res.json();
      setWinners(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWinners();
  }, [loadWinners]);

  const handleReview = async (winnerId, action) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/winners/review", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify({ winner_id: winnerId, action }) // "approve" or "reject"
      });
      if (!res.ok) throw new Error(`Failed to ${action} winner proof`);
      alert(`Proof ${action}d successfully`);
      loadWinners();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayout = async (winnerId) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/winners/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify({ winner_id: winnerId })
      });
      if (!res.ok) throw new Error(`Failed to process payout`);
      alert(`Payout marked as paid!`);
      loadWinners();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 font-medium">Loading Winners Management...</div>;
  if (error) return <div className="p-8 text-red-500 font-medium">Error: {error}</div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ghost-white)" }}>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="heading-1">Winner Management</h1>
            <p className="subtitle mt-2">Review uploaded proofs and manage prize payouts</p>
          </div>
          <Link href="/admin" className="text-emerald hover:underline font-medium">
            &larr; Back to Admin Panel
          </Link>
        </div>

        <div className="card shadow-sm bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="heading-2 mb-6">Winners Pending Action</h2>
          {winners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No winners found.</div>
          ) : (
            <div className="space-y-4">
              {winners.map((w) => {
                const proofUrl = w.proofs && w.proofs.length > 0 ? w.proofs[0].file_url : null;
                return (
                  <div key={w.id} className="border border-gray-200 rounded-lg p-5 hover:shadow transition bg-white flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg uppercase">{w.match_type.replace("_", " ")}</h3>
                      <p className="text-sm text-gray-600 mb-2">ID: {w.id.substring(0, 8)} | Prize: <span className="font-semibold text-emerald">${Number(w.prize_amount).toFixed(2)}</span></p>
                      <p className="text-sm font-medium">Status: 
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs uppercase
                          ${w.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            w.status === 'approved' ? 'bg-green-100 text-green-800' :
                            w.status === 'paid' ? 'bg-emerald text-white' : 'bg-red-100 text-red-800'
                          }`}>
                          {w.status}
                        </span>
                      </p>
                      {proofUrl && (
                        <div className="mt-3">
                          <a href={proofUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline border hover:bg-blue-50 px-2 py-1 rounded inline-block bg-white shadow-sm">
                            View Uploaded Proof &nearr;
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                      {w.status === "pending" && proofUrl && (
                        <>
                          <button disabled={actionLoading} onClick={() => handleReview(w.id, "approve")} className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition">
                            Approve Proof
                          </button>
                          <button disabled={actionLoading} onClick={() => handleReview(w.id, "reject")} className="w-full bg-red-100 text-red-600 hover:bg-red-200 font-medium py-2 px-4 rounded transition">
                            Reject Proof
                          </button>
                        </>
                      )}
                      {w.status === "pending" && !proofUrl && (
                         <div className="text-sm text-gray-400 italic bg-gray-50 p-3 rounded text-center border border-dashed h-full flex items-center justify-center">
                           Awaiting user upload...
                         </div>
                      )}
                      {w.status === "approved" && (
                        <button disabled={actionLoading} onClick={() => handlePayout(w.id)} className="w-full bg-emerald hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded transition shadow" style={{ background: "#2d6a4f" }}>
                          Mark as Paid
                        </button>
                      )}
                      {w.status === "paid" && (
                        <div className="text-sm text-emerald font-bold bg-green-50 p-2 rounded text-center h-full flex items-center justify-center">
                          ✅ Payout Complete
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
