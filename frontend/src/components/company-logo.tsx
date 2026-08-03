import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <Avatar className={cn("rounded-xl size-14", className)}>
      {src && <AvatarImage src={src} alt={name} className="object-cover" />}
      <AvatarFallback
        className={cn(
          "rounded-xl bg-linear-to-br font-bold text-white",
          gradientFor(name || "?"),
          textClassName
        )}
      >
        {letter}
      </AvatarFallback>
    </Avatar>
  );
};

export default CompanyLogo;
