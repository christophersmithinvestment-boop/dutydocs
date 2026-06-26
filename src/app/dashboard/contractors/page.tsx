"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ContractorDocumentUploader from "@/components/ContractorDocumentUploader";

export default function ContractorRegisterPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from("contractor_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching documents:", error);
      else setDocuments(data || []);
      setLoading(false);
    };
    fetchDocuments();
  }, []);

  const getStatusColor = (doc: any) => {
    if (doc.status === "failed") return "text-red-400 bg-red-900/20 border-red-800";
    if (doc.is_expired) return "text-orange-400 bg-orange-900/20 border-orange-800";
    if (doc.is_low_coverage) return "text-yellow-400 bg-yellow-900/20 border-yellow-800";
    if (doc.status === "complete") return "text-emerald-400 bg-emerald-900/20 border-emerald-800";
    return "text-blue-400 bg-blue-900/20 border-blue-800";
  };

  const getStatusText = (doc: any) => {
    if (doc.status === "failed") return "Failed";
    if (doc.status === "processing") return "Processing...";
    if (doc.is_expired) return "Expired";
    if (doc.is_low_coverage) return "Low Coverage";
    if (doc.status === "complete") return "Compliant";
    return "Pending";
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === "all") return true;
    if (filter === "expired") return doc.is_expired;
    // For expiring soon, we could check the date, but for now we'll just check if it's not expired but has a date.
    // Assuming expiring soon isn't fully implemented in DB, we'll approximate or skip.
    if (filter === "compliant") return doc.status === "complete" && !doc.is_expired && !doc.is_low_coverage;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Contractor Register</h1>
            <p className="text-slate-400 mt-1">Manage and verify contractor compliance documents.</p>
          </div>
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {showUploader ? "Close Uploader" : "+ Upload Document"}
          </button>
        </div>

        {showUploader && (
          <div className="mb-8 p-6 bg-slate-800 rounded-xl border border-slate-700">
            <ContractorDocumentUploader />
          </div>
        )}

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Recent Uploads</h2>
            <div className="flex gap-2">
              {["all", "compliant", "expired"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === f
                      ? "bg-teal-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No documents found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Contractor</th>
                    <th className="p-4">Document Type</th>
                    <th className="p-4">Coverage</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-medium text-white">{doc.contractor_name || "Unknown"}</td>
                      <td className="p-4 text-slate-300">{doc.document_type || "-"}</td>
                      <td className="p-4 text-slate-300">
                        {doc.coverage_limit_gbp ? `£${doc.coverage_limit_gbp.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-4 text-slate-300">{doc.expiry_date || "-"}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc)}`}>
                          {getStatusText(doc)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
