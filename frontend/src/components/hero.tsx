import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="absolute inset-0 opacity-10 dark:opacity-15">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <div className="container mx-auto px-5 py-16 md:py-24 relative">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 backdrop-blur-sm">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-sm font-medium">
                #1 Job Platform in India
              </span>
            </div>

            {/* main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Find Your Dream Job at{" "}
              <span className="inline-block">
                Hire<span className="text-red-500">Heaven</span>
              </span>
            </h1>

            {/* descripiton */}
            <p className="text-lg md:text-xl leading-relaxed opacity-80 max-w-2xl">
              Connect with top employers and discover opportunities that match
              your skills. Whether you&apos;re a job seeker or a recruiter,
              we&apos;ve got you covered with powerful tools and a seamless
              experience.
            </p>

            {/* stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-8 py-4">
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600">10k+</p>
                <p className="text-sm opacity-70">Active Jobs</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600">5k+</p>
                <p className="text-sm opacity-70">Companies</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600">50k+</p>
                <p className="text-sm opacity-70">Job Seekers</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href={"/jobs"}>
                <Button
                  size={"lg"}
                  className="text-base px-8 h-12 gap-2 group transition-all"
                >
                  <Search size={18} />
                  Browse Jobs{" "}
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>
              <Link href={"/about"}>
                <Button
                  variant={"outline"}
                  size={"lg"}
                  className="text-base px-8 h-12 gap-2"
                >
                  <Briefcase size={18} />
                  Learn More
                </Button>
              </Link>
            </div>

            {/* trust indicator section */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-sm opacity-70 pt-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-blue-600" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-blue-600" />
                Verified employers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-blue-600" />
                Secure platform
              </span>
            </div>
          </div>

          {/* image section */}
          <div className="flex-1 relative">
            <div className="relative group max-w-md mx-auto md:max-w-none">
              <div className="absolute -inset-4 bg-blue-400 opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-background aspect-4/5 md:aspect-square">
                <img
                  src="/hero.jpeg"
                  className="object-cover object-center w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                  alt="Job seeker celebrating a new job offer secured through HireHeaven"
                />
              </div>

              {/* floating stat card */}
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-xl border bg-background/95 backdrop-blur-sm shadow-xl px-4 py-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">2,400+</p>
                  <p className="text-xs opacity-70 mt-1">Hires this month</p>
                </div>
              </div>

              {/* floating verified badge */}
              <div className="absolute -top-5 -right-5 hidden sm:flex items-center gap-2 rounded-full border bg-background/95 backdrop-blur-sm shadow-xl px-4 py-2.5">
                <ShieldCheck size={16} className="text-blue-600" />
                <span className="text-xs font-semibold">
                  Verified Employers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
