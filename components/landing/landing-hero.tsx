"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LandingPhoneDemo } from "@/components/landing/landing-phone-demo";
import { cn } from "@/lib/utils";

const FEATURES = [
  { emoji: "👆", label: "Swipe para votar" },
  { emoji: "🏆", label: "Ranking en vivo" },
  { emoji: "⚖️", label: "Ballotage automático" },
];

function HeroBackground() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_20%,rgba(236,72,153,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(124,58,237,0.1),transparent_50%)]" />
      <div className="hero-dot-grid absolute inset-0 opacity-60" />
      <div
        className={cn(
          "absolute -left-24 top-16 h-[28rem] w-[28rem] rounded-full bg-violet-500/20 blur-[100px]",
          !reduced && "animate-[blob-float_20s_ease-in-out_infinite]"
        )}
      />
      <div
        className={cn(
          "absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-pink-500/15 blur-[90px]",
          !reduced && "animate-[blob-float-alt_24s_ease-in-out_infinite]"
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-violet-400/10 blur-[80px]",
          !reduced && "animate-[blob-float_28s_ease-in-out_infinite_reverse]"
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}

const FLOATING_PROMPTS = [
  {
    emoji: "🍕",
    label: "¿Qué comemos?",
    className: "left-[0%] top-[18%] sm:left-[-4%] sm:top-[16%]",
    delay: 0.2,
  },
  {
    emoji: "🎬",
    label: "¿Qué película?",
    className: "right-[-2%] top-[42%] sm:right-[-6%]",
    delay: 0.35,
  },
  {
    emoji: "🏖️",
    label: "¿Dónde vamos?",
    className: "left-[-2%] bottom-[14%] sm:left-[-6%] sm:bottom-[12%]",
    delay: 0.5,
  },
  {
    emoji: "⚽",
    label: "¿Qué deporte?",
    className: "right-[2%] bottom-[6%] sm:right-[-2%] sm:bottom-[4%]",
    delay: 0.65,
  },
];

function FloatingBadge({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "absolute z-20 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-2.5 py-1.5 text-[10px] font-semibold text-foreground shadow-lg shadow-violet-500/10 backdrop-blur-md sm:px-3 sm:py-2 sm:text-xs",
        className
      )}
      initial={reduced ? false : { opacity: 0, scale: 0.9 }}
      animate={
        reduced
          ? { opacity: 1, scale: 1 }
          : { opacity: 1, scale: 1, y: [0, -6, 0] }
      }
      transition={
        reduced
          ? { duration: 0.4, delay }
          : {
              opacity: { duration: 0.5, delay },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function LandingHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24">
      <HeroBackground />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:gap-14 sm:px-8 lg:grid-cols-2 lg:gap-20 xl:gap-24 lg:px-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center lg:text-left"
        >
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/60 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            Votación estilo Tinder para grupos
          </motion.div>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Decisiones en grupo,{" "}
            <span className="hero-gradient-text">sin drama</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            Creá una encuesta con tus opciones, compartí el link y cada persona
            vota deslizando. Al cerrar, ves el ranking completo — y ballotage si
            hay empate.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {FEATURES.map((f, i) => (
              <motion.span
                key={f.label}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-white/50 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-sm sm:text-sm"
              >
                <span aria-hidden>{f.emoji}</span>
                {f.label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[24rem] sm:max-w-[28rem] lg:max-w-none lg:w-full"
          id="demo"
        >
          <div className="relative h-[34rem] w-full sm:h-[36rem]">
            <div className="absolute inset-x-[4%] inset-y-[2%] rounded-full bg-gradient-to-br from-violet-400/35 via-pink-300/20 to-violet-200/10 blur-2xl" />
            <div className="absolute inset-x-[8%] inset-y-[1%] rounded-full border border-violet-300/45 bg-white/20 shadow-inner shadow-violet-200/30 backdrop-blur-[2px]" />
            {!reduced && (
              <div className="absolute inset-x-[8%] inset-y-[1%] rounded-full">
                <div className="hero-ring-pulse absolute inset-0 rounded-full border border-pink-300/30" />
              </div>
            )}

            {FLOATING_PROMPTS.map((prompt) => (
              <FloatingBadge
                key={prompt.label}
                className={prompt.className}
                delay={prompt.delay}
              >
                <span aria-hidden>{prompt.emoji}</span>
                {prompt.label}
              </FloatingBadge>
            ))}

            <div className="absolute inset-0 flex items-center justify-center">
              <LandingPhoneDemo />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
