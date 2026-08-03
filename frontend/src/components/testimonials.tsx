import React from "react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Frontend Engineer, Verdant Cloud",
    quote:
      "The AI resume analyzer pointed out exactly what recruiters were skipping over. Two weeks after fixing it, I had three interviews lined up.",
  },
  {
    name: "Rohan Mehta",
    role: "Talent Lead, Orbit Finance",
    quote:
      "We fill roles nearly twice as fast now. Easy Apply means we get complete, verified profiles instead of half-filled forms.",
  },
  {
    name: "Priya Nair",
    role: "Product Designer, Pixel Forge",
    quote:
      "The career guidance tool mapped out a learning path I actually followed. HireHeaven felt like a mentor, not just a job board.",
  },
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Testimonials = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Loved by job seekers and recruiters
        </h2>
        <p className="text-lg opacity-70">
          Real outcomes from people who found their fit on HireHeaven.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="p-6 rounded-2xl border-2 bg-background flex flex-col gap-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="text-sm leading-relaxed opacity-80">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-auto pt-2">
              <Avatar className="size-10">
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 font-semibold">
                  {initialsOf(t.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-none">
                  {t.name}
                </p>
                <p className="text-xs opacity-60 mt-1">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
