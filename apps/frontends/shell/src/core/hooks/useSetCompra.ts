import { useState } from "react";
import { Compra, Comprador } from "../types/Compra";

const useSetCompra = () => {
  const [formData, setFormData] =
    useState<Compra>(template);

  const setField = (field: keyof Compra, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setCompradorField = (
    field: keyof Comprador,
    value: any,
  ) => {
    setFormData((prev: Compra) => {
      const comprador = {
        ...prev.comprador,
        [field]: value,
      } as unknown as Comprador;
      return { ...prev, comprador } as Compra;
    });
  };

  const setPasajero = (
    index: number,
    field: keyof Comprador,
    value: any,
  ) => {
    setFormData((prev: Compra) => {
      const updatedAsientos = [...prev.asientos];
      updatedAsientos[index] = {
        ...updatedAsientos[index],
        [field]: value,
      };
      return {
        ...prev,
        asientos: updatedAsientos,
      } as Compra;
    });
  };

  return {
    formData,
    setField,
    setCompradorField,
    setPasajero,
  };
};

export default useSetCompra;

const template: Compra = {
  salidaId: 0,
  comprador: {
    nombres: "",
    apellido_materno: "",
    apellido_paterno: "",
    email: "",
    telefono: "",
  },
  pasajeros: 0,
  asientos: [],
  monto: 0,
  rutaId: 0,
  metodoPagoId: 0,
  abordado: false,
};
