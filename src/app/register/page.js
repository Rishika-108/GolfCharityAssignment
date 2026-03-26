"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    country: "",
    charity_id: "00000000-0000-0000-0000-000000000000", // Default or fetch real ones
    contribution_percentage: 10,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // In real app, charity_id should be selected from a list. 
      // Ensure we format data correctly.
      const payload = {
        ...formData,
        contribution_percentage: Number(formData.contribution_percentage),
        // Providing a dummy charity_id just for the code to work if user selects none
        charity_id: formData.charity_id === "" ? "00000000-0000-0000-0000-000000000000" : formData.charity_id, 
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Store token safely
      if (data.session) {
        localStorage.setItem("authToken", data.session.access_token);
        localStorage.setItem("user", JSON.stringify(data.profile));
        router.push("/dashboard");
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input name="full_name" type="text" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Full Name" value={formData.full_name} onChange={handleChange} />
            </div>
            <div>
              <input name="email" type="email" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Email address" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <input name="password" type="password" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Password" value={formData.password} onChange={handleChange} />
            </div>
            <div>
              <input name="country" type="text" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Country" value={formData.country} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Charity Contribution</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Contribution Percentage (%)</label>
              <input name="contribution_percentage" type="number" min="10" max="100" required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                value={formData.contribution_percentage} onChange={handleChange} />
            </div>
          </div>

          <div>
            <button
              type="submit" disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald"
              style={{ background: "#2d6a4f" }}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline text-emerald" style={{ color: "#2d6a4f" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
