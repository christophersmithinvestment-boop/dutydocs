"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ContractorAlertsWidget() {
  const [expiredCount, setExpiredCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("contractor_documents")
        .select("*");

      if (error) {
        console.error("Error fetching alerts:", error);
      } else if (data) {
        const expired = data.filter((doc) => doc.is_expired).length;
        // Approximation: let's say "expiring soon" is hardcoded or just a placeholder for now since we don't have the exact logic in DB
        // If we have 'is_expiring_soon' we can use it. For now, we'll assume 0 unless there's a specific flag.
        const expiringSoon = data.filter((doc) => !doc.is_expired && doc.needs_review).length;
        
        setExpiredCount(expired);
        setExpiringSoonCount(expiringSoon);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-neutral-200 text-left animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200 text-left relative overflow-hidden">
      {/* Decorative accent */}
      <div className={`absolute top-0 left-0 w-1 h-full ${expiredCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Contractor Alerts
        </h3>
        <Link 
          href="/contractors" 
          className="text-sm text-teal-600 font-medium hover:text-teal-700 hover:underline"
        >
          View Register →
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 rounded-md bg-neutral-50 border border-neutral-100">
          <span className="text-sm font-medium text-neutral-600">Expired Documents</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            expiredCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {expiredCount}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 rounded-md bg-neutral-50 border border-neutral-100">
          <span className="text-sm font-medium text-neutral-600">Expiring Soon</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            expiringSoonCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-neutral-200 text-neutral-700'
          }`}>
            {expiringSoonCount}
          </span>
        </div>
      </div>
    </div>
  );
}
