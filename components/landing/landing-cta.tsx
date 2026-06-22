"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LandingCta() {
  const reduced = useReducedMotion();

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-600/30 via-muted to-pink-500/20 p-8 text-center sm:p-12"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl"
            aria-hidden
          />

          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Listo para decidir en grupo?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
            Creá tu primera encuesta en minutos. Gratis, sin tarjeta.
          </p>
          <Link
            href="/register"
            className={cn(
              "relative mt-8 inline-flex h-14 items-center justify-center rounded-2xl px-10",
              "bg-gradient-to-r from-violet-600 to-pink-500 text-base font-semibold text-white",
              "shadow-lg shadow-violet-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            Crear mi primera encuesta
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
