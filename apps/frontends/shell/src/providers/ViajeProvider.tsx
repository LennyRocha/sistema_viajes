"use client";
import React, { useCallback } from "react";
import { authenticatedFetch } from "@nexoroute/commons";

type ViajeProviderValues = {
  getSalidaId: () => number | null;
  pasajeros: number;
  setPasajeros: React.Dispatch<
    React.SetStateAction<number>
  >;
  cleanSalida: () => void;
  addSalidaId: (id: number) => void;
  addPasajeros: (count: number) => void;
  fetchSalida: (id: number) => Promise<void>;
  fetchAsientos: (salidaId: number) => Promise<void>;
  fetchSalidas: (params?: string) => Promise<void>;
  addSalidaConfig: (config: any) => void;
  getSalidaConfig: () => void;
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

  const getSalidaConfig = () => {
    const salidaConfigStr =
      sessionStorage.getItem("salidaConfig");
    return salidaConfigStr
      ? JSON.parse(salidaConfigStr)
      : null;
  };

  const [pasajeros, setPasajeros] =
    React.useState<number>(1);

  const gatewayUrl =
    process.env.NEXT_PUBLIC_API_GATEWAY ??
    "http://localhost:5000";

  const cleanSalida = () => {
    sessionStorage.removeItem("salidaId");
    sessionStorage.removeItem("pasajeros");
    sessionStorage.removeItem("salidaConfig");
    setPasajeros(1);
  };

  React.useEffect(() => {
    if (sessionStorage.getItem("pasajeros") === null) {
      setPasajeros(1);
    } else {
      setPasajeros(
        Number(sessionStorage.getItem("pasajeros")),
      );
    }
  }, []);

  const addSalidaId = (id: number) => {
    sessionStorage.setItem("salidaId", id.toString());
  };

  const addSalidaConfig = (config: any) => {
    sessionStorage.setItem(
      "salidaConfig",
      JSON.stringify(config),
    );
  };

  const addPasajeros = (count: number) => {
    sessionStorage.setItem("pasajeros", count.toString());
    setPasajeros(count);
  };

  const fetchSalida = useCallback(async (id: number) => {
    if (!id) return;
    const token = localStorage.getItem("nexoroute.accessToken");
    const res = await authenticatedFetch(`${gatewayUrl}/salidas/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }, gatewayUrl);
    if (!res.ok) {
      throw new Error("Error fetching salida");
    }
    return res.json();
  }, []);

  const fetchAsientos = useCallback(
    async (salidaId: number) => {
      if (!salidaId) return;
      const res = await fetch(
        `${gatewayUrl}/compras/asientos/${salidaId}`,
      );
      if (!res.ok) {
        throw new Error("Error fetching asientos");
      }
      return res.json();
    },
    [],
  );

  const fetchSalidas = async (params?: string) => {
    const res = await fetch(
      params
        ? `${gatewayUrl}/salidas/buscar?${params}`
        : `${gatewayUrl}/salidas`,
    );
    if (!res.ok) {
      throw new Error("Error fetching salidas");
    }
    const data = await res.json();
    return data;
  };

  const contextValue = React.useMemo(
    () => ({
      getSalidaId,
      pasajeros,
      addPasajeros,
      setPasajeros,
      cleanSalida,
      addSalidaId,
      fetchSalida,
      fetchSalidas,
      fetchAsientos,
      addSalidaConfig,
      getSalidaConfig,
    }),
    [
      getSalidaId,
      pasajeros,
      addPasajeros,
      setPasajeros,
      cleanSalida,
      addSalidaId,
      fetchSalida,
      fetchSalidas,
      fetchAsientos,
      addSalidaConfig,
      getSalidaConfig,
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
