const NICKNAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} _-]*[\p{L}\p{N}]$|^[\p{L}\p{N}]$/u;

export function validateNickname(raw: string): {
  valid: true;
  nickname: string;
} | {
  valid: false;
  error: string;
} {
  const nickname = raw.trim();

  if (!nickname) {
    return { valid: false, error: "El nickname es obligatorio." };
  }

  if (nickname.length < 2) {
    return { valid: false, error: "El nickname debe tener al menos 2 caracteres." };
  }

  if (nickname.length > 30) {
    return { valid: false, error: "El nickname no puede superar los 30 caracteres." };
  }

  if (!NICKNAME_PATTERN.test(nickname)) {
    return {
      valid: false,
      error:
        "Usá solo letras, números, espacios, guiones o guiones bajos. No puede empezar o terminar con espacios.",
    };
  }

  return { valid: true, nickname };
}
