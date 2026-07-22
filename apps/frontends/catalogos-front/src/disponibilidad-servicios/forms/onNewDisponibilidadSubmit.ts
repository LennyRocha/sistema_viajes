import { SnackFunctionProps } from "@nexoroute/commons";
import { DisponibilidadServicioInput } from "../types/disponibilidad-input";
export default async function onSubmit(
  data: DisponibilidadServicioInput,
  servicioNombre: string,
  institucionNombre: string,
  {
    snack,
    navigationFunction,
    mutate,
    setErrores,
  }: {
    snack?: SnackFunctionProps;
    navigationFunction: (
      href: string,
      options?: any,
    ) => void;
    mutate: MutateFn;
    setErrores: React.Dispatch<
      React.SetStateAction<Record<string, string[]>>
    >;
  },
) {
  try {
    await mutate(data).unwrap();
    const mensaje = `Disponibilidad del servicio ${servicioNombre} para la institución ${institucionNombre} creada`;
    navigationFunction("/dashboard/services", {
      replace: true,
    });
    snack?.success({
      message: mensaje,
      duration: 3000,
    });
  } catch (error) {
    if (error.errors) {
      setErrores(error.errors);
    }
    snack?.error({
      message:
        error?.data?.message ||
        error.message ||
        "Error al actualizar el servicio",
      duration: 3000,
    });
  }
}

type MutateFn<TResult = unknown> = (
  args: DisponibilidadServicioInput,
) => {
  unwrap: () => Promise<TResult>;
};
