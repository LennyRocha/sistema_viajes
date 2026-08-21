"use client";

import { authenticatedFetch } from "@nexoroute/commons";

import {
  CalendarioMesFilters,
  CalendarioMesResponse,
} from "../types/CalendarioApi";

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
  } catch {
    // Empty or non-JSON error responses still get a useful HTTP fallback.
  }

  return `HTTP ${response.status}`;
}

async function request<T>(path: string): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("nexoroute.accessToken")
      : null;

  let response: Response;
  try {
    response = await authenticatedFetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }, API_URL);
  } catch {
    throw new Error(
      `No se pudo conectar con el gateway (${API_URL}). Revisa que este corriendo en el puerto 5000.`,
    );
  }

  if (!response.ok) {
    throw new ApiRequestError(await readErrorMessage(response), response.status);
  }

  return response.json();
}

export function getCalendarioMes({
  year,
  month,
  filters = {},
}: {
  year: number;
  month: number;
  filters?: CalendarioMesFilters;
}) {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  if (filters.estadoSalida && filters.estadoSalida !== "TODOS") {
    params.set("estadoSalida", filters.estadoSalida);
  }
  if (filters.viajeBaseId) params.set("viajeBaseId", String(filters.viajeBaseId));
  if (filters.conductorId) params.set("conductorId", String(filters.conductorId));
  if (filters.autobusId) params.set("autobusId", String(filters.autobusId));

  return request<CalendarioMesResponse>(
    `/calendario-viajes/mes?${params.toString()}`,
  );
}
