import { SnackFunctionProps } from "@nexoroute/commons";
export default async function onChangeStatus(
  id: number,
  activo: boolean,
  {
    snack,
    mutate,
  }: {
    snack?: SnackFunctionProps;
    mutate: MutateFn;
  },
) {
  try {
    await mutate({ id }).unwrap();
    snack?.success({
      message: activo
        ? "Disponibilidad activada correctamente"
        : "Disponibilidad desactivada correctamente",
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
}

type MutateFn<TResult = unknown> = (args: {
  id: number;
}) => {
  unwrap: () => Promise<TResult>;
};
