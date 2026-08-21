import type {
  ActividadReporteFilters,
  ActividadReporteResponse,
} from "../types/ActividadReporte";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function readError(response: Response) {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") return body.message;
  } catch {
    // La respuesta puede venir vacia.
  }
  return `No se pudo cargar el reporte (HTTP ${response.status})`;
}

export async function getActividadReporte({
  page,
  pageSize,
  filters,
  signal,
}: {
  page: number;
  pageSize: number;
  filters: ActividadReporteFilters;
  signal?: AbortSignal;
}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value.trim()) params.set(key, value.trim());
  });

  const token =
    typeof window === "undefined"
      ? null
      : localStorage.getItem("nexoroute.accessToken");
  const response = await fetch(
    `${API_URL}/reportes/actividad?${params.toString()}`,
    {
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<ActividadReporteResponse>;
}
