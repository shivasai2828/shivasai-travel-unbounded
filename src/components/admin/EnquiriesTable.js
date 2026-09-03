"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Users,
  Building,
  MapPin,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

const STATUS_BADGES = {
  New: {
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  Contacted: {
    bg: "bg-sky-50 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
  },
  Converted: {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Closed: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
};

export default function EnquiriesTable({ initialEnquiries = [], onDataChange }) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);

  // Sync when initialEnquiries changes
  const handleUpdateLocal = (updatedList) => {
    setEnquiries(updatedList);
    if (onDataChange) {
      onDataChange(updatedList);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    setMessage(null);

    // Optimistic update
    const previous = [...enquiries];
    const updated = enquiries.map((e) => (e._id === id ? { ...e, status: newStatus } : e));
    handleUpdateLocal(updated);

    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setMessage({ type: "success", text: `Status updated to "${newStatus}"` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      // Revert optimistic update
      handleUpdateLocal(previous);
      setMessage({ type: "error", text: err.message || "Could not update status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the enquiry from "${name}"?`)) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete enquiry");

      const updated = enquiries.filter((e) => e._id !== id);
      handleUpdateLocal(updated);
      setMessage({ type: "success", text: `Enquiry deleted.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Could not delete enquiry." });
    } finally {
      setUpdatingId(null);
    }
  };

  // Status counts for tabs
  const countAll = enquiries.length;
  const countNew = enquiries.filter((e) => (e.status || "New") === "New").length;
  const countContacted = enquiries.filter((e) => e.status === "Contacted").length;
  const countConverted = enquiries.filter((e) => e.status === "Converted").length;
  const countClosed = enquiries.filter((e) => e.status === "Closed").length;

  // Filtered and searched data
  const filteredEnquiries = enquiries.filter((e) => {
    const currentStatus = e.status || "New";
    if (statusFilter !== "All" && currentStatus !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.fullName?.toLowerCase().includes(q);
      const matchEmail = e.email?.toLowerCase().includes(q);
      const matchPhone = e.fullPhone?.includes(q) || e.contactNumber?.includes(q);
      const matchDest = e.destination?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchDest;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle size={18} className="text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header controls: Search & Status Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-gray-100 border border-gray-200/80">
          {[
            { id: "All", label: "All", count: countAll },
            { id: "New", label: "New", count: countNew },
            { id: "Contacted", label: "Contacted", count: countContacted },
            { id: "Converted", label: "Converted", count: countConverted },
            { id: "Closed", label: "Closed", count: countClosed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  statusFilter === tab.id
                    ? "bg-brand/10 text-brand font-semibold"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[280px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Lead Contact</th>
                <th className="px-6 py-4">Trip Details</th>
                <th className="px-6 py-4">Status & Action</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <p className="text-base font-semibold text-gray-700">No enquiries found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery || statusFilter !== "All"
                        ? "Try adjusting your search query or filter"
                        : "New submissions from the contact form will appear here"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((e) => {
                  const currentStatus = e.status || "New";
                  const badge = STATUS_BADGES[currentStatus] || STATUS_BADGES.New;
                  const isBusy = updatingId === e._id;

                  return (
                    <tr
                      key={e._id}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        isBusy ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {/* Contact Info */}
                      <td className="px-6 py-4 align-top">
                        <div className="font-bold text-gray-900">{e.fullName}</div>
                        <div className="mt-1 flex flex-col gap-1 text-xs text-gray-600">
                          <a
                            href={`mailto:${e.email}`}
                            className="inline-flex items-center gap-1.5 hover:text-brand transition-colors"
                          >
                            <Mail size={13} className="text-gray-400" />
                            <span>{e.email}</span>
                          </a>
                          <a
                            href={`tel:${e.fullPhone}`}
                            className="inline-flex items-center gap-1.5 hover:text-brand transition-colors font-mono"
                          >
                            <Phone size={13} className="text-gray-400" />
                            <span>{e.fullPhone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Trip Details */}
                      <td className="px-6 py-4 align-top">
                        {e.destination ? (
                          <div className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-0.5 text-xs font-semibold text-brand mb-1.5 border border-teal-100">
                            <MapPin size={12} />
                            <span className="capitalize">{e.destination.replace(/-/g, " ")}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 mb-1.5">
                            General Inquiry
                          </div>
                        )}

                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-400" />
                            <span>Travel: <strong>{e.travelDate || "Flexible"}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users size={13} className="text-gray-400" />
                            <span>
                              {e.numPeople} Adult{e.numPeople > 1 ? "s" : ""}
                              {e.numChildren > 0 && `, ${e.numChildren} Child${e.numChildren > 1 ? "ren" : ""}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Building size={13} className="text-gray-400" />
                            <span>Hotel: <span className="font-medium text-gray-700">{e.hotelCategory}</span></span>
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <select
                              value={currentStatus}
                              disabled={isBusy}
                              onChange={(ev) => handleStatusChange(e._id, ev.target.value)}
                              className={`appearance-none rounded-xl border px-3.5 py-1.5 pr-8 text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30 ${badge.bg}`}
                            >
                              <option value="New">● New</option>
                              <option value="Contacted">● Contacted</option>
                              <option value="Converted">● Converted</option>
                              <option value="Closed">● Closed</option>
                            </select>
                            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current text-xs opacity-70">
                              ▼
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-6 py-4 align-top text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-gray-700 font-medium">
                          <Clock size={13} className="text-gray-400" />
                          <span>{new Date(e.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(e.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 align-top text-right">
                        <button
                          onClick={() => handleDelete(e._id, e.fullName)}
                          title="Delete Enquiry"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
