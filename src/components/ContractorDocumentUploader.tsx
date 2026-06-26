"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function ContractorDocumentUploader() {
  
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "processing" | "complete" | "failed">("idle");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  // Realtime listener for document status updates
  useEffect(() => {
    if (!documentId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`doc_listener_${documentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "contractor_documents",
          filter: `id=eq.${documentId}`,
        },
        (payload) => {
          const newRow = payload.new;
          
          if (newRow.status === "complete") {
            setParsedData(newRow);
            setUploadState("complete");
            supabase.removeChannel(channel);
          } else if (newRow.status === "failed") {
            setError(newRow.error_message || "The AI failed to parse this document.");
            setUploadState("failed");
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, supabase]);

  // Upload handler
  const handleUpload = async () => {
    if (!file) return;

    setUploadState("uploading");
    setError(null);
    setParsedData(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in to upload documents.");

      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = process.env.NEXT_PUBLIC_OCR_API_URL;
      if (!apiUrl) throw new Error("OCR API URL is not configured.");

      const response = await fetch(`${apiUrl}/api/v1/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Upload failed.");
      }

      const result = await response.json();
      setDocumentId(result.document_id);
      setUploadState("processing");

    } catch (err: any) {
      setError(err.message);
      setUploadState("failed");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Upload Contractor Document</h2>
      
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={uploadState === "processing" || uploadState === "uploading"}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploadState === "processing" || uploadState === "uploading"}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {uploadState === "uploading" ? "Uploading..." : "Upload & Parse"}
      </button>

      {uploadState === "processing" && (
        <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">AI is reading your document...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadState === "complete" && parsedData && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-2">
          <h3 className="font-bold text-green-800">Extraction Complete!</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Contractor:</strong> {parsedData.contractor_name}</p>
            <p><strong>Document Type:</strong> {parsedData.document_type}</p>
            {parsedData.coverage_limit_gbp && (
              <p><strong>Coverage:</strong> £{parsedData.coverage_limit_gbp.toLocaleString()}</p>
            )}
            {parsedData.expiry_date && (
              <p><strong>Expires:</strong> {parsedData.expiry_date}</p>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {parsedData.is_expired && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Expired</span>}
            {parsedData.is_low_coverage && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Low Coverage</span>}
          </div>
        </div>
      )}
    </div>
  );
}
