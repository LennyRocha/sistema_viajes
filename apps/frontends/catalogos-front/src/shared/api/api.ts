import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { env } from "../../../config/env";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: env.api_url,
    timeout: 10000, // 10 segundos, pero serán 30 en producción
  }),
  endpoints: () => ({}),
  tagTypes: [
    "Autobus",
    "Servicio",
    "TipoAutobus",
    "Institucion",
    "Conductor",
  ],
});
