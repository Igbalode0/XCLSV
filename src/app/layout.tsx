import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Space_Grotesk } from "next/font/google";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "@/styles/globals.css";

// Display face — used with restraint for headlines + big numbers.
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "XCLSV — Release smarter before releasing everywhere.",
  description:
    "Privately release unreleased music to your inner circle, gather real listening intelligence, and perfect every track before it goes public.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/continue"
      signUpFallbackRedirectUrl="/continue"
    >
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable} ${display.variable}`}
        suppressHydrationWarning
      >
        <head>
          {/* Apply the saved theme before paint to avoid a flash. Dark is the
              default; only an explicit "light" choice adds the class. */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "try{if(localStorage.getItem('xclsv-theme')==='light')document.documentElement.classList.add('light')}catch(e){}",
            }}
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
