const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Credenciales inválidas.",
  "Email not confirmed": "Confirmá tu email antes de continuar.",
  "User already registered": "Ya existe una cuenta con ese email.",
  "Signup requires a valid password": "El registro requiere una contraseña válida.",
  "Unable to validate email address: invalid format":
    "El formato del email no es válido.",
  "Email rate limit exceeded":
    "Demasiados intentos. Esperá unos minutos e intentá de nuevo.",
  "For security purposes, you can only request this once every 60 seconds":
    "Por seguridad, solo podés solicitar un link cada 60 segundos.",
};

export function translateAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? "Ocurrió un error. Intentá de nuevo.";
}
