"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Hardcoded credentials match requirement
    if (email === "admin123@gmail.com" && password === "123456") {
      // Simulate login success - store a local session flag
      localStorage.setItem("isAdminAuthenticated", "true");
      // Redirect to admin panel
      router.push("/admin");
    } else {
      setError("Invalid admin credentials. Access Denied.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-emerald-900 p-8 text-center text-white" style={{ background: "linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)" }}>
           <div className="text-4xl mb-4">🔐</div>
           <h1 className="text-2xl font-black tracking-tight">Admin Gatekeeper</h1>
           <p className="text-sm opacity-70 mt-2">Authorized Access Only</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Admin Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald outline-none transition bg-gray-50"
              placeholder="admin@platform.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Access Key</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-emerald outline-none transition bg-gray-50"
              placeholder="••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-900 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:translate-y-[-2px] transition active:translate-y-0"
            style={{ background: "#2d6a4f" }}
          >
            {loading ? "Verifying..." : "Grant Access"}
          </button>
          
          <div className="text-center pt-4">
             <Link href="/" className="text-sm text-gray-400 hover:text-emerald transition font-medium">
                &larr; Return to Public Site
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
