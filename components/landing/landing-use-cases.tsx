"use client";

import { motion, useReducedMotion } from "framer-motion";

const USE_CASES = [
  "¿Qué comemos?",
  "¿Qué deporte jugamos?",
  "Elegir película",
  "¿Dónde vamos el finde?",
  "¿Qué juego?",
  "Decisión de equipo",
];

const fade = (reduced: boolean, delay = 0) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] as const },
      };

export function LandingUseCases() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="relative overflow-hidden bg-violet-500/[0.04] py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-300/50 to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <motion.header {...fade(reduced)} className="text-center">
          <p className="text-sm font-medium tracking-wide text-violet-600">
            Casos de uso
          </p>
          <h2 className="mt-3 text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.75rem]">
            Para cualquier decisión
          </h2>
          <div
            className="mx-auto mt-4 h-0.5 w-8 rounded-full bg-violet-500"
            aria-hidden
          />
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-xl">
            Resolvé lo que sea en grupo, sin discusiones interminables.
          </p>
        </motion.header>

        <ul className="mt-12 divide-y divide-violet-200/40 sm:mt-16">
          {USE_CASES.map((label, i) => (
            <motion.li
              key={label}
              {...fade(reduced, i * 0.05)}
              className="group flex items-center gap-3.5 py-4 sm:gap-4 sm:py-5"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500 transition-transform duration-300 group-hover:scale-125"
                aria-hidden
              />
              <span className="text-[1.0625rem] font-medium tracking-tight transition-colors duration-300 group-hover:text-violet-700 sm:text-[1.1875rem]">
                {label}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
