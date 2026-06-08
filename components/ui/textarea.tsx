import { cn } from "@/lib/utils";

type TextareaProps = React.ComponentProps<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-2xl border border-border bg-card px-4 py-3 text-base text-foreground",
        "placeholder:text-muted-foreground",
        "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
