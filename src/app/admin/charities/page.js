"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    country: "",
    is_featured: false
  });

  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token";

  async function fetchCharities() {
    try {
      const res = await fetch("/api/charities");
      if (res.ok) {
        const data = await res.json();
        setCharities(data.charities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCharities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/charities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to add charity");
      alert("Charity added successfully!");
      setFormData({ name: "", description: "", image_url: "", country: "", is_featured: false });
      setShowAddForm(false);
      fetchCharities();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  if (loading) return <div className="p-8">Loading charity management...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Charity Management</h1>
             <Link href="/admin" className="text-emerald hover:underline text-sm">&larr; Back to Admin Panel</Link>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition"
          >
            {showAddForm ? "Cancel" : "Add New Charity"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-12">
            <h2 className="text-xl font-bold mb-6 text-gray-800">New Charity Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Charity Name</label>
                  <input name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded shadow-sm outline-none focus:ring-2 focus:ring-emerald" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country / Region</label>
                  <input name="country" required value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border rounded shadow-sm outline-none focus:ring-2 focus:ring-emerald" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded shadow-sm outline-none focus:ring-2 focus:ring-emerald"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input name="image_url" value={formData.image_url} onChange={handleChange} className="w-full px-4 py-2 border rounded shadow-sm outline-none focus:ring-2 focus:ring-emerald" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-emerald focus:ring-emerald border-gray-300 rounded" />
                <label className="text-sm font-medium text-gray-700">Feature on Homepage</label>
              </div>
              <div className="flex justify-end pt-4">
                <button disabled={actionLoading} type="submit" className="bg-emerald text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-opacity-90 transition">
                  {actionLoading ? "Saving..." : "Save Charity"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">Name</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">Country</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {charities.map(charity => (
                <tr key={charity.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{charity.name}</div>
                    <div className="text-xs text-gray-400 max-w-xs truncate">{charity.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{charity.country || "Global"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${charity.is_featured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {charity.is_featured ? "Featured" : "Standard"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-emerald text-sm font-bold ml-4">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
