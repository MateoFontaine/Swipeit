"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getStoredParticipantId,
  storeParticipantId,
} from "@/lib/polls/participant-storage";
import { createClient } from "@/lib/supabase/client";

type LinkAccountBannerProps = {
  pollId: string;
  shareToken: string;
  isLoggedIn: boolean;
  hasAccountParticipant: boolean;
};

export function LinkAccountBanner({
  pollId,
  shareToken,
  isLoggedIn,
  hasAccountParticipant,
}: LinkAccountBannerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "linking" | "linked" | "error" | "hidden"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasAccountParticipant) {
      setStatus("hidden");
      return;
    }

    const storedId = getStoredParticipantId(pollId);
    if (!storedId) {
      setStatus("hidden");
      return;
    }

    if (!isLoggedIn) {
      setStatus("idle");
      return;
    }

    async function linkAccount() {
      setStatus("linking");

      try {
        const response = await fetch("/api/polls/link-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ participantId: storedId, pollId }),
        });
        const data = await response.json();

        if (!data.success) {
          setStatus("error");
          setMessage(data.error ?? "No pudimos vincular tu cuenta.");
          return;
        }

        storeParticipantId(pollId, data.participantId);
        setStatus("linked");
        setMessage(
          data.linked
            ? "Cuenta vinculada. Tu historial quedó guardado."
            : (data.message ?? "Tu cuenta ya estaba vinculada a esta encuesta.")
        );
        router.refresh();
      } catch {
        setStatus("error");
        setMessage("No pudimos vincular tu cuenta. Intentá de nuevo.");
      }
    }

    linkAccount();
  }, [hasAccountParticipant, isLoggedIn, pollId, router]);

  if (status === "hidden") {
    return null;
  }

  if (status === "linked") {
    return (
      <div
        role="status"
        className="mb-6 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800"
      >
        {message}
      </div>
    );
  }

  if (status === "linking") {
    return (
      <div className="mb-6" aria-busy="true" aria-label="Vinculando cuenta…">
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        className="mb-6 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700"
      >
        {message}
      </div>
    );
  }

  const loginHref = `/login?redirect=${encodeURIComponent(`/poll/${shareToken}`)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(`/poll/${shareToken}`)}`;

  return (
    <div className="mb-6 rounded-xl border border-violet-200/60 bg-violet-500/[0.04] px-4 py-4 sm:px-5">
      <p className="text-sm font-semibold tracking-tight">
        ¿Querés guardar tu historial?
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Iniciá sesión para ver esta encuesta en tu dashboard.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Link
          href={loginHref}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          Iniciar sesión
        </Link>
        <Link
          href={registerHref}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border/80 px-4 text-sm font-semibold text-foreground transition-colors hover:border-violet-300/70 hover:text-violet-600"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}

export function LinkAccountChecker({
  pollId,
  shareToken,
}: {
  pollId: string;
  shareToken: string;
}) {
  const [state, setState] = useState<{
    isLoggedIn: boolean;
    hasAccountParticipant: boolean;
    ready: boolean;
  }>({ isLoggedIn: false, hasAccountParticipant: false, ready: false });

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({ isLoggedIn: false, hasAccountParticipant: false, ready: true });
        return;
      }

      const { data: participant } = await supabase
        .from("participants")
        .select("id")
        .eq("poll_id", pollId)
        .eq("user_id", user.id)
        .maybeSingle();

      setState({
        isLoggedIn: true,
        hasAccountParticipant: Boolean(participant),
        ready: true,
      });
    }

    checkAuth();
  }, [pollId]);

  if (!state.ready) {
    return null;
  }

  return (
    <LinkAccountBanner
      pollId={pollId}
      shareToken={shareToken}
      isLoggedIn={state.isLoggedIn}
      hasAccountParticipant={state.hasAccountParticipant}
    />
  );
}
