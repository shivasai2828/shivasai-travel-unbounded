"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-4" : "py-6"}`}>
      <nav className={`mx-auto flex max-w-5xl items-center justify-between px-6 py-3 transition-all duration-500 rounded-full ${scrolled ? "glass-panel shadow-lg shadow-black/5" : "bg-transparent"}`}>
        <Link href="/" className="text-2xl font-bold tracking-tight text-brand">
          Travel Unbounded
        </Link>

        {/* Desktop links */}
        <ul className="hidden gap-10 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group relative text-sm font-semibold text-gray-800 transition hover:text-brand"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-0.5 w-0 bg-brand transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/contact"
          className="hidden rounded-full bg-gradient-to-r from-brand to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/30 md:inline-block"
        >
          Plan Your Trip
        </Link>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-800 focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-4 right-4 top-20 rounded-2xl glass-panel p-6 shadow-xl md:hidden"
          >
            <ul className="flex flex-col gap-6 text-center">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-gray-800"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="inline-block w-full rounded-full bg-brand px-6 py-3 text-center text-sm font-bold text-white"
                >
                  Plan Your Trip
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
