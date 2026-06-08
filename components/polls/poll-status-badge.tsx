import { POLL_STATUS_LABELS } from "@/lib/polls/utils";
import type { PollStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<PollStatus, string> = {
  esperando: "bg-amber-50 text-amber-800 border-amber-200",
  votando: "bg-emerald-50 text-emerald-800 border-emerald-200",
  ballotage: "bg-violet-50 text-violet-800 border-violet-200",
  resultados: "bg-sky-50 text-sky-800 border-sky-200",
  cerrado: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

type PollStatusBadgeProps = {
  status: PollStatus;
  className?: string;
};

export function PollStatusBadge({ status, className }: PollStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
        className
      )}
    >
      {POLL_STATUS_LABELS[status]}
    </span>
  );
}
