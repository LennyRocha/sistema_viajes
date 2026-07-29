import { api } from "../../shared/api/api";
import Institucion from "../types/Institucion";
import { InstitucionSchema } from "../validations/institucionZod";

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

    getInstitucionByName: builder.query<
      Institucion,
      string
    >({
      query: (nombre: string) =>
        `/instituciones/nombre/${nombre}`,
      providesTags: ["Institucion"],
    }),

    createInstitucion: builder.mutation<
      Institucion,
      InstitucionSchema
    >({
      query: (body) => ({
        url: "/instituciones",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Institucion",
        "Autobus",
        "Disponibilidad",
      ],
    }),

    patchInstitucion: builder.mutation<
      Institucion,
      PatchInstitucionArgs
    >({
      query: ({ id, ...body }: PatchInstitucionArgs) => ({
        url: `/instituciones/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [
        "Institucion",
        "Autobus",
        "Disponibilidad",
      ],
    }),

    changeStatusInstitucion: builder.mutation<
      Institucion,
      { id: number }
    >({
      query: ({ id }) => ({
        url: `/instituciones/status/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Institucion",
        "Autobus",
        "Disponibilidad",
      ],
    }),
  }),
});

export type PatchInstitucionArgs = {
  id: number;
} & InstitucionSchema;

export const {
  useGetInstitucionesQuery,
  useGetInstitucionByIdQuery,
  useGetInstitucionByNameQuery,
  useCreateInstitucionMutation,
  usePatchInstitucionMutation,
  useChangeStatusInstitucionMutation,
} = institucionesApi;

interface GetInstitucionesParams {
  active?: boolean;
}
