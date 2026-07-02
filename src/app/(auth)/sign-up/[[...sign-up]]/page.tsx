import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      // New accounts land on the onboarding gate, which sends them to /onboarding.
      fallbackRedirectUrl="/continue"
    />
  );
}
