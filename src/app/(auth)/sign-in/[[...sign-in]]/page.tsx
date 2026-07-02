import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <SignIn
      appearance={clerkAppearance}
      signUpUrl="/sign-up"
      // After auth, everyone is routed through the onboarding gate.
      fallbackRedirectUrl="/continue"
    />
  );
}
