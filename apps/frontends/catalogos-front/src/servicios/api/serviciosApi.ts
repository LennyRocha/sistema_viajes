import { api } from "../../shared/api/api";
import ServicioExterno from "../types/ServicioExterno";

export const serviciosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServicios: builder.query<ServicioExterno[], void>({
      query: () => "/servicios",
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
      query: (nombre: string) => `/servicios/${nombre}`,
      providesTags: ["Servicio"],
    }),

    createServicio: builder.mutation({
      query: (body: Omit<ServicioExterno, "id">) => ({
        url: "/servicios",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Servicio"],
    }),

    patchServicio: builder.mutation({
      query: ({
        id,
        ...body
      }: Partial<ServicioExterno>) => ({
        url: `/servicios/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Servicio"],
    }),

    changeStatusServicio: builder.mutation({
      query: ({
        id,
        ...body
      }: Partial<ServicioExterno>) => ({
        url: `/servicios/${id}/status`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Servicio"],
    }),
  }),
});

export const {
  useGetServiciosQuery,
  useGetServicioByIdQuery,
  useGetServicioByNameQuery,
  useCreateServicioMutation,
  usePatchServicioMutation,
  useChangeStatusServicioMutation,
} = serviciosApi;
