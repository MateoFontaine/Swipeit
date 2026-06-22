"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CreatePollResult } from "@/lib/polls/mutations";
import type { FieldErrors } from "@/lib/polls/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 20;

const labelClass = "text-sm font-medium text-foreground/80";

function FieldError({ id, message }: { id?: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 rounded-lg border border-red-200/80 bg-red-50/80 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </p>
  );
}

export function CreatePollForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("20");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          maxParticipants: parseInt(maxParticipants, 10),
          timeLimitMinutes: timeLimitMinutes
            ? parseInt(timeLimitMinutes, 10)
            : null,
          options,
        }),
      });

      const result = (await response.json()) as CreatePollResult;

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        setLoading(false);
        return;
      }

      router.push(`/dashboard/${result.pollId}`);
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div>
          <Label htmlFor="title" className={labelClass}>
            Título
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="¿Qué decidimos hoy?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
            aria-invalid={!!fieldErrors.title}
            aria-describedby={fieldErrors.title ? "title-error" : undefined}
          />
          {fieldErrors.title && (
            <FieldError id="title-error" message={fieldErrors.title} />
          )}
        </div>

        <div>
          <Label htmlFor="description" className={labelClass}>
            Descripción{" "}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Contexto para los participantes…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          {fieldErrors.description && (
            <FieldError message={fieldErrors.description} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="max-participants" className={labelClass}>
            Máx. participantes
          </Label>
          <Input
            id="max-participants"
            name="maxParticipants"
            type="number"
            min={2}
            max={100}
            inputMode="numeric"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            required
          />
          {fieldErrors.maxParticipants && (
            <FieldError message={fieldErrors.maxParticipants} />
          )}
        </div>

        <div>
          <Label htmlFor="time-limit" className={labelClass}>
            Tiempo límite{" "}
            <span className="font-normal text-muted-foreground">(min)</span>
          </Label>
          <Input
            id="time-limit"
            name="timeLimitMinutes"
            type="number"
            min={5}
            max={1440}
            inputMode="numeric"
            placeholder="Sin límite"
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(e.target.value)}
          />
          {fieldErrors.timeLimitMinutes && (
            <FieldError message={fieldErrors.timeLimitMinutes} />
          )}
        </div>
      </div>

      <fieldset className="flex flex-col gap-4">
        <div>
          <legend className="text-sm font-medium text-violet-600">
            Opciones
          </legend>
          <p className="mt-1 text-sm text-muted-foreground">
            Mínimo 2, máximo 20. Los participantes van a swipear cada una.
          </p>
          <div className="mt-3 h-0.5 w-6 rounded-full bg-violet-500" aria-hidden />
        </div>

        <div className="flex flex-col gap-2.5">
          {options.map((option, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  aria-label={`Opción ${index + 1}`}
                  placeholder={`Opción ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  maxLength={200}
                />
              </div>
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= MIN_OPTIONS}
                className={cn(
                  "inline-flex h-14 w-12 shrink-0 items-center justify-center rounded-xl border border-border/80 text-lg text-muted-foreground transition-colors sm:w-14",
                  "hover:border-violet-300/70 hover:text-violet-600 active:scale-[0.98]",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
                aria-label={`Quitar opción ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {fieldErrors.options && <FieldError message={fieldErrors.options} />}

        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= MAX_OPTIONS}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-xl border border-dashed border-violet-300/60 text-sm font-medium text-violet-600 transition-colors",
            "hover:border-violet-400 hover:bg-violet-500/[0.04] active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          + Agregar opción
        </button>
      </fieldset>

      {error && !Object.keys(fieldErrors).length && (
        <FieldError message={error} />
      )}

      <SubmitButton loading={loading} className="shadow-violet-500/20">
        Crear encuesta
      </SubmitButton>
    </form>
  );
}
