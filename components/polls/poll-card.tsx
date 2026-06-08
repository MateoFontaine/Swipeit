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
      className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-accent/40 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug text-foreground">
          {poll.title}
        </h3>
        <PollStatusBadge status={poll.status} />
      </div>
      {poll.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {poll.description}
        </p>
      )}
      {showWinner && (
        <p className="mt-2 text-sm text-emerald-700">
          <span className="font-medium">Ganador:</span> {poll.winner_label}
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {dateLabel} {formatPollDate(poll.created_at)}
        {poll.closed_at && (
          <> · Cerrada {formatPollDate(poll.closed_at)}</>
        )}
      </p>
    </Link>
  );
}
