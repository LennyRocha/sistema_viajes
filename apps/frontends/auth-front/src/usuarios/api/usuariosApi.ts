import Usuario from "../types/Usuario";
import { authenticatedFetch } from "@nexoroute/commons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class UsuariosApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "UsuariosApiError";
  }
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") return body.message;
    if (Array.isArray(body?.message)) return body.message.join(", ");
  } catch {
    // La respuesta puede venir vacia o sin JSON.
  }

  return `No se pudo completar la solicitud (HTTP ${response.status})`;
}

function getAccessToken() {
  return typeof window === "undefined"
    ? null
    : localStorage.getItem("nexoroute.accessToken");
}

async function request(path: string, init?: RequestInit) {
  const token = getAccessToken();
  if (!token) {
    throw new UsuariosApiError("La sesion no tiene un Bearer token", 401);
  }

  let response: Response;
  try {
    response = await authenticatedFetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
    }, API_URL);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new UsuariosApiError(
      `No se pudo conectar con el gateway (${API_URL})`,
    );
  }

  if (!response.ok) {
    throw new UsuariosApiError(
      await readErrorMessage(response),
      response.status,
    );
  }

  return response;
}

export async function getUsuarios(signal?: AbortSignal): Promise<Usuario[]> {
  const response = await request("/usuarios?active=false", { signal });
  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new UsuariosApiError("El servicio devolvio una lista de usuarios invalida");
  }

  return body.map((usuario) => {
    const item = usuario as Usuario;
    return {
      ...item,
      roles: Array.isArray(item.roles) ? item.roles : [],
    };
  });
}

export async function toggleUsuarioStatus(id: number) {
  await request(`/usuarios/status/${id}`, { method: "DELETE" });
}
