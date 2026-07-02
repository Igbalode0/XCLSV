import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-on-accent shadow-glow hover:bg-accent-hi hover:shadow-[0_8px_50px_rgba(230,180,80,0.28)]",
        glass: "glass text-foreground hover:bg-overlay-strong",
        ghost: "text-muted hover:bg-overlay hover:text-foreground",
        outline:
          "border border-line-strong text-foreground hover:bg-overlay",
      },
      size: {
        sm: "h-9 rounded-sm px-3.5 text-sm",
        md: "h-11 rounded-md px-5 text-sm",
        lg: "h-12 rounded-lg px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(button({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
