import { api } from "../../shared/api/api";
import Institucion from "../types/Institucion";

export const institucionesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getInstituciones: builder.query<
      Institucion[],
      GetInstitucionesParams | void
    >({
      query: (params?: GetInstitucionesParams) => {
        const { active, ...rest } = params || {};
        return {
          url: "/instituciones",
          params: {
            ...rest,
            active,
          },
        };
      },
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

interface GetInstitucionesParams {
  active?: boolean;
}
