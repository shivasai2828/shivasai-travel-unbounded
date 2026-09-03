"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

export default function ItineraryView({ itinerary }) {
  const [copied, setCopied] = useState(false);

  if (!itinerary || !itinerary.days) return null;

  const { destination, destinationId, duration, budget, summary, days, tips } = itinerary;

  const handleCopy = () => {
    let text = `✈️ ${destination} Trip Itinerary (${duration || "Custom"})\n`;
    text += `Style: ${budget || "Standard"} | Travel Unbounded\n\n`;
    if (summary) text += `${summary}\n\n`;

    days.forEach((d) => {
      text += `📅 Day ${d.day}: ${d.title}\n`;
      if (d.activities) {
        d.activities.forEach((act) => {
          text += `  • ${act}\n`;
        });
      }
      if (d.highlight) {
        text += `  ⭐ Highlight: ${d.highlight}\n`;
      }
      text += `\n`;
    });

    if (tips && tips.length > 0) {
      text += `💡 Tips:\n`;
      tips.forEach((t) => {
        text += `  • ${t}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const bookingHref = `/contact?destination=${destinationId || destination?.toLowerCase().replace(/\s+/g, "-") || "custom"}`;

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-teal-100 bg-teal-50/40 p-4 text-left shadow-sm">
      {/* Itinerary Header */}
      <div className="rounded-xl border border-teal-200/80 bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 font-extrabold text-base text-gray-900">
            <MapPin size={16} className="text-brand" />
            <span>{destination} Itinerary</span>
          </div>

          <div className="flex items-center gap-1.5">
            {duration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100/70 px-2.5 py-0.5 text-[11px] font-bold text-teal-900">
                <Calendar size={11} />
                {duration}
              </span>
            )}
            {budget && (
              <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                {budget}
              </span>
            )}
          </div>
        </div>

        {summary && (
          <p className="text-xs text-gray-600 leading-relaxed mt-1 font-light">
            {summary}
          </p>
        )}
      </div>

      {/* Day by Day Cards */}
      <div className="space-y-2.5">
        {days.map((dayItem) => (
          <div
            key={dayItem.day}
            className="rounded-xl border border-gray-100 bg-white p-3 shadow-xs hover:border-teal-200 transition-colors"
          >
            {/* Day Title */}
            <div className="flex items-start gap-2 mb-2">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-brand text-white text-[11px] font-extrabold shadow-xs">
                D{dayItem.day}
              </span>
              <h4 className="text-xs font-bold text-gray-900 pt-0.5 leading-snug">
                {dayItem.title}
              </h4>
            </div>

            {/* Activities */}
            {dayItem.activities && dayItem.activities.length > 0 && (
              <ul className="space-y-1.5 pl-8 pr-1 text-[11px] text-gray-600">
                {dayItem.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-tight">
                    <CheckCircle2 size={12} className="text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Highlight */}
            {dayItem.highlight && (
              <div className="mt-2.5 ml-8 rounded-lg bg-amber-50 border border-amber-200/70 p-2 text-[11px] text-amber-900 flex items-start gap-1.5">
                <Sparkles size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-amber-950">Highlight: </strong>
                  <span>{dayItem.highlight}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Travel Tips */}
      {tips && tips.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-3 text-[11px] text-gray-700">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-1.5">
            <Lightbulb size={13} className="text-amber-500" />
            <span>Curator Tips</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-gray-600">
            {tips.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={bookingHref}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-teal-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-teal-800/20 hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
        >
          <span>Book This Trip</span>
          <ArrowRight size={13} />
        </Link>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
          title="Copy Itinerary to Clipboard"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-gray-500" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
