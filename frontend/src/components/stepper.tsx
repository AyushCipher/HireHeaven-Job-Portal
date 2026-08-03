import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string | number;
  name: string;
  description?: string | null;
  status: "upcoming" | "in_progress" | "completed" | "rejected";
  timestamp?: string | null;
}

const STATUS_LABEL: Record<StepperStep["status"], string> = {
  upcoming: "Yet To Start",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

const STATUS_BADGE_CLASS: Record<StepperStep["status"], string> = {
  upcoming: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  completed: "bg-green-100 dark:bg-green-900/30 text-green-600",
  rejected: "bg-red-100 dark:bg-red-900/30 text-red-600",
};

interface StepperProps {
  steps: StepperStep[];
  orientation?: "list" | "timeline";
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  orientation = "list",
  className,
}) => {
  if (steps.length === 0) {
    return (
      <p className="text-sm opacity-60 py-4">
        The recruiter hasn&apos;t published a hiring process for this role
        yet.
      </p>
    );
  }

  if (orientation === "timeline") {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-6">
          {steps.map((step) => {
            const isCompleted = step.status === "completed";
            const isRejected = step.status === "rejected";
            const isCurrent = step.status === "in_progress";

            return (
              <div key={step.id} className="relative flex gap-4">
                <div
                  className={cn(
                    "relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-background",
                    isCompleted &&
                      "bg-green-600 border-green-600 text-white",
                    isRejected && "bg-red-600 border-red-600 text-white",
                    isCurrent && "border-green-600",
                    step.status === "upcoming" && "border-border opacity-50"
                  )}
                >
                  {isCompleted && <CheckCircle2 size={16} />}
                  {isRejected && <XCircle size={16} />}
                  {isCurrent && (
                    <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "pb-1",
                    step.status === "upcoming" && "opacity-50"
                  )}
                >
                  <p className="font-medium leading-tight">{step.name}</p>
                  {step.timestamp && (
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(step.timestamp).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className={cn("w-full", className)}>
      {steps.map((step, index) => (
        <AccordionItem value={String(step.id)} key={step.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-4 flex-1 pr-4">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold border-2",
                  step.status === "completed"
                    ? "bg-green-600 border-green-600 text-white"
                    : step.status === "rejected"
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-blue-600 text-blue-600"
                )}
              >
                {index + 1}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{step.name}</p>
                <span
                  className={cn(
                    "inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium",
                    STATUS_BADGE_CLASS[step.status]
                  )}
                >
                  {STATUS_LABEL[step.status]}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-12 text-sm opacity-70">
            {step.description || "No additional details for this round."}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default Stepper;
