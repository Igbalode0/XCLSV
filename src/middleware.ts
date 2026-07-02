import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public surface area. Everything else requires a signed-in user.
 * `/invite/*` stays public so a fan can open an invitation before signing up;
 * `/api/webhooks/*` is public so Clerk/Supabase can call in.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/invite(.*)",
  "/preview(.*)", // DEV ONLY: mock-data screen previews — remove before launch
  "/unavailable", // outage screen — must render without auth or database
  "/pricing",
  "/faq",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files…
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // …always run on API routes.
    "/(api|trpc)(.*)",
  ],
};
