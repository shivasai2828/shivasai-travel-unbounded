export default function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-300 pt-16 pb-8 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">Travel Unbounded</h3>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-md">
            India&apos;s Most Trusted Experiential Travel Experts. We design
            trips that blend comfort, culture, and raw nature. Your journey is uniquely yours.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">
            Our Offices
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand"></span>Bengaluru — HQ</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand"></span>Kochi — Kerala Office</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand"></span>Nairobi — Kenya Office</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-accent mb-4">
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/about" className="transition hover:text-white hover:translate-x-1 inline-block">About Us</a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-white hover:translate-x-1 inline-block">Enquire Now</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-xs text-gray-500">
          © {new Date().getFullYear()} Travel Unbounded. All rights reserved.
        </div>
        <div className="text-xs text-gray-500">
          Designed with <span className="text-accent">♥</span> for real travelers. Built by <a href="mailto:boddushivasai@gmail.com" className="hover:text-white transition">boddushivasai@gmail.com</a>.
        </div>
      </div>
    </footer>
  );
}
