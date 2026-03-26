"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScoresPage() {
  const router = useRouter();
  const [scores, setScores] = useState([]);
  const [nextScore, setNextScore] = useState("");
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchScores = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/scores`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Could not load scores");
      }
      const data = await res.json();
      setScores(data.scores || []);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const submitScore = async () => {
    setMessage(null);
    if (!nextScore || nextScore < 1 || nextScore > 45) {
      setMessage("Score must be between 1 and 45");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return router.push("/login");

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ score: Number(nextScore), played_at: playedAt }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to add score");
      }
      
      setMessage("Score successfully added!");
      setScores(data.scores || []);
      setNextScore("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Score Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage your golf scores</p>
          </div>
          <Link href="/dashboard" className="text-emerald hover:underline font-medium text-sm">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Score Entry Card */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Score</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score (1-45)</label>
              <input 
                type="number" 
                min="1" 
                max="45" 
                value={nextScore} 
                onChange={(e) => setNextScore(e.target.value)} 
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-emerald focus:border-emerald outline-none transition"
                placeholder="e.g. 24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Played At</label>
              <input 
                type="date" 
                value={playedAt} 
                onChange={(e) => setPlayedAt(e.target.value)} 
                className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-emerald focus:border-emerald outline-none transition"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={submitScore} 
                className="w-full bg-emerald text-white py-2 px-4 rounded-md font-medium hover:bg-opacity-90 transition shadow-sm"
              >
                Submit Score
              </button>
            </div>
          </div>
          
          {message && (
            <div className={`mt-6 p-4 rounded-md text-sm font-medium ${message.includes("success") ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message}
            </div>
          )}
        </div>

        {/* Scores List */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Your Recent Scores</h2>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading scores...</p>
          ) : scores.length === 0 ? (
            <p className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">No scores submitted yet. Play a game and submit your score!</p>
          ) : (
            <div className="space-y-4">
              {scores.map((score) => (
                <div 
                  key={score.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-emerald/30 hover:bg-emerald/5 transition"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-emerald text-white flex items-center justify-center text-xl font-bold shadow-sm">
                      {score.score}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Score Entry</p>
                      <p className="text-sm text-gray-500">{new Date(score.played_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 max-w-[100px] truncate" title={score.id}>
                    ID: {score.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
