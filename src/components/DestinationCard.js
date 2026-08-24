"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DestinationCard({ destination }) {
  const { id, name, country, image, description, price } = destination;

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 border border-gray-100">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80"></div>
        
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1 drop-shadow-md">
            {country}
          </p>
          <h3 className="text-2xl font-bold tracking-tight drop-shadow-md">{name}</h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{description}</p>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Starting from</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{price.toLocaleString("en-IN")}
            </span>
          </div>
          <Link
            href={`/contact?destination=${id}`}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-brand text-white transition-all duration-300 hover:bg-brand-dark hover:scale-110 shadow-md shadow-brand/20 group/btn"
            aria-label={`Enquire about ${name}`}
          >
            <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
