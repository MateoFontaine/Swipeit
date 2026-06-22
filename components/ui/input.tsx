import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-14 w-full rounded-xl border border-border/80 bg-background px-4 text-base text-foreground",
        "placeholder:text-muted-foreground/70",
        "focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
