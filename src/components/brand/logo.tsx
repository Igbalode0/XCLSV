import Link from "next/link";
import { EqBars } from "@/components/ui/eq-bars";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Animate the EQ motif (use on landing/auth; rest it in dense chrome). */
  playing?: boolean;
  /** Pass null to render a non-linked mark (e.g. on the page it links to). */
  href?: string | null;
}

/**
 * The XCLSV wordmark. The EQ motif sits inside the brand mark itself, so the
 * product's signature is present the moment someone arrives.
 */
export function Logo({ className, playing = false, href = "/" }: LogoProps) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <EqBars bars={3} playing={playing} className="h-4" />
      <span className="font-display text-lg font-semibold tracking-[0.18em] text-foreground">
        XCLSV
      </span>
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} aria-label="XCLSV home">
      {mark}
    </Link>
  );
}
