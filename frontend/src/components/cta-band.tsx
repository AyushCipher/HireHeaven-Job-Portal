import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, Search } from "lucide-react";
import { Button } from "./ui/button";

const CtaBand = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-linear-to-br from-blue-600 to-blue-800 text-white p-8 md:p-10 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <Search size={28} className="mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-2">Looking for a job?</h3>
              <p className="opacity-90 mb-6 max-w-sm">
                Browse thousands of verified openings and apply in a single
                click with your HireHeaven profile.
              </p>
            </div>
            <Link href={"/jobs"} className="relative w-fit">
              <Button
                size={"lg"}
                variant={"secondary"}
                className="gap-2 h-12 px-8"
              >
                Browse Jobs <ArrowRight size={18} />
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl bg-linear-to-br from-red-500 to-red-700 text-white p-8 md:p-10 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <Building2 size={28} className="mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-2">Hiring talent?</h3>
              <p className="opacity-90 mb-6 max-w-sm">
                Post roles, manage applications and find the right candidate
                faster with recruiter tools built in.
              </p>
            </div>
            <Link href={"/register"} className="relative w-fit">
              <Button
                size={"lg"}
                variant={"secondary"}
                className="gap-2 h-12 px-8"
              >
                Post a Job <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBand;
