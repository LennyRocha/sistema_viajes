import MainLayout from "@/src/layout/MainLayout";
import { federatedComponent } from "@/src/lib/loadRemote";

const AutobusKonva = federatedComponent(
  "catalogos/AutobusesModule",
  "KonvaPage",
);

type Props = {};

export default function page({}: Props) {
  return (
    <MainLayout>
      <AutobusKonva />
    </MainLayout>
  );
}
