import { api } from "../../shared/api/api";
import DisponibilidadServicio from "../../servicios/types/ServicioTipoInstitucion";
import {
  DisponibilidadPorInstitucion,
  DisponibilidadPorTipo,
  DisponibilidadPorServicio,
} from "../types/disponibilidad-responses";
import { DisponibilidadServicioInput } from "../types/disponibilidad-input";
import { DisponibilidadServicioResponse } from "../types/disponibilidad-and";

type DisponibilidadServicioIdentifier =
  DisponibilidadPorServicio & {
    ids: DisponibilidadServicioResponse[];
  };

type DisponibilidadInstitucionIdentifier =
  DisponibilidadPorInstitucion & {
    ids: DisponibilidadServicioResponse[];
  };

type DisponibilidadTipoIdentifier =
  DisponibilidadPorTipo & {
    ids: DisponibilidadServicioResponse[];
  };

type GetParams = {
  id: number;
  showActiveOnly?: boolean;
};

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
      DisponibilidadInstitucionIdentifier[],
      GetParams
    >({
      query: ({
        id: idInstitucion,
        showActiveOnly = true,
      }) =>
        `/disponibilidad-servicios/institucion/${idInstitucion}?showActiveOnly=${showActiveOnly}`,
      providesTags: ["Disponibilidad"],
    }),

    getDisponibilidadServiciosByServicio: builder.query<
      DisponibilidadServicioIdentifier[],
      GetParams
    >({
      query: ({ id: idServicio, showActiveOnly = true }) =>
        `/disponibilidad-servicios/servicio/${idServicio}?showActiveOnly=${showActiveOnly}`,
      providesTags: ["Disponibilidad"],
    }),

    getDisponibilidadServiciosByTipo: builder.query<
      DisponibilidadTipoIdentifier[],
      GetParams
    >({
      query: ({ id: idTipo, showActiveOnly = true }) =>
        `/disponibilidad-servicios/autobus/${idTipo}?showActiveOnly=${showActiveOnly}`,
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

    changeStatusDisponibilidad: builder.mutation<
      void,
      number
    >({
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
  useChangeStatusDisponibilidadMutation,
} = disponibilidadApi;
