"use client";

import { useState } from "react";
import { PollCard } from "@/components/polls/poll-card";
import type { PollWithWinnerLabel } from "@/lib/polls/winner-labels";

const PAST_LIMIT = 5;

type DashboardPollListProps = {
  title: string;
  eyebrow: string;
  polls: PollWithWinnerLabel[];
  emptyMessage?: string;
  hrefPrefix: string;
  dateLabel?: string;
};

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-violet-600">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-[1.375rem]">
        {title}
      </h2>
      <div className="mt-3 h-0.5 w-6 rounded-full bg-violet-500" aria-hidden />
    </div>
  );
}

export function DashboardPollList({
  title,
  eyebrow,
  polls,
  emptyMessage,
  hrefPrefix,
  dateLabel,
}: DashboardPollListProps) {
  const [showAllPast, setShowAllPast] = useState(false);

  if (polls.length === 0) {
    if (!emptyMessage) return null;

    return (
      <section>
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="mt-5 rounded-xl border border-dashed border-violet-200/60 bg-violet-500/[0.03] px-5 py-8 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {emptyMessage}
          </p>
        </div>
      </section>
    );
  }

  const activePolls = polls.filter((poll) =>
    ["esperando", "votando", "ballotage"].includes(poll.status)
  );
  const pastPolls = polls.filter((poll) =>
    ["resultados", "cerrado"].includes(poll.status)
  );

  const visiblePast = showAllPast
    ? pastPolls
    : pastPolls.slice(0, PAST_LIMIT);
  const hiddenPastCount = pastPolls.length - PAST_LIMIT;

  return (
    <section>
      <SectionHeader eyebrow={eyebrow} title={title} />

      <div className="mt-5 flex flex-col gap-6">
        {activePolls.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Activas
            </h3>
            <div className="flex flex-col gap-2.5">
              {activePolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  href={`${hrefPrefix}/${poll.id}`}
                  dateLabel={dateLabel}
                />
              ))}
            </div>
          </div>
        )}

        {pastPolls.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Anteriores
            </h3>
            <div className="flex flex-col gap-2.5">
              {visiblePast.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  href={`${hrefPrefix}/${poll.id}`}
                  dateLabel={dateLabel}
                />
              ))}
            </div>
            {hiddenPastCount > 0 && !showAllPast && (
              <button
                type="button"
                onClick={() => setShowAllPast(true)}
                className="mt-4 w-full rounded-xl border border-border/80 py-3 text-sm font-medium text-violet-600 transition-colors hover:border-violet-300/70 hover:bg-violet-500/[0.04]"
              >
                Ver más ({hiddenPastCount})
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
