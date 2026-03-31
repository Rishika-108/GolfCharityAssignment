"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminCharities() {
  const { addToast } = useToast();
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      return addToast("Image too large (max 2MB)", "warning");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormData(prev => ({ ...prev, image_url: reader.result }));
      addToast("Image processed successfully", "info");
    };
  };

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
      
      addToast("Charity added successfully!");
      setFormData({ name: "", description: "", image_url: "", country: "", is_featured: false });
      setShowAddForm(false);
      fetchCharities();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  if (loading) return <div className="p-8 font-medium">Loading charity management...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Charity Management</h1>
             <Link href="/admin" className="text-emerald hover:underline text-sm font-medium">&larr; Back to Admin Panel</Link>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition active:scale-95"
            style={{ background: "#2d6a4f" }}
          >
            {showAddForm ? "Cancel" : "Add New Charity"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-xl font-black mb-8 text-gray-900">New Charity Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Charity Name</label>
                  <input name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-gray-100 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald/10 focus:border-emerald transition" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Country / Region</label>
                  <input name="country" required value={formData.country} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-gray-100 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald/10 focus:border-emerald transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Mission Description</label>
                <textarea name="description" required rows="3" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border-gray-100 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald/10 focus:border-emerald transition"></textarea>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Charity Cover Image</label>
                <div className="flex items-center gap-6">
                   {formData.image_url ? (
                     <img src={formData.image_url} alt="Preview" className="w-24 h-24 rounded-xl object-cover shadow-md border-2 border-white" />
                   ) : (
                     <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">📷</div>
                   )}
                   <div className="flex-1">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="charity-upload" />
                      <label htmlFor="charity-upload" className="bg-white border text-gray-700 px-6 py-2 rounded-xl font-bold cursor-pointer hover:bg-gray-100 transition inline-block">
                        Choose File
                      </label>
                      <p className="text-xs text-gray-400 mt-2">Max size: 2MB. Recommended 800x400px.</p>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-emerald/5 p-4 rounded-xl inline-flex">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-5 h-5 text-emerald focus:ring-emerald border-gray-300 rounded cursor-pointer" />
                <label className="text-sm font-bold text-emerald cursor-pointer">Feature this charity on the homepage</label>
              </div>
              <div className="flex justify-end pt-8">
                <button disabled={actionLoading} type="submit" className="bg-emerald text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-opacity-90 transition active:scale-95 disabled:opacity-50" style={{ background: "#2d6a4f" }}>
                  {actionLoading ? "Creating Profile..." : "Publish Charity"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Charity Details</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Region</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Tier Status</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {charities.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-8 py-12 text-center text-gray-400 font-medium">No charities found. Add your first partner above!</td>
                </tr>
              ) : charities.map(charity => (
                <tr key={charity.id} className="hover:bg-gray-50/30 transition group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <img src={charity.image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=100"} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                       <div>
                         <div className="font-bold text-gray-900 group-hover:text-emerald transition">{charity.name}</div>
                         <div className="text-xs text-gray-400 max-w-xs truncate">{charity.description}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-600">{charity.country || "Global"}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${charity.is_featured ? 'bg-emerald/10 text-emerald' : 'bg-gray-100 text-gray-400'}`}>
                      {charity.is_featured ? "Featured Partner" : "Standard"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-gray-400 hover:text-emerald font-black text-xs uppercase tracking-widest transition">Manage</button>
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
