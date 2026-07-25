import { SnackFunctionProps } from "@nexoroute/commons";
import { AutobusSchema } from "../validations/autobusZod";
export default async function onSubmit(
  data: Partial<AutobusSchema>,
  id: number,
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
  const payload: Partial<AutobusSchema> = {
    ...data,
    servicios: data.servicios?.map((servicio) => ({
      servicio_id: servicio.servicioId,
      config_servicio: servicio.configuracion_servicio,
    })),
  };
  try {
    await mutate({ id, ...payload }).unwrap();
    navigationFunction("/dashboard/buses", {
      replace: true,
    });
    snack?.success({
      message: "Autobús actualizado correctamente",
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
        "Error al actualizar el autobús, por favor intente nuevamente",
      duration: 3000,
    });
  }
}

type MutateFn<TResult = unknown> = (
  args: Partial<AutobusSchema> & { id: number },
) => {
  unwrap: () => Promise<TResult>;
};
