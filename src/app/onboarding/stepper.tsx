import { DATA_STEP_COUNT, FIRST_DATA_STEP } from "./constants";
import { cn } from "@/lib/utils";

/** Segmented progress across the six data steps. Decorative; the header also
 * shows a textual "n / 6" for screen readers. */
export function Stepper({ step }: { step: number }) {
  const current = step - FIRST_DATA_STEP; // 0-based index within the data steps
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: DATA_STEP_COUNT }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 rounded-full transition-all duration-300",
            i <= current ? "w-7 bg-accent" : "w-4 bg-overlay-strong",
          )}
        />
      ))}
    </div>
  );
}
