import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = Omit<React.ComponentProps<"a">, "href"> & {
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

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-14 w-full items-center justify-center rounded-xl px-6 text-base font-semibold transition-all",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
