"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    country: "",
    admin_secret: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Very basic check for admin secret (in real app, validate on backend)
      if (formData.admin_secret !== (process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token")) {
        throw new Error("Invalid admin secret");
      }

      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        is_admin: true,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Admin Registration failed");
      }

      // Store token safely
      if (data.session) {
        localStorage.setItem("authToken", data.session.access_token);
        localStorage.setItem("user", JSON.stringify(data.profile));
        router.push("/admin");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Admin Registration</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-400 text-sm text-center font-medium bg-red-900 bg-opacity-50 p-2 rounded">{error}</div>}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input name="full_name" type="text" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Admin Full Name" value={formData.full_name} onChange={handleChange} />
            </div>
            <div>
              <input name="email" type="email" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Admin Email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <input name="password" type="password" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Password" value={formData.password} onChange={handleChange} />
            </div>
            <div>
              <input name="country" type="text" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Country Origin" value={formData.country} onChange={handleChange} />
            </div>
            <div>
              <input name="admin_secret" type="password" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-emerald focus:border-emerald sm:text-sm"
                placeholder="Admin Secret Key" value={formData.admin_secret} onChange={handleChange} />
            </div>
          </div>

          <div>
            <button
              type="submit" disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald"
              style={{ background: "#2d6a4f" }}
            >
              {loading ? "Registering..." : "Register Admin"}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Already an admin?{" "}
            <Link href="/login" className="font-medium hover:text-white text-emerald" style={{ color: "#52b788" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
