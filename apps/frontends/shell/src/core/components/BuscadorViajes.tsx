"use client";
import {
  CalendarToday,
  LocationOn,
  Map,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  Autocomplete,
  Button,
} from "@mui/material";
import {
  MotionPaper,
  NumberField,
} from "@nexoroute/commons";
import "@/src/css/landing.css";
import { useRouter } from "next/navigation";
import React from "react";
import { DateField } from "@mui/x-date-pickers/DateField";
import dayjs from "dayjs";
import { PlaceSuggestion } from "../types/PlaceSuggestions";

type SearchParamsState = {
  from: string;
  to: string;
  fromId: string;
  toId: string;
  fechaIda: Date;
  fechaVuelta?: Date;
  pasajeros: number | string;
};

const Buscador = ({
  toBottom = false,
}: {
  toBottom?: boolean;
}) => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  const [searchParams, setSearchParams] = React.useState<SearchParamsState>({
    from: "",
    to: "",
    fromId: "",
    toId: "",
    fechaIda: new Date(year, month, day),
    fechaVuelta: new Date(year, month, day + 2),
    pasajeros: 1,
  });
  const addParam = (
    key: keyof typeof searchParams,
    value: string | number | Date,
  ) => {
    setSearchParams((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };
  const removeParam = (key: keyof typeof searchParams) => {
    setSearchParams((prev: any) => {
      const newParams = { ...prev };
      delete newParams[key];
      return newParams;
    });
  };
  const getParam = (key: keyof typeof searchParams) => {
    return searchParams[key];
  };
  const [tab, setTab] = React.useState(0);
  const handleChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    if (newValue === 1) {
      removeParam("fechaVuelta");
    } else {
      addParam(
        "fechaVuelta",
        new Date(year, month, day + 2),
      );
    }
    setTab(newValue);
  };
  const shapeParams = () => {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        const formattedValue =
          value instanceof Date
            ? formatDateParam(value)
            : value.toString();

        params.set(key, formattedValue);
      }
    });

    return params;
  };

  const [isLoadingFrom, setIsLoadingFrom] =
    React.useState(false);
  const [isLoadingTo, setIsLoadingTo] =
    React.useState(false);

  const [origenOptions, setOrigenOptions] = React.useState<
    PlaceSuggestion[]
  >([]);
  const [destinoOptions, setDestinoOptions] =
    React.useState<PlaceSuggestion[]>([]);

  const [autoCompleteFunction, setAutoCompleteFunction] =
    React.useState<
      null | ((input: string) => Promise<any>)
    >(null);

  const loadAutoComplete = async () => {
    try {
      const { loadRemote } =
        await import("@module-federation/enhanced/runtime");

      const mod = await loadRemote<any>(
        "operaciones/exports",
      );
      setAutoCompleteFunction(
        () => mod.searchPlacePredictions,
      );
    } catch (error) {
      console.warn(
        "No se pudo cargar el autocomplete de Google Maps",
        error,
      );
    }
  };

  const searchPredictions = React.useCallback(
    async (input: string) => {
      if (!autoCompleteFunction) return;
      return autoCompleteFunction(input);
    },
    [autoCompleteFunction],
  );

  React.useEffect(() => {
    loadAutoComplete();
  }, []);

  React.useEffect(() => {
    if (
      !autoCompleteFunction ||
      searchParams["from"].trim().length < 3
    ) {
      setOrigenOptions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsLoadingFrom(true);
      try {
        setOrigenOptions(
          await searchPredictions(searchParams["from"]),
        );
      } finally {
        setIsLoadingFrom(false);
      }
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [searchPredictions, searchParams["from"]]);

  React.useEffect(() => {
    if (
      !autoCompleteFunction ||
      searchParams["to"].trim().length < 3
    ) {
      setDestinoOptions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsLoadingTo(true);
      try {
        setDestinoOptions(
          await searchPredictions(searchParams["to"]),
        );
      } finally {
        setIsLoadingTo(false);
      }
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [searchPredictions, searchParams["to"]]);

  const { push } = useRouter();
  return (
    <MotionPaper
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ ease: "easeInOut", duration: 1 }}
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        padding: "16px",
        gap: "16px",
        flexDirection: "column",
        ...(toBottom && {
          "@media (max-width: 1084px)": {
            position: "absolute",
            left: 0,
            bottom: "-175px",
            margin: "0 8px",
            width: "calc(100% - 16px)",
          },
        }),
      }}
    >
      <Tabs
        aria-label="tipo de viaje"
        value={tab}
        onChange={handleChange}
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Tab
          {...a11yProps("ida-y-vuelta")}
          label="Ida y vuelta"
          sx={{
            "@media (max-width: 768px)": {
              flex: 1,
            },
          }}
        />
        <Tab
          {...a11yProps("solo-ida")}
          label="Solo ida"
          sx={{
            "@media (max-width: 768px)": {
              flex: 1,
            },
          }}
        />
      </Tabs>
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          width: "100%",
          "@media (max-width: 1084px)": {
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ flex: 1 }}>
          {autoCompleteFunction ? (
            <Autocomplete
              freeSolo
              options={origenOptions}
              loading={isLoadingFrom}
              loadingText="Buscando lugares..."
              noOptionsText={
                searchParams["from"].trim().length < 3
                  ? "Escribe al menos 3 letras"
                  : "Sin resultados"
              }
              filterOptions={(items) => items}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : option.description
              }
              onChange={(_, option) => {
                if (typeof option === "string") {
                  addParam("from", option);
                } else if (option) {
                  addParam("from", option.description);
                  addParam("fromId", option.placeId);
                }
              }}
              inputValue={searchParams["from"]}
              onInputChange={(_, value) => {
                const val = value.replace(
                  /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                  "",
                );
                addParam("from", val);
              }}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box component="li" {...rest} key={key}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800 }}
                      >
                        {option.mainText}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {option.secondaryText}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Origen"
                  size="small"
                  sx={{ flex: 1 }}
                  fullWidth
                  required
                  placeholder="Escribe al menos 3 letras para buscar"
                />
              )}
            />
          ) : (
            <TextField
              label="Origen"
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              fullWidth
              value={getParam("from") ?? ""}
              onChange={(e) => {
                const value = e.target.value.replace(
                  /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                  "",
                );
                addParam("from", value);
              }}
              slotProps={{
                input: {
                  endAdornment: <LocationOn />,
                },
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          {autoCompleteFunction ? (
            <Autocomplete
              freeSolo
              options={destinoOptions}
              loading={isLoadingTo}
              loadingText="Buscando lugares..."
              noOptionsText={
                searchParams["to"].trim().length < 3
                  ? "Escribe al menos 3 letras"
                  : "Sin resultados"
              }
              filterOptions={(items) => items}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : option.description
              }
              onChange={(_, option) => {
                if (typeof option === "string") {
                  addParam("to", option);
                } else if (option) {
                  addParam("to", option.description);
                  addParam("toId", option.placeId);
                }
              }}
              inputValue={searchParams["to"]}
              onInputChange={(_, value) => {
                const val = value.replace(
                  /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                  "",
                );
                addParam("to", val);
              }}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box component="li" {...rest} key={key}>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800 }}
                      >
                        {option.mainText}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {option.secondaryText}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destino"
                  size="small"
                  sx={{ flex: 1 }}
                  fullWidth
                  required
                  placeholder="Escribe al menos 3 letras para buscar"
                />
              )}
            />
          ) : (
            <TextField
              label="Destino"
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              fullWidth
              value={getParam("to") ?? ""}
              onChange={(e) => {
                const value = e.target.value.replace(
                  /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                  "",
                );
                addParam("to", value);
              }}
              slotProps={{
                input: {
                  endAdornment: <Map />,
                },
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />
          )}
        </Box>
        <DateField
          label="Fecha de ida"
          variant="outlined"
          format="DD/MM/YYYY"
          value={dayjs(
            getParam("fechaIda") ??
              new Date(year, month, day),
          )}
          onChange={(value) => {
            if (value?.isValid()) {
              addParam("fechaIda", value.toDate());
            }
          }}
          size="small"
          sx={{ flex: 1 }}
          endAdornment={<CalendarToday />}
        />
        {tab === 0 && (
          <DateField
            label="Fecha de vuelta"
            variant="outlined"
            format="DD/MM/YYYY"
            value={dayjs(
              getParam("fechaVuelta") ??
                new Date(year, month, day + 2),
            )}
            onChange={(value) => {
              if (value?.isValid()) {
                addParam("fechaVuelta", value.toDate());
              }
            }}
            size="small"
            sx={{ flex: 1 }}
            endAdornment={<CalendarToday />}
          />
        )}
        <NumberField
          id={"pasajeros-field"}
          label="Pasajeros"
          min={0}
          max={8}
          defaultValue={Number(getParam("pasajeros") ?? 0)}
          size="small"
          error={false}
          onValueChange={(value) => {
            if (value == null) {
              addParam("pasajeros", "");
              return;
            }

            if (value >= 1 && value <= 8) {
              addParam("pasajeros", String(value));
            }
          }}
        />
        <Button
          variant="contained"
          color="secondary"
          sx={{ flex: 1 }}
          onClick={() =>
            push(
              `/viajes?${shapeParams().toString()}`,
            )
          }
        >
          Buscar viajes
        </Button>
      </Box>
    </MotionPaper>
  );
};

export default Buscador;

function a11yProps(typex: string) {
  return {
    id: `viaje-tab-${typex}`,
    "aria-controls": `viaje-tabpanel-${typex}`,
  };
}

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0",
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
