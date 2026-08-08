"use client";
import React, { useCallback } from "react";

type ViajeProviderValues = {
  getSalidaId: () => number | null;
  pasajeros: number;
  setPasajeros: React.Dispatch<
    React.SetStateAction<number>
  >;
  cleanSalida: () => void;
  addSalidaId: (id: number) => void;
  fetchSalida: (id: number) => Promise<void>;
};

type SalidaProviderProps = {
  children: React.ReactNode;
};

const SalidaContext = React.createContext<
  ViajeProviderValues | undefined
>(undefined);

export function SalidaProvider({
  children,
}: Readonly<SalidaProviderProps>) {
  const getSalidaId = () => {
    const salidaIdStr = sessionStorage.getItem("salidaId");
    return salidaIdStr
      ? Number.parseInt(salidaIdStr, 10)
      : null;
  };

  const [pasajeros, setPasajeros] =
    React.useState<number>(0);

  const gatewayUrl =
    process.env.NEXT_PUBLIC_API_GATEWAY ??
    "http://localhost:5000";

  const cleanSalida = () => {
    sessionStorage.removeItem("salidaId");
    setPasajeros(0);
  };

  const addSalidaId = (id: number) => {
    sessionStorage.setItem("salidaId", id.toString());
  };

  const fetchSalida = useCallback(async (id: number) => {
    if (!id) return;
    const res = await fetch(`${gatewayUrl}/salidas/${id}`);
    if (!res.ok) {
      throw new Error("Error fetching salida");
    }
    return res.json();
  }, []);

  const contextValue = React.useMemo(
    () => ({
      getSalidaId,
      pasajeros,
      setPasajeros,
      cleanSalida,
      addSalidaId,
      fetchSalida,
    }),
    [
      getSalidaId,
      pasajeros,
      setPasajeros,
      cleanSalida,
      addSalidaId,
      fetchSalida,
    ],
  );

  return (
    <SalidaContext.Provider value={contextValue}>
      {children}
    </SalidaContext.Provider>
  );
}

export function useSalida() {
  const context = React.useContext(SalidaContext);
  if (!context) {
    throw new Error(
      "useSalida must be used within SalidaProvider",
    );
  }
  return context;
}
