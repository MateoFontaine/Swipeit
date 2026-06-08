import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-14 w-full rounded-2xl border border-border bg-card px-4 text-base text-foreground",
        "placeholder:text-muted-foreground",
        "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
