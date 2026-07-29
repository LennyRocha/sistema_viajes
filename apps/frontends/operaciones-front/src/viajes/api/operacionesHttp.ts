"use client";

import React from "react";
import {
  CreateRutaBody,
  CreateViajeBaseBody,
  RutaApi,
  ViajeBaseApi,
} from "../types/OperacionesApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") return body.message;
    if (Array.isArray(body?.message)) return body.message.join(", ");
    if (Array.isArray(body?.errors)) return body.errors.join(", ");
    if (body?.errors && typeof body.errors === "object") {
      return Object.values(body.errors).flat().join(", ");
    }
  } catch {
    // La respuesta puede venir vacia o sin JSON.
  }

  return `HTTP ${response.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new Error(
      `No se pudo conectar con el gateway (${API_URL}). Revisa que este corriendo en el puerto 5000.`,
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

async function checkBackendStatus() {
  try {
    const gateway = await fetch(API_URL);
    if (!gateway.ok) {
      return `El gateway responde pero regreso HTTP ${gateway.status}.`;
    }
  } catch {
    return `Gateway apagado o inaccesible en ${API_URL}. Levanta backend/dev-cli y selecciona gateway.`;
  }

  try {
    const operaciones = await fetch(`${API_URL}/operaciones/health`);
    if (!operaciones.ok) {
      return `Gateway activo, pero operaciones-service no responde bien: HTTP ${operaciones.status}.`;
    }
  } catch {
    return "Gateway activo, pero operaciones-service no responde. Levanta operaciones-service en el CLI del backend.";
  }

  return "Gateway y operaciones-service responden, pero fallo la carga de rutas/viajes. Revisa logs del backend.";
}

export function useOperacionesData() {
  const [rutas, setRutas] = React.useState<RutaApi[]>([]);
  const [viajes, setViajes] = React.useState<ViajeBaseApi[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const reload = React.useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");
    try {
      const [rutasResponse, viajesResponse] = await Promise.all([
        request<RutaApi[]>("/rutas?active=false"),
        request<ViajeBaseApi[]>("/viajes-base?active=false"),
      ]);
      setRutas(rutasResponse);
      setViajes(viajesResponse);
    } catch (error) {
      setIsError(true);
      if (error instanceof ApiRequestError && error.status && error.status >= 500) {
        setErrorMessage(await checkBackendStatus());
      } else {
        setErrorMessage(
          error instanceof Error ? error.message : await checkBackendStatus(),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { rutas, viajes, isLoading, isError, errorMessage, reload };
}

export function createRuta(body: CreateRutaBody) {
  return request<RutaApi>("/rutas", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function createViajeBase(body: CreateViajeBaseBody) {
  return request<ViajeBaseApi>("/viajes-base", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
