"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Inbox,
  Clock,
  PhoneCall,
  CheckCircle2,
  Percent,
  MapPin,
} from "lucide-react";

const STATUS_COLORS = {
  New: "#f59e0b", // Amber
  Contacted: "#0284c7", // Sky Blue
  Converted: "#0f766e", // Brand Emerald/Teal
  Closed: "#64748b", // Slate Gray
};

export default function AnalyticsCharts({ enquiries = [] }) {
  // 1. Calculate KPI Metrics
  const stats = useMemo(() => {
    const total = enquiries.length;
    const countNew = enquiries.filter((e) => (e.status || "New") === "New").length;
    const countContacted = enquiries.filter((e) => e.status === "Contacted").length;
    const countConverted = enquiries.filter((e) => e.status === "Converted").length;
    const countClosed = enquiries.filter((e) => e.status === "Closed").length;
    const conversionRate = total > 0 ? ((countConverted / total) * 100).toFixed(1) : "0.0";
    const totalTravelers = enquiries.reduce(
      (acc, curr) => acc + (Number(curr.numPeople) || 1) + (Number(curr.numChildren) || 0),
      0
    );

    return {
      total,
      countNew,
      countContacted,
      countConverted,
      countClosed,
      conversionRate,
      totalTravelers,
    };
  }, [enquiries]);

  // 2. Timeline Data: Enquiries over time (grouped by day)
  const timelineData = useMemo(() => {
    const map = {};

    // Sort chronologically
    const sorted = [...enquiries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    sorted.forEach((e) => {
      const dateStr = new Date(e.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      map[dateStr] = (map[dateStr] || 0) + 1;
    });

    const data = Object.entries(map).map(([date, count]) => ({
      date,
      count,
    }));

    if (data.length === 0) {
      return [{ date: "Today", count: 0 }];
    }
    return data;
  }, [enquiries]);

  // 3. Status Breakdown Data
  const statusData = useMemo(() => {
    const counts = {
      New: 0,
      Contacted: 0,
      Converted: 0,
      Closed: 0,
    };

    enquiries.forEach((e) => {
      const s = e.status || "New";
      if (counts[s] !== undefined) {
        counts[s]++;
      } else {
        counts.New++;
      }
    });

    return [
      { name: "New", value: counts.New, color: STATUS_COLORS.New },
      { name: "Contacted", value: counts.Contacted, color: STATUS_COLORS.Contacted },
      { name: "Converted", value: counts.Converted, color: STATUS_COLORS.Converted },
      { name: "Closed", value: counts.Closed, color: STATUS_COLORS.Closed },
    ].filter((item) => item.value > 0 || enquiries.length === 0);
  }, [enquiries]);

  // 4. Destination Breakdown Data
  const destinationData = useMemo(() => {
    const map = {};
    enquiries.forEach((e) => {
      let dest = e.destination ? e.destination.replace(/-/g, " ") : "General Enquiry";
      dest = dest.charAt(0).toUpperCase() + dest.slice(1);
      map[dest] = (map[dest] || 0) + 1;
    });

    return Object.entries(map)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [enquiries]);

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Enquiries</span>
            <div className="rounded-xl bg-teal-50 p-2 text-brand">
              <Inbox size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">{stats.total}</p>
          <p className="mt-1 text-xs text-gray-500">{stats.totalTravelers} total travelers</p>
        </div>

        {/* New Leads */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">New Leads</span>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-900">{stats.countNew}</p>
          <p className="mt-1 text-xs text-amber-700">Awaiting response</p>
        </div>

        {/* Contacted */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">Contacted</span>
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
              <PhoneCall size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-sky-900">{stats.countContacted}</p>
          <p className="mt-1 text-xs text-sky-700">In discussions</p>
        </div>

        {/* Converted */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Converted</span>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-900">{stats.countConverted}</p>
          <p className="mt-1 text-xs text-emerald-700">Booked trips</p>
        </div>

        {/* Conversion Rate */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Conversion Rate</span>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <Percent size={18} />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-gray-900">{stats.conversionRate}%</p>
          <p className="mt-1 text-xs text-gray-500">Won / Total leads</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enquiries Over Time Area Chart */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-brand" />
                Inquiries Over Time
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Submissions trajectory</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Enquiries"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEnquiries)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Donut Chart */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <PieChart size={18} className="text-brand" />
                Status Breakdown
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Pipeline stage split</p>
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {enquiries.length === 0 ? (
              <p className="text-sm text-gray-400">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} leads`, name]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-gray-600 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Destinations Bar Chart */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-brand" />
                Top Destinations
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Most requested locations</p>
            </div>
          </div>

          <div className="h-60 w-full">
            {destinationData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No destination data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={destinationData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    dataKey="destination"
                    type="category"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(val) => [`${val} inquiries`, "Requests"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#0f766e" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
