import type { Metadata } from "next";
import {
  LandingCta,
  LandingFooter,
  LandingHero,
  LandingHowItWorks,
  LandingNav,
  LandingUseCases,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "Swipeit — Decisiones en grupo con swipe",
  description:
    "Resolvé decisiones en grupo deslizando opciones. Creá una encuesta, compartí el link y votá. Ranking y ballotage automático.",
  openGraph: {
    title: "Swipeit — Decisiones en grupo con swipe",
    description:
      "Resolvé decisiones en grupo deslizando opciones. Creá una encuesta, compartí el link y votá.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingHowItWorks />
        <LandingUseCases />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
