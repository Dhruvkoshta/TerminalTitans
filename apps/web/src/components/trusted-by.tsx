import React from "react";

export default function TrustedBy() {
  const logos = [
    // simple multi-color SVG placeholders
    (
      <svg
        viewBox="0 0 120 40"
        xmlns="http://www.w3.org/2000/svg"
        className="w-32 h-10 filter grayscale hover:grayscale-0 transition duration-300"
        aria-hidden
      >
        <rect width="120" height="40" rx="6" fill="#111827" />
        <circle cx="22" cy="20" r="12" fill="#7c3aed" />
        <text x="50" y="25" fill="#ffffff" fontSize="12" fontWeight="700">Uni A</text>
      </svg>
    ),
    (
      <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" className="w-32 h-10 filter grayscale hover:grayscale-0 transition duration-300" aria-hidden>
        <rect width="120" height="40" rx="6" fill="#0f172a" />
        <rect x="12" y="8" width="20" height="24" rx="3" fill="#06b6d4" />
        <text x="44" y="25" fill="#ffffff" fontSize="12" fontWeight="700">College B</text>
      </svg>
    ),
    (
      <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" className="w-32 h-10 filter grayscale hover:grayscale-0 transition duration-300" aria-hidden>
        <rect width="120" height="40" rx="6" fill="#0b1220" />
        <polygon points="18,30 36,10 54,30" fill="#f97316" />
        <text x="62" y="25" fill="#ffffff" fontSize="12" fontWeight="700">Institute C</text>
      </svg>
    ),
    (
      <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" className="w-32 h-10 filter grayscale hover:grayscale-0 transition duration-300" aria-hidden>
        <rect width="120" height="40" rx="6" fill="#0b1220" />
        <circle cx="24" cy="20" r="10" fill="#ef4444" />
        <text x="48" y="25" fill="#ffffff" fontSize="12" fontWeight="700">Org D</text>
      </svg>
    ),
    (
      <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" className="w-32 h-10 filter grayscale hover:grayscale-0 transition duration-300" aria-hidden>
        <rect width="120" height="40" rx="6" fill="#0b1220" />
        <rect x="12" y="8" width="16" height="24" rx="2" fill="#10b981" />
        <rect x="32" y="8" width="16" height="24" rx="2" fill="#60a5fa" />
        <text x="56" y="25" fill="#ffffff" fontSize="12" fontWeight="700">Corp E</text>
      </svg>
    ),
    (
      <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" className="w-32 h-10 filter grayscale hover:grayscale-0 transition duration-300" aria-hidden>
        <rect width="120" height="40" rx="6" fill="#0b1220" />
        <path d="M18 30 L30 12 L42 30 Z" fill="#a78bfa" />
        <circle cx="80" cy="20" r="8" fill="#f59e0b" />
        <text x="56" y="25" fill="#ffffff" fontSize="12" fontWeight="700">Labs F</text>
      </svg>
    ),
  ];

  return (
    <section className="mx-auto w-full max-w-4xl py-12 text-center">
      <h3 className="text-sm font-semibold text-purple-200/90">Trusted by leading institutions</h3>
      <p className="mt-2 text-xs text-purple-100/70">Institutions worldwide rely on PROCTO for secure exams.</p>

      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-center justify-items-center">
        {logos.map((logo, idx) => (
          <div key={idx} className="flex items-center justify-center p-2">
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
}
