import { SnackFunctionProps } from "@nexoroute/commons";
import { DisponibilidadServicioInput } from "../types/disponibilidad-input";
export default async function onSubmit(
  data: DisponibilidadServicioInput,
  servicioNombre: string,
  institucionNombre: string,
  {
    snack,
    mutate,
    closeSidebar,
    refetch,
  }: {
    snack?: SnackFunctionProps;
    mutate: MutateFn;
    closeSidebar?: () => void;
    refetch: () => void;
  },
) {
  try {
    await mutate(data).unwrap();
    const mensaje = `Disponibilidad del servicio ${servicioNombre} para la institución ${institucionNombre} creada`;
    snack?.success({
      message: mensaje,
      duration: 3000,
    });
  } catch (error) {
    snack?.error({
      message:
        error?.data?.message ||
        error.message ||
        "Error al actualizar el servicio",
      duration: 3000,
    });
  }
  refetch();
  closeSidebar?.();
}

type MutateFn<TResult = unknown> = (
  args: DisponibilidadServicioInput,
) => {
  unwrap: () => Promise<TResult>;
};
