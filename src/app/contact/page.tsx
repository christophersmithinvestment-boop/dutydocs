"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { DutyDocsLogo } from "@/components/DutyDocsLogo";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate an API call
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--color-bg-primary)", color: "var(--color-text-primary)" }}>
      <nav style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DutyDocsLogo size={32} />
            <span className="text-lg font-bold">DutyDocs</span>
          </div>
          <Link href="/landing" className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 py-16">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Info */}
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">Get in Touch</h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Have questions about DutyDocs, pricing, or need a custom enterprise solution? We're here to help. Reach out to our team.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Email Us</h3>
                  <p className="text-slate-400 mt-1">Our friendly team is here to help.</p>
                  <a href="mailto:hello@dutydocsapp.com" className="text-teal-400 font-medium hover:underline mt-2 inline-block">hello@dutydocsapp.com</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Office</h3>
                  <p className="text-slate-400 mt-1">Come say hello at our UK headquarters.</p>
                  <p className="text-slate-300 font-medium mt-2">123 Safety Way<br/>London, UK<br/>EC1A 1BB</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Phone</h3>
                  <p className="text-slate-400 mt-1">Mon-Fri from 9am to 5pm.</p>
                  <p className="text-slate-300 font-medium mt-2">+44 (0) 20 7946 0958</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
            {status === "success" ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-400 mb-8">Thanks for reaching out. One of our safety experts will get back to you within 24 hours.</p>
                <button 
                  onClick={() => setStatus("idle")} 
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
                
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-slate-300">First name</label>
                    <input 
                      id="firstName" 
                      required 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all" 
                      placeholder="Jane"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-slate-300">Last name</label>
                    <input 
                      id="lastName" 
                      required 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all" 
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
                  <input 
                    id="email" 
                    type="email" 
                    required 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all" 
                    placeholder="jane@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-slate-300">Company (Optional)</label>
                  <input 
                    id="company" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all" 
                    placeholder="Acme Construction Ltd"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-slate-300">Message</label>
                  <textarea 
                    id="message" 
                    required 
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all resize-none" 
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === "submitting"}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                  {status === "submitting" ? (
                    <span className="flex items-center gap-2">Sending...</span>
                  ) : (
                    <span className="flex items-center gap-2">Send Message <Send size={18} /></span>
                  )}
                </button>
                <p className="text-xs text-slate-500 text-center mt-4">
                  By submitting this form, you agree to our Privacy Policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
