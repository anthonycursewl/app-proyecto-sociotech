import { ApiError, SessionExpiredError } from "@/shared/http/http.client";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Los datos enviados no son válidos.",
  401: "Tu sesión expiró. Inicia sesión de nuevo.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No se encontró el recurso solicitado.",
  409: "Conflicto con datos existentes.",
  422: "Revisa los campos del formulario.",
  500: "Error del servidor. Intenta más tarde.",
};

export function isSessionExpired(error: unknown): boolean {
  return error instanceof SessionExpiredError;
}

export function getApiErrorMessage(error: unknown): string | null {
  if (error instanceof SessionExpiredError) {
    return null;
  }

  if (error instanceof ApiError) {
    if (error.message && error.message !== `API Error: ${error.status}`) {
      return error.message;
    }
    return STATUS_MESSAGES[error.status] ?? `Error del servidor (${error.status}).`;
  }

  if (error instanceof Error) {
    if (error.message.includes("timed out")) {
      return "La solicitud tardó demasiado. Revisa tu conexión.";
    }
    return error.message || "Ocurrió un error inesperado.";
  }

  return "Ocurrió un error inesperado.";
}
