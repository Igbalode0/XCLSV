import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The XCLSV text input. Glassy field on charcoal, amber focus ring via the
 * design tokens. `prefix` / `suffix` render fixed adornments inside the field
 * (e.g. the `@` on a handle, or a status icon). Use `invalid` to flag errors.
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, prefix, suffix, invalid, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-md border border-line bg-field px-3.5 transition-colors",
          "focus-within:border-accent",
          invalid && "border-signal-bad/60 focus-within:border-signal-bad",
          className,
        )}
      >
        {prefix ? (
          <span className="shrink-0 text-sm text-faint">{prefix}</span>
        ) : null}
        <input
          ref={ref}
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-faint focus:outline-none"
          {...props}
        />
        {suffix ? <span className="shrink-0">{suffix}</span> : null}
      </div>
    );
  },
);
Input.displayName = "Input";
