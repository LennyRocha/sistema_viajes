import { api } from "../../shared/api/api";
import TipoAutobus from "../types/TipoAutobus";

export const tiposAutobusApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTiposAutobus: builder.query<TipoAutobus[], void>({
      query: () => "/tipos-autobus",
      providesTags: ["TipoAutobus"],
    }),

    getTipoAutobusById: builder.query<TipoAutobus, number>({
      query: (id: number) => `/tipos-autobus/${id}`,
      providesTags: ["TipoAutobus"],
    }),
  }),
});

export const {
  useGetTiposAutobusQuery,
  useGetTipoAutobusByIdQuery,
} = tiposAutobusApi;
