import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds the amber glow — reserve for the one hero stat on a screen. */
  glow?: boolean;
}

export function Card({ className, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-lg p-5 shadow-elev",
        glow && "shadow-glow",
        className,
      )}
      {...props}
    />
  );
}

export function CardLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs uppercase tracking-wider text-faint",
        className,
      )}
      {...props}
    />
  );
}

export function CardValue({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("tnum mt-1.5 text-2xl text-foreground", className)} {...props} />
  );
}
