import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type SubmitButtonProps = React.ComponentProps<"button"> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "success";
};

const variants = {
  primary:
    "bg-violet-600 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700 active:scale-[0.98]",
  secondary:
    "bg-background text-foreground border border-border/80 shadow-sm hover:border-violet-300/60 hover:bg-violet-500/[0.03] active:scale-[0.98]",
  success:
    "bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 hover:bg-emerald-700 active:scale-[0.98]",
};

export function SubmitButton({
  className,
  loading,
  variant = "primary",
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  if (loading) {
    return (
      <div aria-busy="true" aria-label="Procesando…" className={cn("w-full", className)}>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "inline-flex h-14 w-full items-center justify-center rounded-xl px-6 text-base font-semibold transition-all",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
