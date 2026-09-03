"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import EnquiriesTable from "@/components/admin/EnquiriesTable";
import {
  ShieldCheck,
  LogOut,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Inbox,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState({ email: "admin@gmail.com" });

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      // 1. Fetch user session
      const userRes = await fetch("/api/admin/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.user) setUser(userData.user);
      }

      // 2. Fetch enquiries
      const res = await fetch("/api/admin/enquiries");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error("Failed to load enquiries");
      }
      const data = await res.json();
      setEnquiries(data.data || []);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-teal-500 flex items-center justify-center shadow-md shadow-brand/20">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-gray-900">
                Travel Unbounded
              </span>
              <span className="ml-2 inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-brand border border-teal-100">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live website link */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-brand transition-colors"
            >
              <span>View Site</span>
              <ExternalLink size={13} />
            </Link>

            {/* Refresh button */}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              title="Refresh Data"
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin text-brand" : ""} />
            </button>

            {/* Admin User Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-full bg-gray-100 px-3.5 py-1.5 text-xs text-gray-700 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{user.email}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Inquiries & Performance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Real-time pipeline monitoring, customer leads, and inquiry conversions.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200/80 px-4 py-2 text-xs text-amber-900">
            <Sparkles size={15} className="text-amber-600 flex-shrink-0" />
            <span>
              Logged in as <strong>{user.email}</strong> (JWT Session Active)
            </span>
          </div>
        </div>

        {/* Analytics Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Analytics Overview</h2>
          </div>
          <AnalyticsCharts enquiries={enquiries} />
        </section>

        {/* Lead Management Section */}
        <section className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Inbox size={20} className="text-brand" />
                Customer Inquiries ({enquiries.length})
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Filter by stage, search across leads, and update status in real time.
              </p>
            </div>
          </div>

          <EnquiriesTable
            initialEnquiries={enquiries}
            onDataChange={(updated) => setEnquiries(updated)}
          />
        </section>
      </main>
    </div>
  );
}
