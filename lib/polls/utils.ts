import { headers } from "next/headers";
import type { PollStatus } from "@/types";

export async function getAppOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getPollSharePath(token: string): string {
  return `/poll/${token}`;
}

export async function getPollShareUrl(token: string): Promise<string> {
  const origin = await getAppOrigin();
  return `${origin}${getPollSharePath(token)}`;
}

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
