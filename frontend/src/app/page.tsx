"use client";
import CarrerGuide from "@/components/carrer-guide";
import CtaBand from "@/components/cta-band";
import Features from "@/components/features";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Loading from "@/components/loading";
import ResumeAnalyzer from "@/components/resume-analyser";
import Testimonials from "@/components/testimonials";
import TrustLogos from "@/components/trust-logos";
import { useAppData } from "@/context/AppContext";
import React from "react";

const Home = () => {
  const { loading } = useAppData();
  if (loading) return <Loading />;
  return (
    <div>
      <Hero />
      <TrustLogos />
      <Features />
      <HowItWorks />
      <CarrerGuide />
      <ResumeAnalyzer />
      <Testimonials />
      <CtaBand />
    </div>
  );
};

export default Home;
