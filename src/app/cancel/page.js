"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-red-500">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✕
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          No charges were made. You can try again whenever you're ready to support your favorite charity!
        </p>
        
        <div className="space-y-4">
          <Link href="/dashboard" className="block w-full bg-gray-900 text-white py-3 rounded-lg font-bold shadow hover:bg-gray-800 transition">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
