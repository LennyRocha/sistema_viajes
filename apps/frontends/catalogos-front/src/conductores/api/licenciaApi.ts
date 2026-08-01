// api/licenciaApi.ts
import { api } from "../../shared/api/api";
import Licencia from "../types/Licencia";
import { LicenciaSchema } from "../validations/licenciaZod";

interface GetLicenciasParams {
  vigente?: boolean;
  conductor?: number;
}

export const licenciaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLicencias: builder.query<Licencia[], GetLicenciasParams | void>({
      query: (params?: GetLicenciasParams) => ({
        url: "/licencias",
        params: { ...params },
      }),
      providesTags: ["Licencia"],
    }),

    getLicenciaById: builder.query<Licencia, number>({
      query: (id: number) => `/licencias/${id}`,
      providesTags: ["Licencia"],
    }),

    getLicenciaVigenteByConductor: builder.query<Licencia, number>({
      query: (conductorId: number) =>
        `/licencias/conductor/${conductorId}/vigente`,
      providesTags: ["Licencia"],
    }),

    createLicencia: builder.mutation<Licencia, LicenciaSchema>({
      query: (body: LicenciaSchema) => ({
        url: "/licencias",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Licencia", "Conductor"],
    }),

    patchLicencia: builder.mutation<
      Licencia,
      Partial<LicenciaSchema> & { id: number }
    >({
      query: ({ id, ...body }: Partial<LicenciaSchema> & { id: number }) => ({
        url: `/licencias/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Licencia", "Conductor"],
    }),

    changeStatusLicencia: builder.mutation<void, { id: number }>({
      query: ({ id }: { id: number }) => ({
        url: `/licencias/status/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Licencia", "Conductor"],
    }),

    removeLicencia: builder.mutation<void, { id: number }>({
      query: ({ id }: { id: number }) => ({
        url: `/licencias/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Licencia", "Conductor"],
    }),
  }),
});

export const {
  useGetLicenciasQuery,
  useGetLicenciaByIdQuery,
  useGetLicenciaVigenteByConductorQuery,
  useCreateLicenciaMutation,
  usePatchLicenciaMutation,
  useChangeStatusLicenciaMutation,
  useRemoveLicenciaMutation,
} = licenciaApi;