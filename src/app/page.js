import Link from "next/link";
import Image from "next/image";
import DestinationCard from "@/components/DestinationCard";
import destinations from "@/data/destinations";
import FadeIn from "@/components/FadeIn";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Travel Unbounded — Home",
  description:
    "Explore handpicked India and international travel packages with Travel Unbounded.",
};

export default function HomePage() {
  const indiaDestinations = destinations.filter((d) => d.category === "india");
  const intlDestinations = destinations.filter(
    (d) => d.category === "international"
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80"
            alt="Mountain landscape"
            fill
            priority
            className="object-cover animate-[slow-zoom_20s_ease-out_forwards]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-brand-dark/90" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center text-white mt-16">
          <FadeIn delay={0.2} direction="up">
            <span className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-sm font-semibold tracking-wider text-accent mb-6 uppercase">
              <Compass size={16} /> Discover The Unseen
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl drop-shadow-xl">
              Travel <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-yellow-300">Unbounded</span>
            </h1>
            <p className="mt-8 text-lg text-gray-200 md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
              Journeys built around the people taking them — not sold from a catalogue.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.5} direction="up">
            <Link
              href="/contact"
              className="mt-10 inline-block rounded-full bg-gradient-to-r from-brand to-teal-500 px-10 py-4 font-bold text-white shadow-xl shadow-brand/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/40 text-lg"
            >
              Start Planning
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* India Destinations */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <FadeIn direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              India <span className="text-brand">Destinations</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked escapes across incredible India, crafted for the ultimate experiential traveler.
            </p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {indiaDestinations.map((d, i) => (
            <FadeIn key={d.id} delay={0.1 * i} direction="up">
              <DestinationCard destination={d} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* International Destinations */}
      <section className="bg-gradient-to-b from-gray-50 to-gray-100 py-24 border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
                Global <span className="text-brand">Journeys</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Go where real stories are written — we&apos;ll bring you along.
              </p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {intlDestinations.map((d, i) => (
              <FadeIn key={d.id} delay={0.1 * i} direction="up">
                <DestinationCard destination={d} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
