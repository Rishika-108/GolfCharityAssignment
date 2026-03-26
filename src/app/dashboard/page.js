"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [donateAmount, setDonateAmount] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const res = await fetch("/api/user/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error(`Failed to fetch profile: ${res.status}`);
      }
      
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleManageSub = async (action) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/subscription/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ subscription_id: userData.subscription.id, action })
      });
      if (!res.ok) throw new Error("Failed to change subscription");
      loadProfile();
      alert(`Subscription ${action}ed successfully.`);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!donateAmount || Number(donateAmount) <= 0) return alert("Enter valid donation amount");
    setActionLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/donations/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ charity_id: userData.charity.charity_id, amount: donateAmount })
      });
      if (!res.ok) throw new Error("Failed donation");
      alert("Thank you for your direct donation!");
      setDonateAmount("");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadProof = async (winnerId) => {
    if (!proofUrl) return alert("Enter proof file URL (or link)");
    setActionLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/winners/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ winner_id: winnerId, file_url: proofUrl })
      });
      if (!res.ok) throw new Error("Failed to upload proof");
      alert("Proof uploaded successfully! Awaiting review.");
      setProofUrl("");
      loadProfile();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600 font-medium">Loading your dashboard...</div>;
  if (error) return <div className="p-8 text-red-500 text-center font-medium">Error: {error}</div>;

  const { profile, subscription, charity, scores, winners } = userData;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.full_name}</h1>
            <p className="text-sm text-gray-500 mt-1">{profile?.email} • {profile?.country}</p>
          </div>
          <div className="flex gap-4">
            {profile?.is_admin && (
              <Link href="/admin" className="btn-outline px-4 py-2 border border-emerald text-emerald rounded shadow hover:bg-green-50">
                Admin Panel
              </Link>
            )}
            <button onClick={() => { localStorage.removeItem("authToken"); router.push("/login"); }} className="px-4 py-2 text-red-600 hover:text-red-800 font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Winners Section (if applicable) */}
        {winners && winners.length > 0 && (
          <div className="bg-emerald border-2 border-emerald text-white rounded-xl shadow p-6 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-4">🏆 Congratulations! You have winning draws!</h2>
            <div className="space-y-4">
              {winners.map(w => (
                <div key={w.id} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{w.match_type.replace("_", " ").toUpperCase()}</h3>
                    <p className="text-sm opacity-90">Prize Amount: ${Number(w.prize_amount).toFixed(2)}</p>
                    <p className="text-sm font-medium mt-1">Status: <span className="uppercase text-yellow-200">{w.status}</span></p>
                  </div>
                  {w.status === "pending" || w.status === "waiting_proof" ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                       <input 
                         type="text" 
                         placeholder="Paste Proof Image URL" 
                         value={proofUrl} 
                         onChange={(e) => setProofUrl(e.target.value)} 
                         className="px-3 py-2 text-gray-900 rounded shadow-inner w-full sm:w-64 focus:outline-none"
                       />
                       <button 
                         disabled={actionLoading} 
                         onClick={() => handleUploadProof(w.id)} 
                         className="bg-white text-emerald px-4 py-2 rounded font-bold hover:bg-gray-100 transition whitespace-nowrap"
                       >
                         Upload Proof
                       </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Grid: Subscription & Charity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Subscription Card */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Subscription</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {subscription ? subscription.status : "No Active Sub"}
                </span>
              </div>
              
              {subscription ? (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Plan: <span className="font-semibold">{subscription.plan_type}</span>
                  </p>
                  {subscription.start_date && (
                    <p className="text-gray-600 text-sm">
                      Started: {new Date(subscription.start_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-4">You don't have an active subscription yet.</p>
                  <button className="btn-primary bg-emerald text-white px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition">
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>
            {subscription && (
              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end">
                {subscription.status === "active" ? (
                  <button disabled={actionLoading} onClick={() => handleManageSub("cancel")} className="text-red-500 hover:text-red-700 text-sm font-medium">Cancel Subscription</button>
                ) : subscription.status === "cancelled" ? (
                  <button disabled={actionLoading} onClick={() => handleManageSub("resume")} className="text-emerald hover:underline text-sm font-medium">Resume Subscription</button>
                ) : null}
              </div>
            )}
          </div>

          {/* Charity Card */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Impact</h2>
              {charity ? (
                 <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald flex items-center justify-center text-white text-xl">
                        ❤️
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{charity.charities?.name || "Selected Charity"}</h3>
                        <p className="text-xs text-gray-500">{charity.contribution_percentage}% of your pool earnings goes here</p>
                      </div>
                   </div>
                 </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-4">Make an impact by selecting a charity.</p>
                  <button className="btn-outline border border-emerald text-emerald px-6 py-2 rounded-full font-medium hover:bg-green-50 transition">
                    Select Charity
                  </button>
                </div>
              )}
            </div>
            {charity && (
              <div className="pt-4 mt-6 border-t border-gray-100 flex flex-col gap-3">
                 <div className="flex items-center gap-2">
                   <input type="number" placeholder="Amt ($)" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} className="w-24 px-3 py-1.5 border border-gray-300 rounded text-sm outline-none" />
                   <button disabled={actionLoading} onClick={handleDonate} className="text-sm font-medium text-white bg-emerald px-4 py-2 rounded shadow-sm hover:bg-opacity-90 w-full">
                     Donate Directly
                   </button>
                 </div>
                 <button className="text-xs font-medium text-gray-500 hover:text-gray-700 text-right">
                   Change Selected Charity
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Scores Card */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Your Golf Scores</h2>
            <Link href="/scores" className="text-emerald text-sm hover:underline font-medium">View All / Add &rarr;</Link>
          </div>
          
          {scores && scores.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {scores.map((s) => (
                <div key={s.id} className="border border-emerald/20 bg-emerald/5 rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-emerald mb-1">{s.score}</span>
                  <span className="text-xs text-gray-500">{new Date(s.played_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
              <div className="text-4xl mb-2">⛳</div>
              <p className="text-gray-500 mb-4">No scores submitted yet. You need 5 scores to be eligible for draws.</p>
              <Link href="/scores" className="btn-primary bg-emerald text-white px-6 py-2 rounded-full font-medium inline-block hover:bg-opacity-90 transition">
                Submit Your First Score
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
