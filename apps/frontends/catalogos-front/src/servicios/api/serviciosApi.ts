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

    createServicio: builder.mutation({
      query: (body: Omit<ServicioExterno, "id">) => ({
        url: "/servicios",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Servicio"],
    }),
  }),
});

export const {
  useGetServiciosQuery,
  useGetServicioByIdQuery,
  useCreateServicioMutation,
} = serviciosApi;
