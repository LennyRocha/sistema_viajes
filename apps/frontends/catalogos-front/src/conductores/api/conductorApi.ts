import { api } from "../../shared/api/api";
import Conductor from "../types/Conductor";
import { ConductorSchema } from "../validations/conductorZod";

export const conductorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConductores: builder.query<Conductor[], GetConductoresParams | void>({
      query: (params?: GetConductoresParams) => {
        const { active, ...rest } = params || {};
        return {
          url: "/conductores",
          params: {
            ...rest,
            active,
          },
        };
      },
      providesTags: ["Conductor"],
    }),

    getConductorById: builder.query<Conductor, number>({
      query: (id: number) => `/conductores/${id}`,
      providesTags: ["Conductor"],
    }),

    createConductor: builder.mutation<Conductor, ConductorSchema>({
      query: (body: ConductorSchema) => ({
        url: "/conductores",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conductor"],
    }),

    patchConductor: builder.mutation<
      Conductor,
      Partial<ConductorSchema> & { id: number }
    >({
      query: ({
        id,
        ...body
      }: Partial<ConductorSchema> & { id: number }) => ({
        url: `/conductores/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Conductor"],
    }),

    changeStatusConductor: builder.mutation<void, { id: number }>({
      query: ({ id }: { id: number }) => ({
        url: `/conductores/status/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Conductor"],
    }),

    removeConductor: builder.mutation<void, { id: number }>({
      query: ({ id }: { id: number }) => ({
        url: `/conductores/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Conductor"],
    }),
  }),
});

export const {
  useGetConductoresQuery,
  useGetConductorByIdQuery,
  useCreateConductorMutation,
  usePatchConductorMutation,
  useChangeStatusConductorMutation,
  useRemoveConductorMutation,
} = conductorApi;

interface GetConductoresParams {
  active?: boolean;
  institucion?: number;
}