"use client";

import { authenticatedFetch } from "@nexoroute/commons";

import {
  AutobusResumen,
  ConductorResumen,
  CreateSalidaBody,
  InstitucionResumen,
  SalidaCatalogData,
  SalidaCreada,
  SalidaDetalle,
} from "../types/SalidasApi";
import { ViajeBaseApi } from "../../viajes/types/OperacionesApi";

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
    // Some endpoints can return an empty or non-JSON body.
  }

  return `HTTP ${response.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const token = typeof window !== "undefined" ? localStorage.getItem("nexoroute.accessToken") : null;

  try {
    response = await authenticatedFetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
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

  if (response.status === 204) return undefined as T;
  return response.json();
}

function withParams(path: string, params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

async function loadCatalogPart<T>(
  label: string,
  promise: Promise<T[]>,
): Promise<{ data: T[]; error?: string }> {
  try {
    return { data: await promise };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return { data: [], error: `${label}: ${message}` };
  }
}

export async function getSalidasCatalogData({
  institucionId,
}: {
  institucionId?: number;
} = {}): Promise<SalidaCatalogData> {
  const catalogParams = {
    active: true,
    institucion: institucionId,
  };

  const [viajes, instituciones, autobuses, conductores] = await Promise.all([
    loadCatalogPart(
      "API de viajes base",
      request<ViajeBaseApi[]>("/viajes-base?active=false&status=active&sort=recent"),
    ),
    loadCatalogPart(
      "Instituciones",
      request<InstitucionResumen[]>(withParams("/instituciones", { active: true })),
    ),
    loadCatalogPart(
      "Autobuses",
      request<AutobusResumen[]>(withParams("/autobuses", catalogParams)),
    ),
    loadCatalogPart(
      "Conductores",
      request<ConductorResumen[]>(withParams("/conductores", catalogParams)),
    ),
  ]);

  return {
    viajes: viajes.data,
    instituciones: instituciones.data,
    autobuses: autobuses.data,
    conductores: conductores.data,
    errores: [
      viajes.error,
      instituciones.error,
      autobuses.error,
      conductores.error,
    ].filter(Boolean) as string[],
  };
}

export function createSalida(body: CreateSalidaBody) {
  return request<SalidaCreada>("/salidas", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getSalidas() {
  return request<SalidaDetalle[]>("/salidas");
}

export function getActiveAutobuses(institucionId?: number) {
  return request<AutobusResumen[]>(
    withParams("/autobuses", { active: true, institucion: institucionId }),
  );
}

export function getActiveConductores(institucionId?: number) {
  return request<ConductorResumen[]>(
    withParams("/conductores", { active: true, institucion: institucionId }),
  );
}

export function getSalida(id: number) {
  return request<SalidaDetalle>(`/salidas/${id}`);
}

export function updateSalida(id: number, body: Partial<CreateSalidaBody>) {
  return request<SalidaDetalle>(`/salidas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function cancelSalida(id: number) {
  return request<SalidaDetalle>(`/salidas/${id}/cancelar`, {
    method: "PATCH",
  });
}
