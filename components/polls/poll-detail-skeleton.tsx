import { Skeleton } from "@/components/ui/skeleton";

export function PollDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-3/4 max-w-sm" />
        <Skeleton className="mt-4 h-0.5 w-8 rounded-full" />
        <Skeleton className="mt-4 h-4 w-full max-w-md" />
        <div className="mt-5 grid grid-cols-2 gap-4">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </header>

      <section>
        <Skeleton className="h-4 w-28" />
        <div className="mt-4 flex flex-col gap-2.5">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </section>

      <section>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-3 h-4 w-full max-w-xs" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-14 flex-1 rounded-xl" />
          <Skeleton className="h-14 w-24 rounded-xl" />
        </div>
      </section>

      <section>
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-2 w-full rounded-full" />
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-11 rounded-xl" />
          <Skeleton className="h-11 rounded-xl" />
        </div>
      </section>

      <Skeleton className="h-14 w-full rounded-xl" />
    </div>
  );
}
