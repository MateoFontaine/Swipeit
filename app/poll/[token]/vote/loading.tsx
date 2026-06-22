import { PollShell } from "@/components/poll/poll-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function VoteLoading() {
  return (
    <PollShell>
      <header>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-8 w-3/4 max-w-sm" />
        <Skeleton className="mt-4 h-0.5 w-8 rounded-full" />
      </header>

      <div className="mt-8 flex flex-col gap-4">
        <Skeleton className="mx-auto h-4 w-36" />
        <Skeleton className="mx-auto aspect-[3/4] w-full max-w-[400px] rounded-3xl" />
        <div className="flex justify-center gap-8">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-14 w-14 rounded-full" />
        </div>
      </div>
    </PollShell>
  );
}
