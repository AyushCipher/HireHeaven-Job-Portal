import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  value: React.ReactNode;
  label: string;
  sublabel?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  sublabel,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border bg-background flex flex-col gap-3",
        className
      )}
    >
      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-blue-600" />
      </div>
      <div>
        <p className="text-xl font-bold leading-tight">{value}</p>
        <p className="text-sm opacity-70 mt-0.5">{label}</p>
        {sublabel && <p className="text-xs opacity-50 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};

export default StatCard;
