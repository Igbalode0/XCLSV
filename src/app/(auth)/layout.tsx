import type { ReactNode } from "react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/**
 * Split-screen auth shell. Brand panel on the left (desktop only); the auth
 * form lives centered on the right, framed in glass by each page.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <AuthBrandPanel />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* compact brand mark for mobile, where the panel is hidden */}
        <div className="mb-10 lg:hidden">
          <Logo playing href={null} />
        </div>

        <div className="w-full max-w-sm">
          <div className="glass rounded-xl p-7 shadow-elev sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
