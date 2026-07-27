import ServicioExterno from "../../servicios/types/ServicioExterno";
import AutobusServicio from "../types/AutobusServicio";

type AutobusServicioItem = Pick<
  AutobusServicio,
  "servicioId" | "configuracion_servicio"
>;

type useAutobusServiciosProps = {
  servicios: ServicioExterno[];
  selected: AutobusServicioItem[];
  updateList: (services: AutobusServicioItem[]) => void;
};

export default function useAutobusServicios({
  servicios,
  selected,
  updateList,
}: useAutobusServiciosProps) {
  const add = (newItem: AutobusServicioItem) => {
    updateList([...selected, newItem]);
  };

  const update = (updatedItem: AutobusServicioItem) => {
    updateList(
      selected.map((item) =>
        item.servicioId === updatedItem.servicioId
          ? updatedItem
          : item,
      ),
    );
  };

  const remove = (id: number) => {
    updateList(
      selected.filter((item) => item.servicioId !== id),
    );
  };

  const find = (
    id?: number,
  ): ServicioExterno | undefined => {
    return servicios.find((s) => s.id === id);
  };

  return {
    add,
    update,
    remove,
    find,
  };
}
