import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = Omit<React.ComponentProps<"a">, "href"> & {
  href: string;
  variant?: "primary" | "secondary" | "outline";
};

const variants = {
  primary:
    "bg-primary text-white shadow-lg shadow-black/15 hover:bg-primary-dark active:scale-[0.98]",
  secondary:
    "bg-card text-foreground border border-border shadow-sm hover:bg-muted active:scale-[0.98]",
  outline:
    "border-2 border-foreground text-foreground hover:bg-foreground/5 active:scale-[0.98]",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-14 w-full items-center justify-center rounded-2xl px-6 text-base font-semibold transition-all",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
