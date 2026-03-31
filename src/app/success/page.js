"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/subscription/verify?session_id=${sessionId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
           const data = await res.json();
           if (data.status === "active") {
              setTimeout(() => router.push("/dashboard"), 3000);
           }
        }
      } catch (err) {
        console.error("Verification failed:", err);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-mint-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="text-3xl font-extrabold text-deep-forest mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your contribution. Your subscription is being activated as we speak.
        </p>
        
        <div className="space-y-4">
          <Link href="/dashboard" className="block w-full btn-primary bg-emerald text-white py-3 rounded-lg font-bold shadow hover:bg-opacity-90 transition">
            Go to Dashboard
          </Link>
          <p className="text-xs text-muted">
            It might take a minute for your status to update.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mint-light flex items-center justify-center p-4 text-deep-forest">
        Loading...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
