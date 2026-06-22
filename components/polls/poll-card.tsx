import Link from "next/link";
import { formatPollDate } from "@/lib/polls/constants";
import type { PollWithWinnerLabel } from "@/lib/polls/winner-labels";
import { PollStatusBadge } from "./poll-status-badge";

type PollCardProps = {
  poll: PollWithWinnerLabel;
  href?: string;
  dateLabel?: string;
};

export function PollCard({
  poll,
  href = `/dashboard/${poll.id}`,
  dateLabel = "Creada",
}: PollCardProps) {
  const showWinner =
    ["resultados", "cerrado"].includes(poll.status) && poll.winner_label;

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border/60 bg-background px-4 py-4 transition-colors duration-200 hover:border-violet-300/70 active:bg-violet-500/[0.03] sm:px-5 sm:py-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-semibold leading-snug tracking-tight text-foreground group-hover:text-violet-700">
          {poll.title}
        </h3>
        <PollStatusBadge status={poll.status} className="shrink-0" />
      </div>
      {poll.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {poll.description}
        </p>
      )}
      {showWinner && (
        <p className="mt-2 text-sm text-violet-700">
          <span className="font-medium">Ganador:</span> {poll.winner_label}
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {dateLabel} {formatPollDate(poll.created_at)}
        {poll.closed_at && <> · Cerrada {formatPollDate(poll.closed_at)}</>}
      </p>
    </Link>
  );
}
