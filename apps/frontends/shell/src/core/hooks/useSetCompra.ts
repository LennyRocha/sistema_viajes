import { useState } from "react";
import {
  Compra,
  Comprador,
  Pasajero,
} from "../types/Compra";

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

  const prefillComprador = (values: Partial<Comprador>) => {
    setFormData((prev) => ({
      ...prev,
      comprador: {
        ...prev.comprador,
        nombres: prev.comprador.nombres || values.nombres || "",
        apellido_paterno:
          prev.comprador.apellido_paterno || values.apellido_paterno || "",
        apellido_materno:
          prev.comprador.apellido_materno || values.apellido_materno || "",
        email: prev.comprador.email || values.email || "",
        telefono: prev.comprador.telefono || values.telefono || "",
      },
    }));
  };

  const setPasajero = (
    index: number,
    field: keyof Pasajero,
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
    prefillComprador,
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
  metodoPagoId: 1,
  metodoPago: null,
  abordado: false,
};
