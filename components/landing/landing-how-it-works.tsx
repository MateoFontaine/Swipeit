"use client";

import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  {
    number: "1",
    title: "Creá la encuesta",
    description: "Escribí tu pregunta y agregá las opciones.",
  },
  {
    number: "2",
    title: "Compartí el link",
    description: "Cada persona entra desde su celular con un nickname.",
  },
  {
    number: "3",
    title: "Voten con swipe",
    description: "Deslizan para elegir. Al cerrar, ranking y ballotage.",
  },
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

export function LandingHowItWorks() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="como-funciona" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <motion.header {...fade(reduced)} className="text-center">
          <p className="text-sm font-medium tracking-wide text-violet-600">
            En 3 pasos
          </p>
          <h2 className="mt-3 text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.75rem]">
            Cómo funciona
          </h2>
          <div
            className="mx-auto mt-4 h-0.5 w-8 rounded-full bg-violet-500"
            aria-hidden
          />
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-xl">
            Tres pasos. Un minuto. Listo.
          </p>
        </motion.header>

        <ol className="mt-14 sm:mt-20">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.number}
              {...fade(reduced, i * 0.08)}
              className="relative flex gap-5 pb-10 last:pb-0 sm:gap-6 sm:pb-12"
            >
              <div className="flex flex-col items-center self-stretch">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-sm font-semibold text-violet-600 ring-1 ring-violet-500/20">
                  {step.number}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className="my-2 w-px flex-1 bg-linear-to-b from-violet-300/70 to-violet-200/20"
                    aria-hidden
                  />
                )}
              </div>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-[1.125rem] font-semibold tracking-tight sm:text-[1.375rem]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[1rem] leading-relaxed text-muted-foreground sm:mt-2 sm:text-[1.0625rem]">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
