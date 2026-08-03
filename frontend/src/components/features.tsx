import React from "react";
import {
  BadgeCheck,
  BrainCircuit,
  Compass,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Career Guidance",
    description:
      "Get a personalized career roadmap and skill recommendations generated from your existing skill set.",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: Sparkles,
    title: "AI Resume Analyzer",
    description:
      "Instantly score your resume against ATS standards and get concrete, actionable improvement tips.",
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: BadgeCheck,
    title: "Verified Employers",
    description:
      "Every company on HireHeaven is verified, so you can apply with confidence and skip the guesswork.",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: Zap,
    title: "Easy Apply",
    description:
      "Apply to roles in a single click with your saved profile, resume and skills — no repetitive forms.",
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    icon: Compass,
    title: "Smart Job Matching",
    description:
      "Filter by location, role and salary to zero in on opportunities that actually fit what you want.",
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "Your data and documents are encrypted and never shared with employers without your consent.",
    color: "text-cyan-600",
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
  },
];

const Features = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
      <div className="text-center mb-12 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 dark:bg-blue-950 mb-4">
          <Sparkles size={16} className="text-blue-600" />
          <span className="text-sm font-medium">Why HireHeaven</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Everything you need to land the right role
        </h2>
        <p className="text-lg opacity-70">
          Built for job seekers and recruiters who want a faster, smarter and
          more transparent hiring experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-2xl border-2 bg-background hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}
            >
              <f.icon size={22} className={f.color} />
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed opacity-70">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
