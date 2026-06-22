"use client";

import { cn } from "@/lib/utils";

type LandingAnchorLinkProps = {
  href: `#${string}`;
  className?: string;
  children: React.ReactNode;
};

export function LandingAnchorLink({
  href,
  className,
  children,
}: LandingAnchorLinkProps) {
  const targetId = href.slice(1);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });

    window.history.pushState(null, "", href);
  }

  return (
    <a href={href} onClick={handleClick} className={cn(className)}>
      {children}
    </a>
  );
}
