import { HostShell } from "@/components/host/host-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function NuevaEncuestaLoading() {
  return (
    <HostShell backHref="/dashboard" backLabel="Dashboard">
      <header>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-3 h-8 w-48" />
        <Skeleton className="mt-4 h-0.5 w-8 rounded-full" />
        <Skeleton className="mt-4 h-4 w-full max-w-sm" />
      </header>

      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <div>
            <Skeleton className="mb-2 h-4 w-12" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </HostShell>
  );
}
