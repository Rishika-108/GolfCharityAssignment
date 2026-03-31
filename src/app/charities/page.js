"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CharityDirectory() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");

  useEffect(() => {
    async function fetchCharities() {
      try {
        const res = await fetch("/api/charities");
        if (res.ok) {
          const data = await res.json();
          setCharities(data.charities || []);
        }
      } catch (err) {
        console.error("Failed to fetch charities:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCharities();
  }, []);

  const countries = ["All", ...new Set(charities.map(c => c.country || "Global"))];

  const filtered = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "All" || c.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-emerald text-white py-16 px-4 shadow-lg" style={{ background: "linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)" }}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Charity Partners</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Discover the organizations your contributions are supporting. Every match you make brings us closer to a better world.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="flex justify-between items-center mb-8">
           <Link href="/" className="text-emerald font-semibold hover:underline flex items-center gap-1">
             &larr; Back to Home
           </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-12 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Charities</label>
            <input 
              type="text" 
              placeholder="Search by name or mission..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald focus:border-emerald outline-none transition"
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Country / Region</label>
            <select 
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald focus:border-emerald outline-none transition bg-white"
            >
              {countries.map(country => <option key={country} value={country}>{country}</option>)}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium">Loading charities...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">No charities found matching your criteria.</p>
            <button onClick={() => { setSearchTerm(""); setSelectedCountry("All"); }} className="mt-4 text-emerald font-bold border-b border-emerald">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(charity => (
              <div key={charity.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col group">
                <div className="h-48 overflow-hidden relative">
                   <img 
                     src={charity.image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400"} 
                     alt={charity.name}
                     className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                   />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald border border-emerald/20">
                     {charity.country || "Global"}
                   </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{charity.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">
                    {charity.description}
                  </p>
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-emerald uppercase tracking-wider">Active Partner</span>
                    <Link href="/register" className="bg-emerald text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-opacity-90 transition">
                      Support
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
