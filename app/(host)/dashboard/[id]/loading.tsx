import { HostShell } from "@/components/host/host-shell";
import { PollDetailSkeleton } from "@/components/polls/poll-detail-skeleton";

export default function PollDetailLoading() {
  return (
    <HostShell backHref="/dashboard" backLabel="Dashboard">
      <PollDetailSkeleton />
    </HostShell>
  );
}
