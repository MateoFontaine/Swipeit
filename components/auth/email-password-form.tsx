"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth/errors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

type EmailPasswordFormProps = {
  mode: "login" | "register";
  redirectTo?: string;
};

function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

export function EmailPasswordForm({ mode, redirectTo }: EmailPasswordFormProps) {
  const router = useRouter();
  const afterAuthPath = safeRedirectPath(redirectTo);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const trimmedEmail = email.trim();

    if (mode === "register" && password !== confirmPassword) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    const supabase = createClient();

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setStatus("error");
        setMessage(translateAuthError(error.message));
        return;
      }

      if (data.session) {
        router.push(afterAuthPath);
        router.refresh();
        return;
      }

      setStatus("sent");
      setMessage(
        "Cuenta creada. Revisá tu correo para confirmar y después iniciá sesión."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(translateAuthError(error.message));
      return;
    }

    router.push(afterAuthPath);
    router.refresh();
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-violet-200/50 bg-violet-500/[0.04] px-5 py-6 text-center"
      >
        <p className="font-semibold tracking-tight text-foreground">
          Revisá tu correo
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          required
          minLength={6}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {mode === "register" && (
        <div>
          <Label
            htmlFor="confirm-password"
            className="text-sm font-medium text-foreground/80"
          >
            Confirmar contraseña
          </Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      )}

      {status === "error" && message && (
        <p
          role="alert"
          className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700"
        >
          {message}
        </p>
      )}

      <SubmitButton loading={status === "loading"} className="mt-1 shadow-violet-500/20">
        {mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
      </SubmitButton>
    </form>
  );
}
