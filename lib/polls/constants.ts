import type { PollStatus } from "@/types";

export const POLL_STATUS_LABELS: Record<PollStatus, string> = {
  esperando: "Esperando",
  votando: "Votando",
  ballotage: "Ballotage",
  resultados: "Resultados",
  cerrado: "Cerrado",
};

export function formatPollDate(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
