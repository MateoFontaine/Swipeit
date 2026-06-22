import { HostShell } from "@/components/host/host-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <HostShell>
      <header>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-8 w-40" />
        <Skeleton className="mt-4 h-0.5 w-8 rounded-full" />
        <Skeleton className="mt-4 h-4 w-48" />
      </header>

      <Skeleton className="mt-8 h-14 w-full rounded-xl" />

      <div className="mt-10 flex flex-col gap-12">
        <section>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-6 w-36" />
          <Skeleton className="mt-3 h-0.5 w-6 rounded-full" />
          <div className="mt-5 flex flex-col gap-2.5">
            <Skeleton className="h-[4.5rem] rounded-xl" />
            <Skeleton className="h-[4.5rem] rounded-xl" />
          </div>
        </section>
      </div>
    </HostShell>
  );
}
