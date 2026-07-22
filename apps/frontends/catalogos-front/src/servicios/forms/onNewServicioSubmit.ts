import { SnackFunctionProps } from "@nexoroute/commons";
import { ServicioSchema } from "../validations/servicioZod";
import ServicioExterno from "../types/ServicioExterno";
import CampoConfig from "../types/CampoServicio";
export default async function onSubmit(
  data: ServicioSchema,
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
  const payload: Omit<
    ServicioExterno,
    "id" | "estatus" | "disponibilidad" | "slug"
  > = {
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim(),
    icono_nombre: data.icono_nombre,
    propiedades: data.propiedades as CampoConfig[],
  };

  try {
    await mutate(payload).unwrap();
    navigationFunction("/dashboard/services", {
      replace: true,
    });
    snack?.success({
      message: "Servicio creado correctamente",
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
  args: Omit<
    ServicioExterno,
    "id" | "estatus" | "disponibilidad" | "slug"
  >,
) => {
  unwrap: () => Promise<TResult>;
};
