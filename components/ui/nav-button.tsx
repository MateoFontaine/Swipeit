"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type NavButtonProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: "primary" | "secondary" | "outline";
};

const variants = {
  primary:
    "bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700 active:scale-[0.98]",
  secondary:
    "bg-background text-foreground border border-border/80 shadow-sm hover:border-violet-300/60 hover:bg-violet-500/[0.03] active:scale-[0.98]",
  outline:
    "border border-foreground/20 text-foreground hover:border-violet-300/60 hover:bg-violet-500/[0.03] active:scale-[0.98]",
};

function NavButtonInner({
  children,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  variant?: NavButtonProps["variant"];
  className?: string;
}) {
  const { pending } = useLinkStatus();

  if (pending) {
    return (
      <div aria-busy="true" aria-label="Cargando…">
        <Skeleton className={cn("h-14 w-full rounded-xl", className)} />
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-14 w-full items-center justify-center rounded-xl px-6 text-base font-semibold transition-all",
        variants[variant ?? "primary"],
        className
      )}
    >
      {children}
    </span>
  );
}

export function NavButton({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: NavButtonProps) {
  return (
    <Link href={href} className="block w-full" {...props}>
      <NavButtonInner variant={variant} className={className}>
        {children}
      </NavButtonInner>
    </Link>
  );
}
