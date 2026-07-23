import {
  Breadcrumb,
  CommonPageProps,
  EmptyState,
  HandleResponseError,
  PaperHeader,
  Simplify,
  Tabla,
} from "@nexoroute/commons";
import { useGetServicioByNameQuery } from "../../servicios/api/serviciosApi";
import { skipToken } from "@reduxjs/toolkit/query";
import React from "react";
import {
  useChangeStatusDisponibilidadMutation,
  useGetDisponibilidadServiciosByServicioQuery,
  useSetDisponibilidadServicioMutation,
} from "../api/disponibilidadApi";
import { useGetTiposAutobusQuery } from "../../tipos_autobus/api/tiposAutobusApi";
import Add from "@mui/icons-material/Add";
import { DisponibilidadPorServicio } from "../types/disponibilidad-responses";
import buildDisponibilidadColumns from "../utils/buildDisponibilidadColumns";
import DialogContentText from "@mui/material/DialogContentText";
import { DisponibilidadServicioResponse } from "../types/disponibilidad-and";
import { useGetInstitucionesQuery } from "../../instituciones/api/institucionesApi";
import onSubmit from "../forms/onNewDisponibilidadSubmit";
import DisponibilidadForm from "../components/DisponibilidadForm";
import DisponibilidadDetails from "../components/DisponibilidadDetails";

interface DisponibilidadIndexProps extends CommonPageProps {
  servicio: string;
}

export default function DisponibilidadIndex({
  servicio,
  openSidebar,
  closeSidebar,
  showDialog = () => {},
  snack,
  pathname,
  router,
  userPrivileges = [],
}: Readonly<DisponibilidadIndexProps>) {
  const nameQuery = useGetServicioByNameQuery(
    servicio ?? skipToken,
  );
  const tiposQuery = useGetTiposAutobusQuery();
  const institucionesQuery = useGetInstitucionesQuery();
  const query =
    useGetDisponibilidadServiciosByServicioQuery(
      nameQuery.data?.id
        ? {
            id: nameQuery.data?.id,
            showActiveOnly: false,
          }
        : skipToken,
    );
  const [mutateStatus, resStatus] =
    useChangeStatusDisponibilidadMutation();
  const [mutateNew, resNew] =
    useSetDisponibilidadServicioMutation();
  const isLoading =
    query.isLoading ||
    nameQuery.isLoading ||
    tiposQuery.isLoading ||
    resStatus.isLoading ||
    resNew.isLoading;
  const columnas = buildDisponibilidadColumns(
    tiposQuery.data ?? [],
  );
  const institucionesNombres = query.data?.map(
    (item) => item.institucion.nombre,
  );
  const doSubmit = async (data, name, institution) => {
    return await onSubmit(data, name, institution, {
      snack,
      mutate: mutateNew,
      closeSidebar,
      refetch: query.refetch,
    });
  };
  const openAddDialog = () => {
    const whiteList =
      institucionesQuery.data?.filter(
        (i) => !institucionesNombres?.includes(i.nombre),
      ) ?? [];
    if (whiteList.length === 0) {
      snack?.info({
        message:
          "No hay instituciones disponibles para agregar",
        duration: 3000,
      });
    } else {
      openSidebar({
        title: "Nueva disponibilidad de servicio",
        children: (
          <DisponibilidadForm
            instituciones={whiteList}
            tipos_bus={tiposQuery.data ?? []}
            servicioNombre={nameQuery.data?.nombre ?? ""}
            servicioId={nameQuery.data?.id}
            onSubmit={doSubmit}
            submitLoading={isLoading}
          />
        ),
      });
    }
  };
  const openDeleteDialog = (
    row: DisponibilidadPorServicio & {
      ids: DisponibilidadServicioResponse[];
    },
  ) => {
    const operacion = row.ids.some((id) => id.activo);
    showDialog({
      title: row.ids.some((id) => id.activo)
        ? "¿Liberar disponibilidad del servicio?"
        : "¿Reestablecer disponibilidad del servicio?",
      content: (
        <DialogContentText>
          {row.ids.some((id) => id.activo)
            ? `¿Desea liberar la disponibilidad del servicio "${nameQuery.data?.nombre}" para la institución "${row.institucion.nombre}" y todos los tipos de autobús?`
            : `¿Desea reestablecer la disponibilidad del servicio "${nameQuery.data?.nombre}" para la institución "${row.institucion.nombre}" y todos los tipos de autobús?`}
        </DialogContentText>
      ),
      showCloseButton: true,
      showCancelButton: true,
      onConfirm: async () => {
        try {
          await Promise.all(
            row.ids
              .filter((id) => id.activo === operacion)
              .map((id) => mutateStatus(id.id).unwrap()),
          );
          snack?.success({
            message: row.ids.some((id) => id.activo)
              ? "Disponibilidad liberada correctamente"
              : "Disponibilidad reestablecida correctamente",
            duration: 3000,
          });
          query.refetch();
        } catch (error) {
          snack?.error({
            message:
              error?.data?.message ||
              error.message ||
              "Error al liberar la disponibilidad del servicio",
            duration: 3000,
          });
        }
      },
      onClose: () => {},
      isLoading: isLoading,
    });
  };
  if (query.error || nameQuery.error || tiposQuery.error) {
    console.error("Error fetching data:", {
      queryError: query.error,
      nameQueryError: nameQuery.error,
      tiposQueryError: tiposQuery.error,
    });
    return (
      <HandleResponseError
        error={
          (query.error as any) || (nameQuery.error as any)
        }
        router={router as any}
        path={pathname}
        onRetry={query.refetch}
      />
    );
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          {
            nombre: "Servicios",
            href: "/dashboard/services",
            disabled: isLoading,
          },
          {
            nombre: nameQuery.data?.nombre ?? "servicio",
            href: `/dashboard/services/${servicio}/editar`,
            disabled: isLoading,
          },
          {
            nombre: "disponibilidad",
            href: `/dashboard/services/${servicio}/disponibilidad`,
            disabled: true,
          },
        ]}
      />
      <PaperHeader
        title="Disponibilidad de servicios"
        subtitle="Listado de instituciones y tipos de autobús con disponibilidad de servicios"
        iconname="room_service"
        showButton
        onButtonClick={() => openAddDialog()}
        buttonTitle="Nuevo"
        leftIcon={<Add />}
        isLoading={query.isLoading || query.isFetching}
      />
      {query.data?.length === 0 ? (
        <EmptyState
          variant="no-data"
          title="No hay disponibilidad de servicios"
          description="Actualmente ninguna institución ha reestringido la disponibilidad de nuestros servicios."
          action={{
            label: "Establecer disponibilidad",
            onClick: () => openAddDialog(),
          }}
          imageSize={{
            width: 200,
            height: 200,
          }}
        />
      ) : (
        <Tabla<DisponibilidadRow>
          titulo={`Servicio:  ${nameQuery.data?.nombre}`}
          subtitulo="Si una insttitución no aparece en la lista, significa que no tiene disponibilidad de servicios para ningún tipo de autobús."
          columnas={columnas}
          data={
            query.data?.map((item) => ({
              ...item,
              estatus:
                item?.ids.filter((id) => id.activo).length >
                0,
            })) ?? []
          }
          isLoading={isLoading}
          onEditClick={(row) =>
            openSidebar({
              title: `Disponibilidad de servicio para ${row.institucion.nombre}`,
              children: (
                <DisponibilidadDetails
                  key={crypto.randomUUID()}
                  row={row}
                  tiposBus={tiposQuery.data ?? []}
                  refetch={query.refetch}
                  snack={snack}
                  closeSidebar={closeSidebar}
                  submitMutate={mutateNew}
                  changeStatusMutate={mutateStatus as any}
                  servicio_nombre={
                    nameQuery.data?.nombre ?? ""
                  }
                  servicio_id={nameQuery.data?.id ?? 0}
                  isLoading={
                    resNew.isLoading || resStatus.isLoading
                  }
                />
              ),
            })
          }
          onToggleActiveClick={(row) =>
            openDeleteDialog(row)
          }
          /*subHeaderComponent={
            <SubheaderComponent
              query={serviceQuery}
              setQuery={setQuery}
              options={options}
              setOption={setOption}
              option={option}
            />
          }*/
        />
      )}
    </>
  );
}

type DisponibilidadRow = Simplify<
  DisponibilidadPorServicio & {
    ids: DisponibilidadServicioResponse[];
  }
>;
