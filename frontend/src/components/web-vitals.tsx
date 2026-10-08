"use client";

import { useReportWebVitals } from "next/navigation";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Report Core Web Vitals (LCP, FID/INP, CLS, FCP, TTFB)
    if (process.env.NODE_ENV === "development") {
      const isGood =
        (metric.name === "LCP" && metric.value <= 2500) ||
        (metric.name === "CLS" && metric.value <= 0.1) ||
        (metric.name === "FCP" && metric.value <= 1800) ||
        (metric.name === "INP" && metric.value <= 200);

      const statusIcon = isGood ? "🟢" : "🟡";
      console.debug(
        `%c[Web Vitals] ${statusIcon} ${metric.name}: ${Math.round(metric.value)}ms (rating: ${metric.rating})`,
        "color: #10b981; font-weight: bold;"
      );
    }
  });

  return null;
}
