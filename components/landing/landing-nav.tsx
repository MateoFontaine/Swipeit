"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { LandingAnchorLink } from "@/components/landing/landing-anchor-link";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const { scrollY } = useScroll();
  const backdropOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        className="absolute inset-0 border-b border-border bg-background/80 backdrop-blur-xl"
        style={{ opacity: backdropOpacity }}
      />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          Swipe<span className="text-accent">it</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <LandingAnchorLink
            href="#como-funciona"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Cómo funciona
          </LandingAnchorLink>
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className={cn(
              "rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white",
              "shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.02]"
            )}
          >
            Crear encuesta
          </Link>
        </div>
      </nav>
    </header>
  );
}
