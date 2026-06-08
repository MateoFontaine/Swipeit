import { cn } from "@/lib/utils";

type SubmitButtonProps = React.ComponentProps<"button"> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "success";
};

const variants = {
  primary:
    "bg-primary text-white shadow-lg shadow-black/10 hover:bg-primary-dark active:scale-[0.98]",
  secondary:
    "bg-card text-foreground border border-border shadow-sm hover:bg-muted active:scale-[0.98]",
  success:
    "bg-emerald-600 text-white shadow-lg shadow-black/10 hover:bg-emerald-700 active:scale-[0.98]",
};

export function SubmitButton({
  className,
  loading,
  variant = "primary",
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-14 w-full items-center justify-center rounded-2xl px-6 text-base font-semibold transition-all",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading ? "Enviando…" : children}
    </button>
  );
}
