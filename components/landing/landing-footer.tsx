import Link from "next/link";
import { LandingAnchorLink } from "@/components/landing/landing-anchor-link";

const footerLinkClass =
  "text-sm text-muted-foreground transition-colors duration-200 hover:text-violet-600";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Swipe<span className="text-violet-600">it</span>
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Decisiones en grupo con swipe. Simple, rápido, desde el celular.
            </p>
          </div>

          <nav
            className="flex flex-col gap-3 sm:items-end sm:text-right"
            aria-label="Enlaces del sitio"
          >
            <LandingAnchorLink href="#como-funciona" className={footerLinkClass}>
              Cómo funciona
            </LandingAnchorLink>
            <Link href="/login" className={footerLinkClass}>
              Iniciar sesión
            </Link>
            <Link href="/register" className={footerLinkClass}>
              Crear encuesta
            </Link>
          </nav>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Swipeit
          </p>
        </div>
      </div>
    </footer>
  );
}
