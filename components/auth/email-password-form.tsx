"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth/errors";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

type EmailPasswordFormProps = {
  mode: "login" | "register";
};

export function EmailPasswordForm({ mode }: EmailPasswordFormProps) {
  const router = useRouter();
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
        router.push("/dashboard");
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

    router.push("/dashboard");
    router.refresh();
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-muted/50 p-6 text-center"
      >
        <p className="text-4xl" aria-hidden="true">
          ✉️
        </p>
        <p className="mt-3 font-semibold text-foreground">Revisá tu correo</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
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
        <label htmlFor="password" className="sr-only">
          Contraseña
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          required
          minLength={6}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {mode === "register" && (
        <div>
          <label htmlFor="confirm-password" className="sr-only">
            Confirmar contraseña
          </label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      )}

      {status === "error" && message && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {message}
        </p>
      )}

      <SubmitButton loading={status === "loading"}>
        {mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
      </SubmitButton>
    </form>
  );
}
