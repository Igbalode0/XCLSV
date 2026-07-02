"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { EqBars } from "@/components/ui/eq-bars";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Stepper } from "./stepper";
import {
  DATA_STEP_COUNT,
  FIRST_DATA_STEP,
  LAST_DATA_STEP,
  STEP,
  STEP_META,
} from "./constants";
import { completeOnboarding, saveOnboardingDraft } from "./actions";
import type { OnboardingDraft, UsernameStatus } from "./types";
import { PurposeStep } from "./steps/purpose-step";
import { UsernameStep } from "./steps/username-step";
import { ProfileStep } from "./steps/profile-step";
import { GenresStep } from "./steps/genres-step";
import { SocialsStep } from "./steps/socials-step";
import { NotificationsStep } from "./steps/notifications-step";
import { CompleteStep } from "./steps/complete-step";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

/** Never resume into Welcome's intro or the post-commit Complete screen. */
function clampResumeStep(step: number): number {
  if (!Number.isFinite(step)) return STEP.WELCOME;
  return Math.min(Math.max(step, STEP.WELCOME), LAST_DATA_STEP);
}

export function OnboardingFlow({ initialDraft }: { initialDraft: OnboardingDraft }) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [draft, setDraft] = useState<OnboardingDraft>(initialDraft);
  const [step, setStep] = useState<number>(clampResumeStep(initialDraft.step));
  const [direction, setDirection] = useState<1 | -1>(1);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({ status: "idle" });
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState("/");

  const update = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const onUsernameStatus = useCallback(
    (status: UsernameStatus) => setUsernameStatus(status),
    [],
  );

  // Advance/retreat and persist progress (best-effort) so a refresh resumes.
  const goto = useCallback((target: number, dir: 1 | -1) => {
    setError(null);
    setDirection(dir);
    setStep(target);
    setDraft((prev) => {
      const next = { ...prev, step: target };
      void saveOnboardingDraft(next).catch(() => {});
      return next;
    });
  }, []);

  const canAdvance = useMemo(() => {
    switch (step) {
      case STEP.PURPOSE:
        return draft.intent !== null;
      case STEP.USERNAME:
        return usernameStatus.status === "available";
      case STEP.PROFILE:
        return draft.displayName.trim().length > 0;
      default:
        return true;
    }
  }, [step, draft.intent, draft.displayName, usernameStatus]);

  async function finish() {
    setError(null);
    setCompleting(true);
    try {
      const result = await completeOnboarding(draft);
      setRedirectTo(result.redirectTo);
      goto(STEP.COMPLETE, 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong — please try again.");
    } finally {
      setCompleting(false);
    }
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * 28 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduce ? 0 : dir * -28 }),
  };

  const showProgress = step >= FIRST_DATA_STEP && step <= LAST_DATA_STEP;

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* ambient amber glow — the room lit by the gear */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(230,180,80,0.16), transparent 65%)" }}
      />

      <header className="relative flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo playing={step === STEP.WELCOME || step === STEP.COMPLETE} href={null} />
        <div className="flex items-center gap-3">
          {showProgress ? (
            <div className="flex items-center gap-3">
              <span className="tnum text-xs text-faint" aria-live="polite">
                {step - FIRST_DATA_STEP + 1} / {DATA_STEP_COUNT}
              </span>
              <Stepper step={step} />
            </div>
          ) : null}
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );

  function renderStep(): ReactNode {
    if (step === STEP.WELCOME) {
      return <WelcomeView onBegin={() => goto(STEP.PURPOSE, 1)} />;
    }
    if (step === STEP.COMPLETE) {
      return (
        <CompleteStep
          intent={draft.intent ?? "DISCOVER"}
          displayName={draft.displayName}
          onEnter={() => router.push(redirectTo)}
        />
      );
    }

    const meta = STEP_META[step];
    if (!meta) return null;
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">{meta.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight">{meta.title}</h1>
        <p className="mt-2 text-muted">{meta.subtitle}</p>

        <div className="mt-7">{renderStepBody()}</div>

        {error ? <p className="mt-4 text-sm text-signal-bad">{error}</p> : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => goto(step - 1, -1)} disabled={completing}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>

          {step === LAST_DATA_STEP ? (
            <Button onClick={finish} disabled={!canAdvance || completing}>
              {completing ? (
                <>
                  <EqBars className="h-4" /> Setting up…
                </>
              ) : (
                "Complete setup"
              )}
            </Button>
          ) : (
            <Button onClick={() => goto(step + 1, 1)} disabled={!canAdvance}>
              Continue
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  function renderStepBody(): ReactNode {
    switch (step) {
      case STEP.PURPOSE:
        return <PurposeStep draft={draft} update={update} />;
      case STEP.USERNAME:
        return (
          <UsernameStep
            draft={draft}
            update={update}
            status={usernameStatus}
            onStatus={onUsernameStatus}
          />
        );
      case STEP.PROFILE:
        return <ProfileStep draft={draft} update={update} />;
      case STEP.GENRES:
        return <GenresStep draft={draft} update={update} />;
      case STEP.SOCIALS:
        return <SocialsStep draft={draft} update={update} />;
      case STEP.NOTIFICATIONS:
        return <NotificationsStep draft={draft} update={update} />;
      default:
        return null;
    }
  }
}

function WelcomeView({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="text-center">
      <motion.span
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-accent/[0.1] shadow-glow"
      >
        <EqBars bars={4} className="h-7" />
      </motion.span>

      <p className="mt-7 text-xs uppercase tracking-[0.2em] text-accent">Welcome to XCLSV</p>
      <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
        The room before
        <br />
        the release.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        A few quick choices and your space is ready. It takes about a minute — and
        you can change anything later in Settings.
      </p>

      <div className="mx-auto mt-8 w-full max-w-xs">
        <Button size="lg" className="w-full" onClick={onBegin}>
          Begin
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
