import { SnackFunctionProps } from "@nexoroute/commons";
export default async function onChangeStatus(
  id: number,
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
      message: "Autobús actualizado correctamente",
      duration: 3000,
    });
  } catch (error) {
    snack?.error({
      message:
        error?.data?.message ||
        error.message ||
        "Error al actualizar el autobús, por favor intente nuevamente",
      duration: 3000,
    });
  }
}

type MutateFn<TResult = unknown> = (args: {
  id: number;
}) => {
  unwrap: () => Promise<TResult>;
};
