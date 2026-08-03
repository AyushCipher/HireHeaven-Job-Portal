import React from "react";
import CompanyLogo from "./company-logo";

const companies = [
  "Nexora Labs",
  "Quantum Byte",
  "Verdant Cloud",
  "Orbit Finance",
  "Pixel Forge",
  "Skyline Health",
];

const TrustLogos = () => {
  return (
    <section className="py-10 border-y bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm font-medium opacity-60 mb-6">
          Trusted by hiring teams at fast-growing companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {companies.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2.5 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all"
            >
              <CompanyLogo name={name} className="size-8 rounded-md" />
              <span className="text-sm font-semibold whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustLogos;
