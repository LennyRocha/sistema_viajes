"use client";

import React from "react";
import {
  Breadcrumb,
  CommonPageProps,
  PaperBlock,
  PaperHeader,
} from "@nexoroute/commons";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { mapViajeApi } from "../../viajes/utils/apiMappers";
import {
  buildConnectionSegments,
  buildJourneySimulationPath,
  getJourneyMetrics,
} from "../../viajes/utils/routeUtils";
import ViajeBase from "../../viajes/types/ViajeBase";
import {
  createSalida,
  getSalidasCatalogData,
} from "../api/salidasHttp";
import CrewSelectionStep from "../components/CrewSelectionStep";
import RoutePricingStep from "../components/RoutePricingStep";
import ScheduleStep from "../components/ScheduleStep";
import SalidaReviewStep from "../components/SalidaReviewStep";
import StepNavigation from "../components/StepNavigation";
import TripSelectionStep from "../components/TripSelectionStep";
import {
  AutobusResumen,
  ConductorResumen,
  InstitucionResumen,
  PrecioRutaSalida,
  TipoSalida,
} from "../types/SalidasApi";
import {
  RecurringSchedule,
  SingleSchedule,
  SpecialOccurrence,
  WEEK_DAYS,
  buildHorarioConfiguracion,
  hasValidSchedule,
} from "../utils/schedule";

interface Props extends CommonPageProps {}

const STEPS = [
  "Viaje",
  "Rutas y precios",
  "Fecha y hora",
  "Unidad y conductor",
  "Resumen",
];

const EMPTY_RECURRING = WEEK_DAYS.reduce<RecurringSchedule>((acc, day) => {
  acc[day.key] = [];
  return acc;
}, {});

function initialSpecial(): SpecialOccurrence[] {
  return [{ id: "initial", fecha: "", hora: "" }];
}

export default function ProgramacionSalidas({ snack }: Readonly<Props>) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [loadError, setLoadError] = React.useState("");
  const [viajesData, setViajesData] = React.useState<ViajeBase[]>([]);
  const [instituciones, setInstituciones] = React.useState<InstitucionResumen[]>([]);
  const [autobuses, setAutobuses] = React.useState<AutobusResumen[]>([]);
  const [conductores, setConductores] = React.useState<ConductorResumen[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = React.useState<number | "all">("all");
  const [search, setSearch] = React.useState("");
  const [selectedViajeId, setSelectedViajeId] = React.useState<number | null>(null);
  const [prices, setPrices] = React.useState<Record<number, string>>({});
  const [tipoSalida, setTipoSalida] = React.useState<TipoSalida>("UNICA");
  const [singleSchedule, setSingleSchedule] = React.useState<SingleSchedule>({
    fecha: "",
    hora: "",
  });
  const [recurringSchedule, setRecurringSchedule] = React.useState<RecurringSchedule>({
    ...EMPTY_RECURRING,
  });
  const [specialSchedule, setSpecialSchedule] = React.useState<SpecialOccurrence[]>(
    initialSpecial,
  );
  const [selectedBusId, setSelectedBusId] = React.useState<number | null>(null);
  const [selectedDriverId, setSelectedDriverId] = React.useState<number | null>(null);

  const loadData = React.useCallback(async (institutionId?: number) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getSalidasCatalogData({ institucionId: institutionId });
      const mappedViajes = response.viajes.map(mapViajeApi);
      const activeBuses = response.autobuses.filter((bus) => bus.estatus !== false);
      const activeDrivers = response.conductores.filter((driver) => driver.estatus !== false);

      setViajesData(mappedViajes);
      setInstituciones(response.instituciones);
      setAutobuses(activeBuses);
      setConductores(activeDrivers);
      setLoadError(response.errores?.join(" | ") || "");
      setSelectedViajeId((current) =>
        current && mappedViajes.some((viaje) => viaje.id === current)
          ? current
          : mappedViajes[0]?.id || null,
      );
      setSelectedBusId((current) =>
        current && activeBuses.some((bus) => bus.id === current)
          ? current
          : activeBuses[0]?.id || null,
      );
      setSelectedDriverId((current) =>
        current && activeDrivers.some((driver) => driver.id === current)
          ? current
          : activeDrivers[0]?.id || null,
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el catalogo para programar salidas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData(
      selectedInstitutionId === "all" ? undefined : selectedInstitutionId,
    );
  }, [loadData, selectedInstitutionId]);

  const viajes = React.useMemo(
    () =>
      viajesData.filter((viaje) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return `${viaje.nombre} ${viaje.descripcion}`.toLowerCase().includes(q);
      }),
    [search, viajesData],
  );

  const selectedViaje = React.useMemo(
    () => viajesData.find((viaje) => viaje.id === selectedViajeId) || viajesData[0],
    [selectedViajeId, viajesData],
  );

  const selectedRoutes = selectedViaje?.rutas || [];
  const selectedBus = React.useMemo(
    () => autobuses.find((bus) => bus.id === selectedBusId) || null,
    [autobuses, selectedBusId],
  );
  const selectedDriver = React.useMemo(
    () => conductores.find((driver) => driver.id === selectedDriverId) || null,
    [conductores, selectedDriverId],
  );
  const connections = React.useMemo(
    () => buildConnectionSegments(selectedRoutes),
    [selectedRoutes],
  );
  const metrics = React.useMemo(
    () => getJourneyMetrics(selectedRoutes, connections),
    [connections, selectedRoutes],
  );
  const simulationPath = React.useMemo(
    () => buildJourneySimulationPath(selectedRoutes, connections),
    [connections, selectedRoutes],
  );
  const durationMin = React.useMemo(
    () =>
      Math.round(
        selectedViaje?.duracionTotalMin ||
          selectedViaje?.duracionCalculadaMin ||
          metrics.durationMin ||
          0,
      ),
    [metrics.durationMin, selectedViaje],
  );
  const totalPrice = React.useMemo(
    () =>
      selectedRoutes.reduce(
        (total, route) => total + (Number(prices[route.id]) || 0),
        0,
      ),
    [prices, selectedRoutes],
  );

  React.useEffect(() => {
    if (!selectedViaje) return;
    setPrices((current) => {
      const next: Record<number, string> = {};
      selectedViaje.rutas.forEach((route) => {
        next[route.id] = current[route.id] || "";
      });
      return next;
    });
  }, [selectedViaje]);

  const validation = React.useMemo(() => {
    const routePrices = selectedRoutes.map((route) => Number(prices[route.id]) || 0);
    return {
      hasViaje: Boolean(selectedViaje),
      hasPrices: selectedRoutes.length > 0 && routePrices.every((price) => price > 0),
      hasSchedule: hasValidSchedule(
        tipoSalida,
        singleSchedule,
        recurringSchedule,
        specialSchedule,
      ),
      hasCrew: Boolean(selectedBusId && selectedDriverId),
    };
  }, [
    prices,
    recurringSchedule,
    selectedBusId,
    selectedDriverId,
    selectedRoutes,
    selectedViaje,
    singleSchedule,
    specialSchedule,
    tipoSalida,
  ]);

  const canContinue = [
    validation.hasViaje,
    validation.hasPrices,
    validation.hasSchedule,
    validation.hasCrew,
    validation.hasViaje &&
      validation.hasPrices &&
      validation.hasSchedule &&
      validation.hasCrew,
  ][activeStep];

  const goNext = () => {
    if (!canContinue) return;
    setActiveStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const saveSalida = async () => {
    if (!selectedViaje || !selectedBusId || !selectedDriverId) {
      snack?.error({ message: "Completa los pasos antes de guardar la salida." });
      return;
    }

    if (!validation.hasSchedule) {
      snack?.error({ message: "Configura al menos una fecha y hora valida." });
      setActiveStep(2);
      return;
    }

    const routePrices: PrecioRutaSalida[] = selectedRoutes.map((route, index) => ({
      rutaId: route.id,
      orden: index + 1,
      nombre: route.nombre,
      precio: Number(prices[route.id]) || 0,
    }));

    if (routePrices.some((route) => route.precio <= 0)) {
      snack?.error({ message: "Cada ruta necesita un precio mayor a cero." });
      setActiveStep(1);
      return;
    }

    try {
      setIsSaving(true);
      await createSalida({
        autobusId: selectedBusId,
        conductorId: selectedDriverId,
        viajeBaseId: selectedViaje.id,
        horario_configuracion: buildHorarioConfiguracion(
          tipoSalida,
          singleSchedule,
          recurringSchedule,
          specialSchedule,
          durationMin,
        ),
        tipoSalida,
        estadoSalida: "PROGRAMADO",
        precios: {
          moneda: "MXN",
          rutas: routePrices,
        },
      });
      snack?.success({ message: "Salida programada correctamente." });
      setActiveStep(0);
    } catch (error) {
      snack?.error({
        message:
          error instanceof Error
            ? `No se pudo programar la salida: ${error.message}`
            : "No se pudo programar la salida.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    if (isLoading) {
      return (
        <PaperBlock>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size={22} />
            <Typography>Cargando viajes, autobuses y conductores...</Typography>
          </Stack>
        </PaperBlock>
      );
    }

    if (activeStep === 0) {
      return (
        <TripSelectionStep
          instituciones={instituciones}
          selectedInstitutionId={selectedInstitutionId}
          onInstitutionChange={setSelectedInstitutionId}
          search={search}
          onSearchChange={setSearch}
          viajes={viajes}
          selectedViaje={selectedViaje}
          connections={connections}
          simulationPath={simulationPath}
          selectedViajeId={selectedViaje?.id}
          onSelectViaje={setSelectedViajeId}
        />
      );
    }

    if (activeStep === 1) {
      return (
        <RoutePricingStep
          routes={selectedRoutes}
          connections={connections}
          simulationPath={simulationPath}
          prices={prices}
          onPriceChange={(routeId, value) =>
            setPrices((current) => ({ ...current, [routeId]: value }))
          }
          isValid={validation.hasPrices}
        />
      );
    }

    if (activeStep === 2) {
      return (
        <ScheduleStep
          tipoSalida={tipoSalida}
          onTipoSalidaChange={setTipoSalida}
          single={singleSchedule}
          onSingleChange={setSingleSchedule}
          recurring={recurringSchedule}
          onRecurringChange={setRecurringSchedule}
          special={specialSchedule}
          onSpecialChange={setSpecialSchedule}
          durationMin={durationMin}
        />
      );
    }

    if (activeStep === 3) {
      return (
        <CrewSelectionStep
          autobuses={autobuses}
          conductores={conductores}
          selectedBus={selectedBus}
          selectedDriver={selectedDriver}
          onSelectBus={setSelectedBusId}
          onSelectDriver={setSelectedDriverId}
        />
      );
    }

    return (
      <SalidaReviewStep
        viaje={selectedViaje}
        routes={selectedRoutes}
        prices={prices}
        tipoSalida={tipoSalida}
        single={singleSchedule}
        recurring={recurringSchedule}
        special={specialSchedule}
        durationMin={durationMin}
        selectedBus={selectedBus}
        selectedDriver={selectedDriver}
        totalPrice={totalPrice}
        distanceKm={metrics.distanceKm}
      />
    );
  };

  return (
    <>
      <Breadcrumb
        rolActual="Rol actual"
        breads={[
          { nombre: "Salidas", href: "/dashboard/salidas", disabled: true },
          { nombre: "Programacion", href: "/dashboard/salidas/programacion", disabled: true },
        ]}
      />
      <PaperHeader
        title="Programacion de salidas"
        subtitle="Flujo guiado para elegir viaje base, configurar rutas, fecha, unidad y conductor."
        iconname="event_available"
        showButton={false}
      />

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <PaperBlock
        paperProps={{ sx: { mb: 2 } }}
        contentWrapperSx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </PaperBlock>

      <Box sx={{ width: "100%" }}>{renderStep()}</Box>

      <StepNavigation
        activeStep={activeStep}
        totalSteps={STEPS.length}
        canContinue={Boolean(canContinue)}
        isSaving={isSaving}
        onBack={() => setActiveStep((current) => Math.max(0, current - 1))}
        onNext={goNext}
        onSave={saveSalida}
      />
    </>
  );
}
