export type CreatePollInput = {
  title: string;
  description?: string;
  maxParticipants: number;
  timeLimitMinutes?: number | null;
  options: string[];
};

export type FieldErrors = Partial<
  Record<"title" | "description" | "maxParticipants" | "timeLimitMinutes" | "options", string>
>;

export type ValidationResult =
  | { valid: true; data: CreatePollInput }
  | { valid: false; error: string; fieldErrors?: FieldErrors };

export function validateCreatePollInput(raw: {
  title: string;
  description?: string;
  maxParticipants: number | string;
  timeLimitMinutes?: number | string | null;
  options: string[];
}): ValidationResult {
  const fieldErrors: FieldErrors = {};

  const title = raw.title.trim();
  if (!title) {
    fieldErrors.title = "El título es obligatorio.";
  } else if (title.length < 3) {
    fieldErrors.title = "El título debe tener al menos 3 caracteres.";
  } else if (title.length > 100) {
    fieldErrors.title = "El título no puede superar los 100 caracteres.";
  }

  const description = raw.description?.trim() ?? "";
  if (description.length > 500) {
    fieldErrors.description = "La descripción no puede superar los 500 caracteres.";
  }

  const maxParticipants =
    typeof raw.maxParticipants === "string"
      ? parseInt(raw.maxParticipants, 10)
      : raw.maxParticipants;

  if (Number.isNaN(maxParticipants)) {
    fieldErrors.maxParticipants = "Ingresá un número válido de participantes.";
  } else if (maxParticipants < 2) {
    fieldErrors.maxParticipants = "El mínimo es 2 participantes.";
  } else if (maxParticipants > 100) {
    fieldErrors.maxParticipants = "El máximo es 100 participantes.";
  }

  let timeLimitMinutes: number | null = null;
  const rawTime = raw.timeLimitMinutes;
  if (rawTime !== undefined && rawTime !== null && rawTime !== "") {
    timeLimitMinutes =
      typeof rawTime === "string" ? parseInt(rawTime, 10) : rawTime;

    if (Number.isNaN(timeLimitMinutes)) {
      fieldErrors.timeLimitMinutes = "Ingresá un tiempo válido en minutos.";
    } else if (timeLimitMinutes < 5) {
      fieldErrors.timeLimitMinutes = "El tiempo mínimo es 5 minutos.";
    } else if (timeLimitMinutes > 1440) {
      fieldErrors.timeLimitMinutes = "El tiempo máximo es 1440 minutos (24 h).";
    }
  }

  const options = raw.options.map((o) => o.trim()).filter(Boolean);

  if (options.length < 2) {
    fieldErrors.options = "Agregá al menos 2 opciones.";
  } else if (options.length > 20) {
    fieldErrors.options = "Podés agregar hasta 20 opciones.";
  } else {
    const invalidOption = options.find((o) => o.length > 200);
    if (invalidOption) {
      fieldErrors.options = "Cada opción puede tener hasta 200 caracteres.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      valid: false,
      error: "Revisá los campos marcados.",
      fieldErrors,
    };
  }

  return {
    valid: true,
    data: {
      title,
      description: description || undefined,
      maxParticipants,
      timeLimitMinutes,
      options,
    },
  };
}
