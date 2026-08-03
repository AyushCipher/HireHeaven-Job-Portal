import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const stats = [
  { label: "Active Job Listings", value: "10,000+" },
  { label: "Verified Companies", value: "5,000+" },
  { label: "Job Seekers", value: "50,000+" },
  { label: "Successful Hires", value: "12,000+" },
];

const values = [
  {
    icon: Target,
    title: "Purpose-Driven Matching",
    description:
      "We don't just list jobs — our AI matches people to roles that fit their skills, goals and growth trajectory.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    description:
      "Every employer on HireHeaven is verified. No fake listings, no hidden fees, no surprises.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Innovation",
    description:
      "From resume analysis to career guidance, we keep building AI tools that make job hunting less painful.",
  },
  {
    icon: HeartHandshake,
    title: "People First",
    description:
      "Behind every application is a person with a story. We design every feature around that reality.",
  },
];

const journey = [
  {
    icon: Rocket,
    title: "The Idea",
    description:
      "HireHeaven started with a simple frustration: job boards were full of noise and short on real matches.",
  },
  {
    icon: Users,
    title: "Building the Community",
    description:
      "We onboarded our first verified employers and job seekers, focused on quality over quantity from day one.",
  },
  {
    icon: Sparkles,
    title: "Bringing in AI",
    description:
      "We shipped AI-powered resume analysis and career guidance to turn applications into real opportunities.",
  },
  {
    icon: Compass,
    title: "Where We're Headed",
    description:
      "Smarter matching, deeper insights, and a hiring experience that respects everyone's time.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero / Mission Section */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="absolute inset-0 opacity-10 dark:opacity-15 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-14 md:py-20 relative">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/60 backdrop-blur-sm">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-sm font-medium">About HireHeaven</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Our Mission At Hire
                <span className="text-red-500">Heaven</span>
              </h1>
              <p className="text-lg leading-relaxed opacity-80">
                We&apos;re dedicated to revolutionizing the job search
                experience. Our mission is to create meaningful connections
                between talented individuals and forward-thinking companies,
                fostering growth and success for both.
              </p>
            </div>

            <div className="flex justify-center">
              <img
                src="/about.jpg"
                className="w-full max-w-md rounded-2xl shadow-2xl border-4 border-background"
                alt="Team collaborating on hiring decisions at HireHeaven"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">
                  {s.value}
                </p>
                <p className="text-sm opacity-70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What we stand for
          </h2>
          <p className="text-lg opacity-70">
            The principles that shape every feature we build and every
            decision we make.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {values.map((v) => (
            <div
              key={v.title}
              className="p-6 rounded-2xl border-2 bg-background hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <v.icon size={22} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
              <p className="text-sm leading-relaxed opacity-70">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey / Timeline */}
      <section className="bg-secondary/40 py-16 md:py-20 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our journey so far
            </h2>
            <p className="text-lg opacity-70">
              A quick look at how HireHeaven has grown into what it is today.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative">
            <div className="absolute left-6 top-2 bottom-2 w-px bg-border hidden sm:block" />
            <div className="space-y-10">
              {journey.map((j) => (
                <div key={j.title} className="relative flex gap-5">
                  <div className="relative z-10 h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                    <j.icon size={20} />
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-lg font-semibold mb-1">{j.title}</h3>
                    <p className="text-sm leading-relaxed opacity-70">
                      {j.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Ready to find your dream job?
            </h2>
            <p className="text-lg md:text-xl opacity-80">
              Join thousands of successful job seekers on HireHeaven
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/jobs">
                <Button size="lg" className="gap-2 h-12 px-8 text-base">
                  Get Started
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 h-12 px-8 text-base"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
