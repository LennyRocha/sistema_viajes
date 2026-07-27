import { SnackFunctionProps } from "@nexoroute/commons";
import { InstitucionSchema } from "../validations/institucionZod";
export default async function onSubmit(
  data: InstitucionSchema,
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
  const payload: InstitucionSchema = {
    nombre: data.nombre.trim(),
    descripcion: data.descripcion.trim(),
  };

  try {
    await mutate({ id, ...payload }).unwrap();
    navigationFunction("/dashboard/institutions", {
      replace: true,
    });
    snack?.success({
      message: "Institución actualizada correctamente",
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
        "Error al actualizar la institución",
      duration: 3000,
    });
  }
}

type MutateFn<TResult = unknown> = (
  args: InstitucionSchema & { id: number },
) => {
  unwrap: () => Promise<TResult>;
};
