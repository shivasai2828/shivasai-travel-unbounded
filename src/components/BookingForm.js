"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";

const countryCodes = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+254", label: "Kenya (+254)" },
  { code: "+61", label: "Australia (+61)" },
];

const initialForm = {
  fullName: "",
  countryCode: "+91",
  contactNumber: "",
  email: "",
  travelDate: "",
  numPeople: 1,
  hotelCategory: "Standard",
  numChildren: 0,
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingForm() {
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination");

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMessage, setServerMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";

    if (!form.contactNumber.trim()) {
      errs.contactNumber = "Contact number is required.";
    } else if (!/^\d{6,14}$/.test(form.contactNumber.trim())) {
      errs.contactNumber = "Enter a valid phone number (digits only).";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Enter a valid email address.";
    }

    if (!form.travelDate) {
      errs.travelDate = "Travel date is required.";
    } else if (form.travelDate < todayStr()) {
      errs.travelDate = "Travel date must be in the future.";
    }

    if (!form.numPeople || Number(form.numPeople) < 1) {
      errs.numPeople = "At least 1 traveler is required.";
    }

    if (form.numChildren !== "" && Number(form.numChildren) < 0) {
      errs.numChildren = "Number of children cannot be negative.";
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fullPhone: `${form.countryCode}${form.contactNumber}`,
          destination: destination || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setServerMessage(data.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setServerMessage(
        "Thank you! Our travel expert will contact you within 24 hours."
      );
      setForm(initialForm);
    } catch {
      setStatus("error");
      setServerMessage("Network error. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-teal-100 bg-teal-50/50 p-10 text-center shadow-sm">
        <CheckCircle className="mx-auto text-teal-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-teal-900 mb-2">Request Received!</h3>
        <p className="text-teal-800 leading-relaxed mb-6">{serverMessage}</p>
        <button
          onClick={() => setStatus("idle")}
          className="rounded-full bg-brand px-8 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-all"
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  const inputClass = "mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 transition-all focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {destination && (
        <div className="rounded-2xl bg-brand/10 border border-brand/20 px-5 py-4 text-sm text-brand-dark flex items-center gap-3">
          <CheckCircle size={20} className="text-brand" />
          <p>
            Enquiring about: <strong className="capitalize text-brand">{destination.replace("-", " ")}</strong>
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          {serverMessage}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          className={inputClass}
          placeholder="John Doe"
        />
        {errors.fullName && <p className="mt-2 text-xs font-medium text-red-600">{errors.fullName}</p>}
      </div>

      {/* Contact Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Contact Number</label>
        <div className="mt-1.5 flex gap-3">
          <select
            name="countryCode"
            value={form.countryCode}
            onChange={handleChange}
            className="w-1/3 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-3 text-sm text-gray-900 transition-all focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="tel"
            name="contactNumber"
            placeholder="9876543210"
            value={form.contactNumber}
            onChange={handleChange}
            className={`w-2/3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 transition-all focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20`}
          />
        </div>
        {errors.contactNumber && (
          <p className="mt-2 text-xs font-medium text-red-600">{errors.contactNumber}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={inputClass}
          placeholder="john@example.com"
        />
        {errors.email && <p className="mt-2 text-xs font-medium text-red-600">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Travel Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Date of Travel</label>
          <input
            type="date"
            name="travelDate"
            min={todayStr()}
            value={form.travelDate}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.travelDate && <p className="mt-2 text-xs font-medium text-red-600">{errors.travelDate}</p>}
        </div>

        {/* Hotel Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Hotel Category</label>
          <select
            name="hotelCategory"
            value={form.hotelCategory}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="Standard">Standard (Comfortable & Clean)</option>
            <option value="Deluxe">Deluxe (Premium Experience)</option>
            <option value="Luxury">Luxury (Ultimate Indulgence)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Number of People */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Number of Adults</label>
          <input
            type="number"
            name="numPeople"
            min={1}
            value={form.numPeople}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.numPeople && <p className="mt-2 text-xs font-medium text-red-600">{errors.numPeople}</p>}
        </div>

        {/* Number of Children */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Number of Children <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            name="numChildren"
            min={0}
            value={form.numChildren}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.numChildren && (
            <p className="mt-2 text-xs font-medium text-red-600">{errors.numChildren}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-gradient-to-r from-brand to-teal-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
      >
        {status === "submitting" ? "Sending Request..." : "Design My Journey"}
      </button>
    </form>
  );
}
