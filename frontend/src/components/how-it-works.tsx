import React from "react";
import { FileEdit, Send, UserPlus } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create your profile",
    description:
      "Sign up in seconds, upload your resume and tell us about your skills and experience.",
  },
  {
    icon: FileEdit,
    step: "02",
    title: "Get matched instantly",
    description:
      "Our AI analyzes your profile and surfaces roles that genuinely fit your skills and goals.",
  },
  {
    icon: Send,
    step: "03",
    title: "Apply with one click",
    description:
      "Easy Apply sends your profile straight to recruiters — no repetitive forms, no waiting.",
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-secondary/40 py-16 md:py-20 border-y">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How HireHeaven works
          </h2>
          <p className="text-lg opacity-70">
            From sign-up to offer letter in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center md:text-left">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-linear-to-r from-blue-300 to-transparent dark:from-blue-800" />
              )}
              <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 text-white shadow-lg mb-5">
                <s.icon size={26} />
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-background">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed opacity-70 max-w-xs mx-auto md:mx-0">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
