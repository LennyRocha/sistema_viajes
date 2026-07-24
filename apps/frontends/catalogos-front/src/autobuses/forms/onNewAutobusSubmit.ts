import { SnackFunctionProps } from "@nexoroute/commons";
import { AutobusSchema } from "../validations/autobusZod";
export default async function onSubmit(
  data: AutobusSchema,
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
  const payload: AutobusSchema = {
    ...data,
  };

  try {
    await mutate(payload).unwrap();
    navigationFunction("/dashboard/buses", {
      replace: true,
    });
    snack?.success({
      message: "Autobús creado correctamente",
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
        "Error al crear el autobús, por favor intente nuevamente",
      duration: 3000,
    });
  }
}

type MutateFn<TResult = unknown> = (
  args: Omit<
    AutobusSchema,
    "id" | "disponibilidad" | "slug"
  >,
) => {
  unwrap: () => Promise<TResult>;
};
