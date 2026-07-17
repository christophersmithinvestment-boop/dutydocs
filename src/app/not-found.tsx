"use client";

import Link from "next/link";
import { FileQuestion, ArrowRight, Home } from "lucide-react";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "transparent", color: "var(--color-text-primary)" }}>
      <nav style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DutyDocsLogo size={32} />
            <span className="text-lg font-bold">DutyDocs</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-400 mb-8">
          <FileQuestion size={48} />
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page not found</h2>
        
        <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
        </p>
        
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link 
            href="/landing" 
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
          >
            <Home size={18} /> Go Home
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            Go to Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    </div>
  );
}
