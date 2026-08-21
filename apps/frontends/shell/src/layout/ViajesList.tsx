"use client";
import React from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useSalida } from "../providers/ViajeProvider";
import {
  EmptyState,
  MotionPaper,
  snack,
} from "@nexoroute/commons";
import Image from "next/image";
import Buscador from "../core/components/BuscadorViajes";
import SalidaCard from "../core/components/SalidaCard";
import SalidaDialog from "../core/components/SalidaDialog";
import { ArrowBack } from "@mui/icons-material";

export default function ViajesList() {
  const router = useRouter();
  const { addSalidaId, addSalidaConfig, addPasajeros } =
    useSalida();
  const params = useSearchParams();
  const pasajeros = params.get("pasajeros");
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any[]>([]);
  const { fetchSalidas } = useSalida();

  const doFetchSalidas = async () => {
    setLoading(true);
    try {
      const salidas: any = await fetchSalidas(
        params.toString(),
      );
      setData(salidas);
    } catch {
      snack.error({
        message: "Ocurrio un error al obtener las salidas",
        duration: 3000,
      });
      setTimeout(() => {
        router.replace("/");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    doFetchSalidas();
  }, [params]);

  const goToCompra = (
    salida: number,
    pasajeros: number,
    salidaConfig: any,
  ) => {
    addSalidaId(salida);
    addPasajeros(pasajeros);
    addSalidaConfig(salidaConfig);
    router.push("/compra-tus-boletos");
  };

  const [open, setOpen] = React.useState(false);
  const [currKey, setCurrKey] = React.useState(null);
  const [selectedServices, setSelectedServices] =
    React.useState([]);

  const handleClickOpen = (salida: any) => {
    setCurrKey(salida.id);
    setSelectedServices(salida.amenidades);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrKey(null);
    setSelectedServices([]);
  };

  React.useEffect(() => {
    if (!loading && data.length === 0) {
      snack.warning({
        message:
          "No se encontraron salidas con los filtros proporcionados",
        duration: 3000,
      });
    }
  }, [data, loading]);

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

  return (
    <Box
      component={"main"}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        minHeight: "100dvh",
        scrollbarColor: "transparent transparent",
        position: "relative",
      }}
    >
      <Header />
      <Box
        sx={{
          maxWidth: "1400px",
          display: "flex",
          flexDirection: "column",
          height: "fit-content",
          margin: "0 auto",
          gap: "8px",
          width: "100%",
          position: "relative",
          padding: "16px",
        }}
      >
        <Buscador toBottom={false} />
        {data.length !== 0 && (
          <Typography variant="h4" sx={{ mt: 2 }}>
            Se encontraron {data.length} salidas
          </Typography>
        )}
        {data.length === 0 ? (
          <EmptyState
            variant="no-data"
            description="No se encontraron salidas coincidentes con los filtros proporcionados"
            title="¡Oh no!"
            action={{
              onClick() {
                router.replace("/");
              },
              label: "Volver al inicio",
            }}
          />
        ) : (
          /*data.map((salida, idx) => (
            <SalidaCard
              key={salida.id}
              salida={salida}
              idx={idx}
              onClick={(salida) =>
                goToCompra(
                  salida.id,
                  pasajeros ? Number(pasajeros) : 1,
                )
              }
              openDetailsDialog={handleClickOpen}
            />
          ))*/
          <CardsMapper
            data={data}
            goToCompra={goToCompra}
            pasajeros={pasajeros}
            handleClickOpen={handleClickOpen}
          />
        )}
      </Box>
      <SalidaDialog
        key={currKey}
        open={open}
        servicios={selectedServices}
        onClose={handleClose}
      />
    </Box>
  );
}

const Header = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const router = useRouter();
  return (
    <MotionPaper sx={{ p: 2, width: "100%" }}>
      <Box
        sx={{
          maxWidth: "1400px",
          width: "100%",
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <Image
            src={
              isDark
                ? "/assets/logo_white_sf.png"
                : "/assets/logo_black_sf.png"
            }
            alt="logo"
            style={{
              width: 75,
              height: 50,
              objectFit: "contain",
            }}
            width={75}
            height={50}
          />
          <Box
            sx={{
              display: "flex",
              gap: 0,
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle2"
              className="font-brand"
              sx={{ margin: 0 }}
            >
              Nexoroute
            </Typography>
            <Typography variant="caption">
              Viaja mejor
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => router.back()}
          size="small"
          startIcon={<ArrowBack />}
        >
          Volver
        </Button>
      </Box>
    </MotionPaper>
  );
};

const CardsMapper = ({
  data,
  pasajeros,
  goToCompra,
  handleClickOpen,
}: {
  data: any[];
  pasajeros: string | null;
  goToCompra: (
    id: number,
    pasajeros: number,
    salida: any,
  ) => void;
  handleClickOpen: (salida: any) => void;
}) => {
  type salidaTipo = "UNICA" | "RECURRENTE" | "ESPECIAL";
  let list: any[] = [];
  data.forEach((d: any) => {
    const tipo: salidaTipo = d.tipoSalida;
    if (tipo === "UNICA") {
      const salidaUnica = {
        ...d,
        config: {
          inicio: {
            hora: d.horario_configuracion.inicio.hora,
          },
          finCalculado: {
            hora: d.horario_configuracion.finCalculado.hora,
          },
          fecha: d.horario_configuracion.inicio.fecha,
        },
      };
      list.push(salidaUnica);
    } else if (tipo === "RECURRENTE") {
      const dias = d.horario_configuracion.dias;
      dias.forEach((dia: any) => {
        const horarios = dia.horarios;
        horarios.forEach((h: any) => {
          const salidaRecurrente = {
            ...d,
            config: {
              inicio: {
                hora: d.horaInicio,
              },
              finCalculado: {
                hora: d.horaFinEstimada,
              },
              dia: dia.dia,
            },
          };
          list.push(salidaRecurrente);
        });
      });
    } else {
      const ocurrencias =
        d.horario_configuracion.ocurrencias;
      ocurrencias.forEach((o: any) => {
        const salidaEspecial = {
          ...d,
          config: {
            inicio: {
              hora: o.horaInicio,
            },
            finCalculado: {
              hora: o.finCalculado.hora,
            },
            fecha: o.fecha,
          },
        };
        list.push(salidaEspecial);
      });
    }
  });

  return list.map((salida, idx) => (
    <SalidaCard
      key={idx + 1}
      salida={salida}
      idx={idx}
      onClick={(salida) =>
        goToCompra(
          salida.id,
          pasajeros && Number(pasajeros) !== 0
            ? Number(pasajeros)
            : 1,
          salida.config,
        )
      }
      openDetailsDialog={handleClickOpen}
    />
  ));
};
