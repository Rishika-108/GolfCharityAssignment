"use client";

import { useEffect, useState, useCallback } from "react";

export default function ScoresPage() {
  const [userId, setUserId] = useState("");
  const [scores, setScores] = useState([]);
  const [nextScore, setNextScore] = useState(27);
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchScores = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/scores?user_id=${userId}`);
    if (!res.ok) return setMessage("Could not load scores");
    const data = await res.json();
    setScores(data.scores || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchScores();
  }, [userId, fetchScores]);

  const submitScore = async () => {
    if (!userId) return setMessage("User id needed");

    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, score: Number(nextScore), played_at: playedAt }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to add score");
      return;
    }
    setMessage("Score added");
    setScores(data.scores || []);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ghost-white)" }}>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="heading-1">Score Manager</h1>
          <p className="subtitle mt-2">Track and manage your golf scores</p>
        </div>

        {/* Score Entry Card */}
        <div className="card card-impact mb-8">
          <h2 className="heading-2 mb-6">Add New Score</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label block mb-2">User ID</label>
              <input 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
                className="w-full rounded border-2 border-gray-300 p-3 focus:border-emerald focus:outline-none transition"
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="label block mb-2">Score (1-45)</label>
              <input 
                type="number" 
                min="1" 
                max="45" 
                value={nextScore} 
                onChange={(e) => setNextScore(e.target.value)} 
                className="w-full rounded border-2 border-gray-300 p-3 focus:border-emerald focus:outline-none transition"
              />
            </div>
            <div>
              <label className="label block mb-2">Played At</label>
              <input 
                type="date" 
                value={playedAt} 
                onChange={(e) => setPlayedAt(e.target.value)} 
                className="w-full rounded border-2 border-gray-300 p-3 focus:border-emerald focus:outline-none transition"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={submitScore} 
                className="btn-primary w-full py-3 rounded-lg font-semibold"
              >
                Add Score
              </button>
            </div>
          </div>
        </div>

        {/* Scores List */}
        <div className="card">
          <h2 className="heading-2 mb-6">Latest Scores</h2>
          {loading ? (
            <p className="subtitle">Loading...</p>
          ) : scores.length === 0 ? (
            <p className="subtitle">No scores yet for this user.</p>
          ) : (
            <div className="space-y-3">
              {scores.map((score) => (
                <div 
                  key={score.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="score-token" style={{ width: "60px", height: "60px", fontSize: "18px" }}>
                      {score.score}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: "var(--color-charcoal)" }}>Score {score.score}</p>
                      <p className="subtitle">{new Date(score.played_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                    #ID: {score.id.substring(0, 8)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mt-6 p-4 rounded-lg" style={{ 
            background: message.includes("added") ? "var(--color-mint-light)" : "#fee",
            color: message.includes("added") ? "#1b4332" : "#c00"
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
