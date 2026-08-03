"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Deterministic, on-brand gradient per company so the same company always
// gets the same fallback color across the app.
const GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-rose-500 to-red-700",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-700",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-pink-700",
  "from-indigo-500 to-blue-800",
];

function gradientFor(name: string) {
  const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

interface CompanyLogoProps {
  name: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({
  name,
  src,
  className,
  textClassName,
}) => {
  const [failed, setFailed] = useState(false);

  // Plain <img onError>, not Radix's Avatar/AvatarFallback: Radix tracks
  // load status by preloading with `new Image()` internally, which can
  // race its own status listener on cached/instant loads and leave the
  // fallback stuck un-rendered. An empty string is falsy but <img src="">
  // still fires a (broken) load attempt in some browsers, so it's checked
  // explicitly rather than relied on to just be falsy.
  const showFallback = !src || src.trim() === "" || failed;
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  if (showFallback) {
    return (
      <div
        className={cn(
          "rounded-xl size-14 shrink-0 flex items-center justify-center bg-linear-to-br font-bold text-white",
          gradientFor(name || "?"),
          className,
          textClassName
        )}
      >
        {letter}
      </div>
    );
  }

  return (
    <img
      src={src as string}
      alt={name}
      onError={() => setFailed(true)}
      className={cn("rounded-xl size-14 shrink-0 object-cover", className)}
    />
  );
};

export default CompanyLogo;
