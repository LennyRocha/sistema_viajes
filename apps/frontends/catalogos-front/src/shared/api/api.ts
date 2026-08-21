import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { env } from "../../../config/env";
import { authenticatedFetch } from "@nexoroute/commons";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: env.api_url,
    fetchFn: (input, init) => authenticatedFetch(input, init, env.api_url),
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("nexoroute.accessToken");
        if (token) headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
    timeout: 10000, // 10 segundos, pero serán 30 en producción
  }),
  endpoints: () => ({}),
  tagTypes: [
    "Autobus",
    "Servicio",
    "TipoAutobus",
    "Institucion",
    "Conductor",
    "Licencia",
    "Disponibilidad",
  ],
});
