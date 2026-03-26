"use client";

import { useEffect, useState } from "react";

export default function ScoresPage() {
  const [userId, setUserId] = useState("");
  const [scores, setScores] = useState([]);
  const [nextScore, setNextScore] = useState(27);
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchScores = async () => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/scores?user_id=${userId}`);
    if (!res.ok) return setMessage("Could not load scores");
    const data = await res.json();
    setScores(data.scores || []);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchScores();
  }, [userId]);

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
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Score Manager</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 card">
        <div>
          <label className="label">User ID</label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full rounded border p-2" />
        </div>
        <div>
          <label className="label">Score</label>
          <input type="number" min="1" max="45" value={nextScore} onChange={(e) => setNextScore(e.target.value)} className="w-full rounded border p-2" />
        </div>
        <div>
          <label className="label">Played At</label>
          <input type="date" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} className="w-full rounded border p-2" />
        </div>
        <div className="flex items-end">
          <button onClick={submitScore} className="btn-primary px-4 py-2 rounded-xl">
            Add score
          </button>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-2xl font-semibold mb-2">Latest Scores</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-2">
            {scores.length === 0 ? (
              <li>No scores yet for this user.</li>
            ) : (
              scores.map((score) => (
                <li key={score.id} className="border rounded p-2">
                  <strong>{score.score}</strong> - {new Date(score.played_at).toLocaleDateString()}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {message && <p className="text-sm text-indigo-700">{message}</p>}
    </div>
  );
}
