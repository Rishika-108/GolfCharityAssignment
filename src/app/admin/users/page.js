"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || "admin-token";

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-token": adminToken }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleAdmin = async (userId, currentStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ userId, is_admin: !currentStatus })
      });
      if (!res.ok) throw new Error("Failed to update user status");
      addToast("User permissions updated!");
      fetchUsers();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure? This will delete the user profile and all associated data.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminToken }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      addToast("User deleted successfully");
      fetchUsers();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    window.location.href = "/admin/login";
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-medium h-screen flex flex-col justify-center">Loading User Directory...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Consistent Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage platform members & permissions</p>
          </div>
          <div className="flex gap-4">
             <Link href="/admin" className="px-4 py-2 text-emerald hover:text-emerald-700 font-medium">Dashboard</Link>
             <button onClick={handleLogout} className="px-4 py-2 text-red-600 hover:text-red-800 font-medium">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                 <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Subscriber</th>
                 <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
                 <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Tier</th>
                 <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {users.map(user => (
                 <tr key={user.id} className="hover:bg-gray-50 transition group">
                   <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-emerald text-white rounded-full flex items-center justify-center font-bold text-xs">
                           {user.full_name?.substring(0, 1).toUpperCase()}
                         </div>
                         <div>
                            <div className="font-bold text-gray-900">{user.full_name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                         </div>
                      </div>
                   </td>
                   <td className="px-8 py-6 text-sm font-medium text-gray-600">{user.country || "Global"}</td>
                   <td className="px-8 py-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.is_admin ? 'bg-violet-100 text-violet-700' : 'bg-green-100 text-green-700'}`}>
                        {user.is_admin ? "Admin" : "Subscriber"}
                      </span>
                   </td>
                   <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition">
                         <button 
                            disabled={actionLoading}
                            onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                            className="text-xs font-bold text-emerald uppercase tracking-widest hover:underline"
                         >
                           {user.is_admin ? "Demote" : "Make Admin"}
                         </button>
                         <button 
                            disabled={actionLoading}
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline"
                         >
                           Delete
                         </button>
                      </div>
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
