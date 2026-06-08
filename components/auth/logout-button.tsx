"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-2xl border border-border px-6 text-sm font-semibold text-muted-foreground transition-all",
        "hover:bg-muted hover:text-foreground active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
