import { SnackFunctionProps } from "@nexoroute/commons";
export default async function onSubmit(
  data: any,
  {
    snack,
    navigationFunction,
  }: {
    snack?: SnackFunctionProps;
    navigationFunction: (
      href: string,
      options?: any,
    ) => void;
  },
) {
  console.log("onSubmit data", data);
  snack?.success({
    message: "Servicio creado correctamente",
  });
  navigationFunction("/services", { replace: true });
}
