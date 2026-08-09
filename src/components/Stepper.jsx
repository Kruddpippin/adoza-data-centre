import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// A registration-wizard progress header: icon + title for the current step, and a row
// of numbered dots (checked once passed) connected by a line — one step's fields visible
// at a time instead of one long scrolling form.
export function Stepper({ steps, currentStep }) {
  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="mb-6">
      <div className="mb-5 flex items-center justify-center gap-2 text-center text-sm font-bold uppercase tracking-wide text-foreground">
        <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        {step.title}
      </div>
      <div className="flex items-center justify-center">
        {steps.map((s, i) => (
          <div key={s.title} className="flex items-center">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
              aria-current={i === currentStep ? "step" : undefined}
            >
              {i < currentStep ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 w-6 shrink-0 sm:w-14", i < currentStep ? "bg-primary" : "bg-muted")} aria-hidden />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
