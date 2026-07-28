import { api } from "../../shared/api/api";
import Autobus from "../types/Autobus";
import { AutobusSchema } from "../validations/autobusZod";

export const autobusApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAutobuses: builder.query<
      Autobus[],
      GetAutobusesParams | void
    >({
      query: (params?: GetAutobusesParams) => {
        const { active, ...rest } = params || {};
        return {
          url: "/autobuses",
          params: {
            ...rest,
            active,
          },
        };
      },
      providesTags: ["Autobus"],
    }),

    getAutobusById: builder.query<Autobus, number>({
      query: (id: number) => `/autobuses/${id}`,
      providesTags: ["Autobus"],
    }),

    getAutobusByCodigoInterno: builder.query<
      Autobus,
      string
    >({
      query: (codigoInterno: string) =>
        `/autobuses/codigo/${codigoInterno}`,
      providesTags: ["Autobus"],
    }),

    getAutobusByAlias: builder.query<Autobus, string>({
      query: (alias: string) => `/autobuses/alias/${alias}`,
      providesTags: ["Autobus"],
    }),

    createAutobus: builder.mutation<Autobus, AutobusSchema>(
      {
        query: (body: AutobusSchema) => ({
          url: "/autobuses",
          method: "POST",
          body,
        }),
        invalidatesTags: [
          "Autobus",
          "Institucion",
          "Disponibilidad",
        ],
      },
    ),

    patchAutobus: builder.mutation<
      Autobus,
      Partial<AutobusSchema> & { id: number }
    >({
      query: ({
        id,
        ...body
      }: Partial<AutobusSchema> & { id: number }) => ({
        url: `/autobuses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [
        "Autobus",
        "Institucion",
        "Disponibilidad",
      ],
    }),

    changeStatusAutobus: builder.mutation<
      void,
      { id: number }
    >({
      query: ({ id }: { id: number }) => ({
        url: `/autobuses/status/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Autobus",
        "Institucion",
        "Disponibilidad",
      ],
    }),
  }),
});

export const {
  useGetAutobusesQuery,
  useGetAutobusByIdQuery,
  useGetAutobusByCodigoInternoQuery,
  useGetAutobusByAliasQuery,
  useCreateAutobusMutation,
  usePatchAutobusMutation,
  useChangeStatusAutobusMutation,
} = autobusApi;

interface GetAutobusesParams {
  active?: boolean;
  tipo_bus?: number;
  institucion?: number;
}
