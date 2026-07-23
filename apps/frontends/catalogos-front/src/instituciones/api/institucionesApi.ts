import { api } from "../../shared/api/api";
import Institucion from "../types/Institucion";

export const institucionesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInstituciones: builder.query<Institucion[], void>({
      query: () => "/instituciones",
      providesTags: ["Institucion"],
    }),

    getInstitucionById: builder.query<Institucion, number>({
      query: (id: number) => `/instituciones/${id}`,
      providesTags: ["Institucion"],
    }),
  }),
});

export const {
  useGetInstitucionesQuery,
  useGetInstitucionByIdQuery,
} = institucionesApi;
