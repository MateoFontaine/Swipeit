"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPoll } from "@/lib/polls/actions";
import type { FieldErrors } from "@/lib/polls/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 20;

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

    const result = await createPoll({
      title,
      description: description || undefined,
      maxParticipants: parseInt(maxParticipants, 10),
      timeLimitMinutes: timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : null,
      options,
    });

    if (!result.success) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      setLoading(false);
      return;
    }

    router.push(`/dashboard/${result.pollId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <Label htmlFor="title">Título</Label>
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
          <p id="title-error" role="alert" className="mt-2 text-sm text-red-600">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">
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
          <p role="alert" className="mt-2 text-sm text-red-600">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="max-participants">Máx. participantes</Label>
          <Input
            id="max-participants"
            name="max-participants"
            type="number"
            min={2}
            max={100}
            inputMode="numeric"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            required
          />
          {fieldErrors.maxParticipants && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {fieldErrors.maxParticipants}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="time-limit">
            Tiempo límite{" "}
            <span className="font-normal text-muted-foreground">(min)</span>
          </Label>
          <Input
            id="time-limit"
            name="time-limit"
            type="number"
            min={5}
            max={1440}
            inputMode="numeric"
            placeholder="Sin límite"
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(e.target.value)}
          />
          {fieldErrors.timeLimitMinutes && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {fieldErrors.timeLimitMinutes}
            </p>
          )}
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium text-foreground">
          Opciones
        </legend>
        <p className="-mt-1 text-xs text-muted-foreground">
          Mínimo 2, máximo 20. Los participantes van a swipear cada una.
        </p>

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
                "inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border text-lg transition-all",
                "hover:bg-muted active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-40"
              )}
              aria-label={`Quitar opción ${index + 1}`}
            >
              ×
            </button>
          </div>
        ))}

        {fieldErrors.options && (
          <p role="alert" className="text-sm text-red-600">
            {fieldErrors.options}
          </p>
        )}

        <button
          type="button"
          onClick={addOption}
          disabled={options.length >= MAX_OPTIONS}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-2xl border border-dashed border-border text-sm font-semibold text-muted-foreground transition-all",
            "hover:border-accent hover:text-accent active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          + Agregar opción
        </button>
      </fieldset>

      {error && !Object.keys(fieldErrors).length && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <SubmitButton loading={loading}>Crear encuesta</SubmitButton>
    </form>
  );
}
