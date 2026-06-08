import Link from "next/link";
import { formatPollDate } from "@/lib/polls/utils";
import type { Poll } from "@/types";
import { PollStatusBadge } from "./poll-status-badge";

type PollCardProps = {
  poll: Poll;
};

export function PollCard({ poll }: PollCardProps) {
  return (
    <Link
      href={`/dashboard/${poll.id}`}
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
      <p className="mt-3 text-xs text-muted-foreground">
        Creada {formatPollDate(poll.created_at)}
      </p>
    </Link>
  );
}
