"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle, ArrowLeft, Compass } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFillDemo = () => {
    setEmail("admin@gmail.com");
    setPassword("TravelAdmin@123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Could not connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen max-h-screen overflow-hidden flex items-center justify-center bg-[#061e1c] text-white p-4 select-none">
      {/* Dynamic Background Image with Luxury Tint */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 filter blur-[2px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#041715] via-[#041715]/90 to-[#062420]/80" />

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col justify-center">
        {/* Top Back Link */}
        <div className="flex items-center justify-between mb-4 px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-200/80 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Live Website
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Compass size={14} />
            <span>Travel Unbounded</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/15 bg-white/[0.08] backdrop-blur-2xl p-6 sm:p-7 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-teal-400 p-0.5 shadow-lg shadow-teal-900/40 mb-3 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#042421] flex items-center justify-center">
                <ShieldCheck size={24} className="text-teal-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Admin Console</h1>
            <p className="text-xs text-teal-100/70 mt-1">Sign in to manage leads and analytics</p>
          </div>

          {/* Evaluator Quick-Fill Banner */}
          <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-amber-200">Demo Login: </span>
                  <span className="font-mono text-gray-300 text-[11px]">admin@gmail.com</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 px-2.5 py-1 text-[11px] font-bold text-black hover:brightness-110 active:scale-95 transition-all shadow cursor-pointer"
              >
                Autofill
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/20 px-3 py-2 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-teal-100/70 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-300/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-teal-100/30 focus:border-teal-400 focus:bg-black/60 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-teal-100/70 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-300/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 py-2.5 text-sm text-white placeholder-teal-100/30 focus:border-teal-400 focus:bg-black/60 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-teal-300/60 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-brand via-teal-500 to-teal-400 py-3 text-sm font-extrabold text-white shadow-lg shadow-teal-900/50 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
