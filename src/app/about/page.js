import FadeIn from "@/components/FadeIn";
import { CheckCircle2, MapPin } from "lucide-react";

export const metadata = {
  title: "About Us — Travel Unbounded",
  description:
    "Learn about Travel Unbounded's story, offices, and why travelers trust us for experiential journeys.",
};

const offices = [
  {
    city: "Bengaluru — Headquarters",
    lines: ["541, 7th Main Rd, HAL 2nd Stage", "Indiranagar, Bengaluru – 560008", "India"],
  },
  {
    city: "Kochi — Kerala Office",
    lines: ["LR Towers, S Janatha Road", "Palarivattom, Kochi – 682025", "India"],
  },
  {
    city: "Nairobi — Kenya Office",
    lines: ["Westpark Towers, Muthithi Road", "Nairobi, P.O. Box 6950", "Postal Code 00100", "Kenya"],
  },
];

const whyChooseUs = [
  {
    title: "Personally-Vetted Experiences",
    desc: "Every destination, resort, and activity we recommend has been personally experienced by our team — no guesswork, no stock itineraries.",
  },
  {
    title: "Local Guides",
    desc: "We work with guides who were born and raised where you're traveling, so you get real stories, not tourist scripts.",
  },
  {
    title: "Custom Itineraries",
    desc: "No two travelers are alike, so no two itineraries should be either. Every trip is built around you.",
  },
  {
    title: "24x7 Support",
    desc: "From the moment you book to the moment you're home, our team is one call away, any time zone, any hour.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24 lg:py-32">
      <FadeIn direction="up">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl text-center">
          India&apos;s Most Trusted <br/>
          <span className="text-brand">Experiential Travel Experts</span>
        </h1>
      </FadeIn>

      <FadeIn delay={0.2} direction="up">
        <div className="mt-12 max-w-3xl mx-auto space-y-6 text-xl text-gray-600 leading-relaxed text-center font-light">
          <p>
            Travel Unbounded was born from a simple belief — that the best
            journeys aren&apos;t sold from a catalogue. They&apos;re built
            around the people taking them.
          </p>
          <p>
            Headquartered in Bangalore with offices in Kerala and Nairobi, we
            design trips that blend comfort, culture, and raw nature. Every
            destination, resort, and activity we recommend has been personally
            experienced by our team.
          </p>
          <p>
            From spotting the Big Five at dawn in the Masai Mara to cruising Ha
            Long Bay at sunset — we go where real stories are written, and we
            bring you along.
          </p>
        </div>
      </FadeIn>

      {/* Why choose us */}
      <div className="mt-32">
        <FadeIn direction="up">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-12">Why Choose Us</h2>
        </FadeIn>
        <div className="grid gap-8 sm:grid-cols-2">
          {whyChooseUs.map((item, i) => (
            <FadeIn key={item.title} delay={0.1 * i} direction="up">
              <div className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 h-full">
                <CheckCircle2 className="text-brand mb-4" size={32} />
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand transition-colors">{item.title}</h3>
                <p className="mt-3 text-base text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Offices */}
      <div className="mt-32 mb-10">
        <FadeIn direction="up">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 text-center mb-12">Our Global Presence</h2>
        </FadeIn>
        <div className="grid gap-8 sm:grid-cols-3">
          {offices.map((office, i) => (
            <FadeIn key={office.city} delay={0.1 * i} direction="up">
              <div className="rounded-3xl bg-gray-50 border border-gray-100 p-8 h-full">
                <MapPin className="text-accent mb-4" size={28} />
                <h3 className="text-lg font-bold text-gray-900">{office.city}</h3>
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  {office.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
