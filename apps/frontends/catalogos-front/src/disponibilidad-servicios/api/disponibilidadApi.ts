import { api } from "../../shared/api/api";
import DisponibilidadServicio from "../../servicios/types/ServicioTipoInstitucion";
import {
  DisponibilidadPorInstitucion,
  DisponibilidadPorTipo,
  DisponibilidadPorServicio,
} from "../types/disponibilidad-responses";
import { DisponibilidadServicioInput } from "../types/disponibilidad-input";

export const disponibilidadApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDisponibilidadServicios: builder.query<
      DisponibilidadServicio[],
      void
    >({
      query: () => "/disponibilidad-servicios",
      providesTags: ["Disponibilidad"],
    }),

    getDisponibilidadServicioById: builder.query<
      DisponibilidadServicio,
      number
    >({
      query: (id: number) =>
        `/disponibilidad-servicios/${id}`,
      providesTags: ["Disponibilidad"],
    }),

    getDisponibilidadServiciosByInstitucion: builder.query<
      DisponibilidadPorInstitucion[],
      number
    >({
      query: (idInstitucion: number) =>
        `/disponibilidad-servicios/institucion/${idInstitucion}`,
      providesTags: ["Disponibilidad"],
    }),

    getDisponibilidadServiciosByServicio: builder.query<
      DisponibilidadPorServicio[],
      number
    >({
      query: (idServicio: number) =>
        `/disponibilidad-servicios/servicio/${idServicio}`,
      providesTags: ["Disponibilidad"],
    }),

    getDisponibilidadServiciosByTipo: builder.query<
      DisponibilidadPorTipo[],
      number
    >({
      query: (idTipo: number) =>
        `/disponibilidad-servicios/autobus/${idTipo}`,
      providesTags: ["Disponibilidad"],
    }),

    setDisponibilidadServicio: builder.mutation<
      DisponibilidadServicio,
      DisponibilidadServicioInput
    >({
      query: (body) => ({
        url: "/disponibilidad-servicios",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        "Disponibilidad",
        "Servicio",
        "Institucion",
        "TipoAutobus",
      ],
    }),

    changeStatusServicio: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/disponibilidad-servicios/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Disponibilidad",
        "Servicio",
        "Institucion",
        "TipoAutobus",
      ],
    }),
  }),
});

export const {
  useGetDisponibilidadServiciosQuery,
  useGetDisponibilidadServicioByIdQuery,
  useGetDisponibilidadServiciosByInstitucionQuery,
  useGetDisponibilidadServiciosByServicioQuery,
  useGetDisponibilidadServiciosByTipoQuery,
  useSetDisponibilidadServicioMutation,
  useChangeStatusServicioMutation,
} = disponibilidadApi;
