"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [donateAmount, setDonateAmount] = useState("");
  const [showSubModal, setShowSubModal] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charitiesList, setCharitiesList] = useState([]);
  const [selectedCharityId, setSelectedCharityId] = useState("");
  const [contribution, setContribution] = useState(10);

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
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [router, addToast]);

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
      addToast(`Subscription ${action}ed successfully.`);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!donateAmount || Number(donateAmount) <= 0) return addToast("Enter valid donation amount", "warning");
    setActionLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/donations/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ charity_id: userData.charity.charity_id, amount: donateAmount })
      });
      if (!res.ok) throw new Error("Failed donation");
      addToast("Thank you for your direct donation! ❤️");
      setDonateAmount("");
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadProof = async (winnerId) => {
    if (!proofUrl) return addToast("Enter proof file URL (or link)", "warning");
    setActionLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/winners/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ winner_id: winnerId, file_url: proofUrl })
      });
      if (!res.ok) throw new Error("Failed to upload proof");
      addToast("Proof uploaded successfully! Awaiting review.");
      setProofUrl("");
      loadProfile();
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ plan_type: planType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (e) {
      addToast(e.message, "error");
      setActionLoading(false);
    }
  };

  const handleFetchCharities = async () => {
    try {
      const res = await fetch("/api/charities");
      if (res.ok) {
        const data = await res.json();
        setCharitiesList(data.charities || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCharity = async () => {
    if (!selectedCharityId) return addToast("Select a charity!", "warning");
    if (contribution < 10) return addToast("Minimum 10% contribution required!", "warning");
    setActionLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/user/charity", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          charity_id: selectedCharityId,
          contribution_percentage: Number(contribution)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update charity");
      addToast("Charity updated successfully!");
      setShowCharityModal(false);
      loadProfile();
    } catch (e) {
      addToast(e.message, "error");
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
                      Started: {subscription.start_date.slice(0, 10)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-4">You don't have an active subscription yet.</p>
                  <button onClick={() => setShowSubModal(true)} className="btn-primary bg-emerald text-white px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition">
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>
            {subscription && (
              <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-4 items-center">
                {subscription.status === "active" ? (
                  <button disabled={actionLoading} onClick={() => handleManageSub("cancel")} className="text-red-500 hover:text-red-700 text-sm font-medium">Cancel Subscription</button>
                ) : subscription.status === "cancelled" ? (
                  <button disabled={actionLoading} onClick={() => handleManageSub("resume")} className="text-emerald hover:underline text-sm font-medium">Resume Subscription</button>
                ) : subscription.status === "pending" || subscription.status === "past_due" ? (
                  <>
                    <button disabled={actionLoading} onClick={() => handleManageSub("cancel")} className="text-red-500 hover:text-red-700 text-sm font-medium">Cancel Subscription</button>
                    <button disabled={actionLoading} onClick={() => handleSubscribe(subscription.plan_type)} className="text-white bg-emerald px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-opacity-90">Complete Payment</button>
                  </>
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
                  <button onClick={() => { handleFetchCharities(); setShowCharityModal(true); }} className="btn-outline border border-emerald text-emerald px-6 py-2 rounded-full font-medium hover:bg-green-50 transition">
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
                 <button onClick={() => { handleFetchCharities(); setShowCharityModal(true); }} className="text-xs font-medium text-gray-500 hover:text-gray-700 text-right">
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
                  <span className="text-xs text-gray-500">{s.played_at.slice(0, 10)}</span>
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

      {/* Subscribe Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Choose Your Plan</h2>
            <p className="text-gray-500 mb-6 text-sm">Support charities and participate in our monthly draws.</p>
            <div className="space-y-4">
              <button disabled={actionLoading} onClick={() => handleSubscribe('monthly')} className="w-full bg-emerald text-white py-3 rounded-lg font-bold shadow hover:bg-opacity-90 transition">
                Monthly Plan
              </button>
              <button disabled={actionLoading} onClick={() => handleSubscribe('yearly')} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold shadow hover:bg-gray-800 transition">
                Yearly Plan (Save 15%)
              </button>
            </div>
            <button disabled={actionLoading} onClick={() => setShowSubModal(false)} className="mt-6 text-gray-500 hover:text-gray-700 font-medium">Cancel</button>
          </div>
        </div>
      )}

      {/* Charity Modal */}
      {showCharityModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-left">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Select a Charity</h2>
            <p className="text-gray-500 mb-6 text-sm">Choose where your draw contribution goes. Minimum 10% is required by rules.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Charity</label>
                <select value={selectedCharityId} onChange={(e) => setSelectedCharityId(e.target.value)} className="w-full px-3 py-2 border rounded shadow-sm focus:outline-emerald border-gray-300 bg-white text-gray-900">
                  <option value="">-- Choose Charity --</option>
                  {charitiesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contribution Percentage (%)</label>
                <input type="number" min="10" max="100" value={contribution} onChange={(e) => setContribution(e.target.value)} className="w-full px-3 py-2 border rounded shadow-sm focus:outline-emerald border-gray-300 text-gray-900 bg-white" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button disabled={actionLoading} onClick={() => setShowCharityModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition">Cancel</button>
              <button disabled={actionLoading} onClick={handleUpdateCharity} className="px-4 py-2 bg-emerald text-white rounded font-medium shadow hover:bg-opacity-90 transition">Save Selection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
