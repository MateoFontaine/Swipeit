import { cn } from "@/lib/utils";

type TextareaProps = React.ComponentProps<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-xl border border-border/80 bg-background px-4 py-3 text-base text-foreground",
        "placeholder:text-muted-foreground/70",
        "focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
