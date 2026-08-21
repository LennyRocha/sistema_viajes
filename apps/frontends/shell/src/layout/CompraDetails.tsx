"use client";
import React from "react";
import useCompra from "../core/hooks/useCompra";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

type Props = {
  codigo_compra: string;
};

export default function CompraDetails({
  codigo_compra,
}: Readonly<Props>) {
  const { getCompraByCodigo } = useCompra();
  const [compra, setCompra] = React.useState<any>(null);
  const [loading, setLoading] =
    React.useState<boolean>(true);
  const fetchCompra = async () => {
    try {
      setLoading(true);
      const data = await getCompraByCodigo(codigo_compra);
      setCompra(data);
    } catch (error) {
      console.error("Error fetching compra:", error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchCompra();
  }, [codigo_compra]);

  if (loading)
    return (
      <Backdrop
        sx={(theme) => ({
          color: theme.palette.text.primary,
          zIndex: theme.zIndex.drawer + 1,
        })}
        open
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );

  return <div>CompraDetails {JSON.stringify(compra)}</div>;
}
