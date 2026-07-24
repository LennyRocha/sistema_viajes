import { api } from "../../shared/api/api";
import ServicioExterno from "../types/ServicioExterno";

export const serviciosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServicios: builder.query<
      ServicioExterno[],
      GetServiciosParams | void
    >({
      query: (params?: GetServiciosParams) => {
        const { active, ...rest } = params || {};
        return {
          url: "/servicios",
          params: {
            ...rest,
            active,
          },
        };
      },
      providesTags: ["Servicio"],
    }),

    getServicioById: builder.query<ServicioExterno, number>(
      {
        query: (id: number) => `/servicios/${id}`,
        providesTags: ["Servicio"],
      },
    ),

    getServicioByName: builder.query<
      ServicioExterno,
      string
    >({
      query: (nombre: string) =>
        `/servicios/nombre/${nombre}`,
      providesTags: ["Servicio"],
    }),

    createServicio: builder.mutation<
      ServicioExterno,
      Omit<ServicioExterno, "id">
    >({
      query: (body: Omit<ServicioExterno, "id">) => ({
        url: "/servicios",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Servicio"],
    }),

    patchServicio: builder.mutation<
      ServicioExterno,
      PatchServicioArgs
    >({
      query: ({ id, ...body }: PatchServicioArgs) => ({
        url: `/servicios/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Servicio"],
    }),

    changeStatusServicio: builder.mutation<
      void,
      { id: number }
    >({
      query: ({ id }: { id: number }) => ({
        url: `/servicios/status/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Servicio"],
    }),
  }),
});

export type PatchServicioArgs = { id: number } & Partial<
  Omit<ServicioExterno, "id">
>;

export const {
  useGetServiciosQuery,
  useGetServicioByIdQuery,
  useGetServicioByNameQuery,
  useCreateServicioMutation,
  usePatchServicioMutation,
  useChangeStatusServicioMutation,
} = serviciosApi;

interface GetServiciosParams {
  active?: boolean;
}
