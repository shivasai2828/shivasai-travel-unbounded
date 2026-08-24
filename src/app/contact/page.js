import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import FadeIn from "@/components/FadeIn";

export const metadata = {
  title: "Contact Us — Travel Unbounded",
  description:
    "Get in touch with Travel Unbounded to plan your next trip. Fill out our enquiry form and we'll respond within 24 hours.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32 grid lg:grid-cols-5 gap-16 lg:gap-8 items-start">
      <div className="lg:col-span-2 lg:sticky lg:top-32">
        <FadeIn direction="right">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Design Your <br/><span className="text-brand">Dream Journey</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-md">
            Tell us a bit about your travel aspirations. Our expert designers will get back to you within 24 hours to start crafting an itinerary completely tailored to you.
          </p>
          
          <div className="mt-12 space-y-6 hidden lg:block">
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">Prefer to email?</h3>
              <p className="text-brand font-medium">hello@travelunbounded.com</p>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="lg:col-span-3">
        <FadeIn direction="left" delay={0.2}>
          <div className="rounded-3xl border border-gray-100 bg-white p-8 md:p-12 shadow-xl shadow-brand/5">
            <Suspense fallback={<div className="h-96 flex items-center justify-center"><p className="text-brand font-medium animate-pulse">Loading experience...</p></div>}>
              <BookingForm />
            </Suspense>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
