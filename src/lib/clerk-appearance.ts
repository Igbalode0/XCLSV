import type { Appearance } from "@clerk/types";

/**
 * Maps Clerk's components onto the XCLSV design system so the auth flow feels
 * native and premium rather than like stock Clerk. We render our own glass
 * frame around the component (card → transparent), and restyle the inner
 * controls to the amber/charcoal language.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#e6b450",
    colorBackground: "#111317",
    colorText: "#f5f4f2",
    colorTextSecondary: "#9a968f",
    colorInputBackground: "rgba(255,255,255,0.04)",
    colorInputText: "#f5f4f2",
    colorDanger: "#e87b6e",
    colorSuccess: "#57c97e",
    borderRadius: "12px",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    // We supply the surrounding frame ourselves.
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "bg-transparent shadow-none border-0 p-0 gap-6",
    header: "gap-1",
    headerTitle: "font-display text-2xl tracking-tight",
    headerSubtitle: "text-muted",

    socialButtonsBlockButton:
      "glass rounded-md h-11 text-foreground hover:bg-white/[0.07] transition-colors",
    socialButtonsBlockButtonText: "font-medium",

    dividerLine: "bg-line",
    dividerText: "text-faint text-xs uppercase tracking-wider",

    formFieldLabel: "text-muted text-sm",
    formFieldInput:
      "h-11 rounded-md border border-line bg-white/[0.04] focus:border-accent",
    formButtonPrimary:
      "h-11 rounded-md bg-accent text-canvas font-medium shadow-glow hover:bg-accent-hi transition-all normal-case text-sm",

    footer: "bg-transparent",
    footerActionText: "text-muted",
    footerActionLink: "text-accent hover:text-accent-hi font-medium",
    identityPreviewEditButton: "text-accent",
    formResendCodeLink: "text-accent hover:text-accent-hi",
  },
};
