import { PollShell } from "@/components/poll/poll-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function PollJoinLoading() {
  return (
    <PollShell>
      <header>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-8 w-3/4 max-w-sm" />
        <Skeleton className="mt-4 h-0.5 w-8 rounded-full" />
        <Skeleton className="mt-4 h-4 w-40" />
      </header>

      <div className="mt-8 flex flex-col gap-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-full max-w-xs" />
        <Skeleton className="mb-1 h-4 w-12" />
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </PollShell>
  );
}
