import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-overlay text-muted",
        accent: "bg-[rgba(230,180,80,0.12)] text-accent",
        good: "bg-[rgba(87,201,126,0.12)] text-signal-good",
        bad: "bg-[rgba(232,123,110,0.12)] text-signal-bad",
        violet: "bg-[rgba(139,140,240,0.12)] text-data-violet",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}
