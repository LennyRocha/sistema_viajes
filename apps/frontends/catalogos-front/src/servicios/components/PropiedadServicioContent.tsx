import React from "react";
import CampoConfig from "../types/CampoServicio";
import {
  Divider,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  Switch,
  IconButton,
  Radio,
  RadioGroup,
} from "@mui/material";
import { motion } from "framer-motion";
import { Add, Remove } from "@mui/icons-material";
import { CampoConfigSchema } from "../validations/campoZod";
type Props = {
  propiedades: CampoConfigSchema[];
  setValue: (
    field: string,
    value: CampoConfigSchema[],
  ) => void;
  closeSidebar: () => void;
  propiedad?: CampoConfigSchema;
  readonly: boolean;
};

export default function PropiedadServicioContent({
  propiedades,
  setValue,
  closeSidebar,
  propiedad: propiedadInicial,
  readonly = false,
}: Readonly<Props>) {
  const [isReseting, setIsReseting] = React.useState(false);
  const reset = () => {
    setIsReseting(true);
    setTimeout(() => {
      setIsReseting(false);
    }, 1000);
  };
  const defaultPropiedad =
    propiedadInicial || ({} as CampoConfigSchema);
  const [propiedad, setPropiedad] =
    React.useState<CampoConfigSchema>(defaultPropiedad);
  const [visibleChecked, setVisibleChecked] =
    React.useState(false);
  React.useEffect(() => {
    if (isReseting) {
      setPropiedad(defaultPropiedad);
      setVisibleChecked(false);
    }
  }, [isReseting]);
  const propiedadDependiente = React.useMemo(() => {
    return propiedades.find(
      (p) => p.clave === propiedad.visible?.campo,
    );
  }, [propiedades, propiedad.visible?.campo]);
  React.useEffect(() => {
    if (propiedad.tipo) {
      let tipo = "";
      switch (propiedad.tipo) {
        case "string":
          tipo = "text";
          break;
        case "number":
          tipo = "number";
          break;
        case "boolean":
          tipo = "checkbox";
          break;
      }
      setPropiedad((prev) => ({
        ...prev,
        inputTipo: tipo as CampoConfigSchema["inputTipo"],
      }));
    }
  }, [propiedad.tipo]);
  const appendPropiedad = () => {
    let newArray: CampoConfigSchema[] = [];
    if (propiedadInicial) {
      newArray = [...propiedades];
      newArray[
        newArray.findIndex(
          (p) => p.uuid === propiedadInicial.uuid,
        )
      ] = propiedad;
    } else {
      newArray = [
        ...propiedades,
        { ...propiedad, uuid: crypto.randomUUID() },
      ];
    }
    setValue("propiedades", newArray);
    closeSidebar();
  };
  const isFormValid = React.useMemo(() => {
    if (!propiedad.tipo) return false;
    if (!propiedad.label?.trim()) return false;
    if (!propiedad.placeholder?.trim()) return false;
    if (visibleChecked) {
      if (!propiedad.visible?.campo) return false;
      if (
        propiedad.visible?.valor === undefined ||
        propiedad.visible?.valor === ""
      )
        return false;
    }
    return true;
  }, [propiedad, visibleChecked]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Tipo de propiedad
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Selecciona si la propiedad debe ser un número, una
          cadena de texto o un sí/no.
        </Typography>
        <TextField
          select
          label="Tipo de propiedad *"
          placeholder="Selecciona un  tipo"
          value={propiedad.tipo || ""}
          size="small"
          onChange={(e) =>
            setPropiedad({
              ...propiedad,
              tipo: e.target
                .value as CampoConfigSchema["tipo"],
              // Al cambiar de tipo, limpiamos los campos específicos
              // del tipo anterior para no arrastrar datos "basura".
              opciones: undefined,
              min: undefined,
              max: undefined,
              minLength: undefined,
              maxLength: undefined,
              regex: undefined,
              defaultValue: undefined,
            })
          }
          variant="outlined"
          fullWidth
        >
          <MenuItem value="" disabled>
            Selecciona un tipo
          </MenuItem>
          <MenuItem value="string">
            Cadena de texto
          </MenuItem>
          <MenuItem value="number">Número</MenuItem>
          <MenuItem value="boolean">
            Condicional (Sí/No)
          </MenuItem>
        </TextField>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Nombre de la propiedad
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Ingresa el nombre de la propiedad.
        </Typography>
        <TextField
          label="Nombre de la propiedad *"
          placeholder="Ej. Piezas incluidas"
          value={propiedad.label || ""}
          size="small"
          onChange={(e) =>
            setPropiedad({
              ...propiedad,
              label: e.target
                .value as CampoConfigSchema["label"],
              clave: e.target.value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // quita acentos
                .replace(/[^a-z0-9\s_]/g, "") // quita caracteres especiales
                .trim()
                .replace(/\s+/g, "_"),
            })
          }
          variant="outlined"
          fullWidth
          slotProps={{
            htmlInput: {
              min: 3,
              max: 50,
            },
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Texto de ayuda
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Texto corto que ayuda al usuario a entender el
          propósito de la propiedad.
        </Typography>
        <TextField
          label="Texto de ayuda *"
          placeholder="Ej. Ingresa x piezas"
          value={propiedad.placeholder || ""}
          size="small"
          onChange={(e) =>
            setPropiedad({
              ...propiedad,
              placeholder: e.target
                .value as CampoConfigSchema["placeholder"],
            })
          }
          variant="outlined"
          slotProps={{
            htmlInput: {
              min: 5,
              max: 50,
            },
          }}
          fullWidth
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Es obligatorio
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={propiedad.requerido || false}
              onChange={(e) =>
                setPropiedad({
                  ...propiedad,
                  requerido: e.target.checked,
                })
              }
            />
          }
          label="Indica si la propiedad es obligatoria o no."
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Visible condicionalmente
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={visibleChecked}
              onChange={(e) =>
                setVisibleChecked(e.target.checked)
              }
              disabled={
                propiedades.length === 0 ||
                propiedades.filter(
                  (p) => p.uuid !== propiedad.uuid,
                ).length === 0
              }
              sx={{
                margin: 0,
                padding: -4,
              }}
            />
          }
          label="Esta propiedad sólo debe ser visible si otra
            propiedad cumple con un valor especifico"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            visibleChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <TextField
            label="Propiedad dependiente *"
            placeholder="Propiedad dependiente"
            value={propiedad.visible?.campo || ""}
            size="small"
            onChange={(e) =>
              setPropiedad({
                ...propiedad,
                visible: {
                  campo: e.target.value,
                  valor: propiedad.visible?.valor ?? "",
                },
              })
            }
            fullWidth
            select
          >
            {propiedades.map((p) => {
              if (p.uuid === propiedad.uuid) return null;
              return (
                <MenuItem key={p.uuid} value={p.clave}>
                  {p.label}
                </MenuItem>
              );
            })}
          </TextField>
          {propiedadDependiente?.tipo === "boolean" ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    propiedad.visible?.valor === "true"
                  }
                  onChange={(e) =>
                    setPropiedad({
                      ...propiedad,
                      visible: {
                        campo:
                          propiedad.visible?.campo ?? "",
                        valor: e.target.checked.toString(),
                      },
                    })
                  }
                />
              }
              label={
                propiedad.visible?.valor === "true"
                  ? "Verdadero"
                  : "Falso"
              }
            />
          ) : (
            <TextField
              label="Valor dependiente *"
              placeholder="Ej. 5"
              size="small"
              value={propiedad.visible?.valor || ""}
              type={
                propiedad.tipo === "number"
                  ? "number"
                  : "text"
              }
              onChange={(e) =>
                setPropiedad({
                  ...propiedad,
                  visible: {
                    campo: propiedad.visible?.campo ?? "",
                    valor: e.target.value,
                  },
                })
              }
              fullWidth
            />
          )}
        </motion.div>
      </Box>
      <Divider />
      {/*Sección para propiedades de tipo string */}
      <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={
          propiedad.tipo === "string"
            ? { opacity: 1, height: "auto", y: 0 }
            : { opacity: 0, height: 0, y: -10 }
        }
        exit={{ opacity: 0, height: 0, y: -10 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <TextTypeSection
          setPropiedad={setPropiedad}
          propiedad={propiedad}
          readOnly={readonly}
          isReseting={isReseting}
        />
      </motion.div>
      {/*Sección para propiedades de tipo number */}
      <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={
          propiedad.tipo === "number"
            ? { opacity: 1, height: "auto", y: 0 }
            : { opacity: 0, height: 0, y: -10 }
        }
        exit={{ opacity: 0, height: 0, y: -10 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <NumberTypeSection
          setPropiedad={setPropiedad}
          propiedad={propiedad}
          readOnly={readonly}
          isReseting={isReseting}
        />
      </motion.div>
      {/*Sección para propiedades de tipo boolean */}
      <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={
          propiedad.tipo === "boolean"
            ? { opacity: 1, height: "auto", y: 0 }
            : { opacity: 0, height: 0, y: -10 }
        }
        exit={{ opacity: 0, height: 0, y: -10 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <BooleanTypeSection
          setPropiedad={setPropiedad}
          propiedad={propiedad}
          readOnly={readonly}
          isReseting={isReseting}
        />
      </motion.div>
      {propiedad.tipo && <Divider />}
      <Typography variant="caption" color="error">
        <b style={{ color: "red" }}>*</b> Campos
        obligatorios
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: "4px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          fullWidth
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() => reset()}
        >
          Limpiar
        </Button>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          color="primary"
          onClick={appendPropiedad}
          disabled={
            !isFormValid ||
            readonly ||
            propiedades.length >= 12
          }
        >
          {propiedadInicial ? "Actualizar" : "Agregar"}
        </Button>
      </Box>
    </Box>
  );
}

function reset(
  setPropiedad: React.Dispatch<
    React.SetStateAction<CampoConfig>
  >,
) {
  setPropiedad((prev) => ({
    ...prev,
    opciones: undefined,
  }));
}

// Sincroniza los valores de la lista con la propiedad cada vez
// que cambian, filtrando los que fueron eliminados (null).
const updateList = (
  index: number,
  value: string,
  listValues: Array<string | null>,
  setListValues: React.Dispatch<
    React.SetStateAction<Array<string | null>>
  >,
  setPropiedad: React.Dispatch<
    React.SetStateAction<CampoConfig>
  >,
  propiedad: CampoConfig,
) => {
  const newValues = [...listValues];
  newValues[index] = value;
  setListValues(newValues);
  setPropiedad({
    ...propiedad,
    opciones: newValues.filter(
      (v): v is string => v !== null && v !== "",
    ),
  });
};

const removeInput = (
  index: number,
  listValues: Array<string | null>,
  setListValues: React.Dispatch<
    React.SetStateAction<Array<string | null>>
  >,
  setPropiedad: React.Dispatch<
    React.SetStateAction<CampoConfig>
  >,
  propiedad: CampoConfig,
) => {
  const newValues = [...listValues];
  newValues[index] = null;
  setListValues(newValues);
  setPropiedad({
    ...propiedad,
    opciones: newValues.filter(
      (v): v is string => v !== null && v !== "",
    ),
  });
};

const NumberTypeSection = ({
  setPropiedad,
  propiedad,
  readOnly,
  isReseting,
}) => {
  function resetListValues() {
    setPropiedad((prev) => ({
      ...prev,
      opciones: undefined,
    }));
    setListValues([]);
    setInputCount(1);
    setListChecked(false);
  }
  function resetMinMaxValue() {
    setPropiedad((prev) => ({
      ...prev,
      max: undefined,
      min: undefined,
    }));
    setMinValueChecked(false);
    setMaxValueChecked(false);
  }
  function resetDefaultValue() {
    setPropiedad((prev) => ({
      ...prev,
      defaultValue: undefined,
    }));
    setDefaultValueChecked(false);
  }
  const [listChecked, setListChecked] = React.useState(
    propiedad.opciones?.length > 0 || false,
  );
  const [inputCount, setInputCount] = React.useState(
    propiedad.opciones?.length || 1,
  );
  const [listValues, setListValues] = React.useState<
    Array<string | null>
  >(propiedad.opciones || []);
  const [defaultValueChecked, setDefaultValueChecked] =
    React.useState(propiedad.defaultValue !== undefined);
  const [minValueChecked, setMinValueChecked] =
    React.useState(propiedad.min !== undefined);
  const [maxValueChecked, setMaxValueChecked] =
    React.useState(propiedad.max !== undefined);
  React.useEffect(() => {
    if (isReseting) {
      resetListValues();
      resetMinMaxValue();
      resetDefaultValue();
    }
  }, [isReseting]);

  React.useEffect(() => {
    if (maxValueChecked || minValueChecked) {
      resetListValues();
      resetDefaultValue();
    }
  }, [maxValueChecked, minValueChecked]);
  React.useEffect(() => {
    if (listChecked) {
      resetMinMaxValue();
      resetDefaultValue();
    }
  }, [listChecked]);

  const addListInput = () => {
    setInputCount((prev) => prev + 1);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Lista desplegable
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={listChecked}
              onChange={(e) => {
                setListChecked(e.target.checked);
                if (!e.target.checked) {
                  setListValues([]);
                  setPropiedad({
                    ...propiedad,
                    opciones: undefined,
                  });
                }
              }}
              disabled={readOnly}
            />
          }
          label="Seleccionar desde una lista de valores predefinidos"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            listChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {Array.from({ length: inputCount }).map(
            (_, index) => {
              return listValues[index] === null ? null : (
                <TextField
                  key={`Opción ${index + 1}`}
                  label={`Valor ${index + 1}`}
                  type="number"
                  value={listValues[index] || ""}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateList(
                      index,
                      e.target.value,
                      listValues,
                      setListValues,
                      setPropiedad,
                      propiedad,
                    )
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() =>
                            index === 0
                              ? addListInput()
                              : removeInput(
                                  index,
                                  listValues,
                                  setListValues,
                                  setPropiedad,
                                  propiedad,
                                )
                          }
                          disabled={readOnly}
                        >
                          {index === 0 ? (
                            <Add />
                          ) : (
                            <Remove />
                          )}
                        </IconButton>
                      ),
                    },
                  }}
                  size="small"
                  fullWidth
                />
              );
            },
          )}
        </motion.div>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Rango de valores
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={minValueChecked}
              onChange={(e) => {
                setMinValueChecked(e.target.checked);
                if (!e.target.checked) {
                  setPropiedad({
                    ...propiedad,
                    min: undefined,
                  });
                }
              }}
              disabled={readOnly}
            />
          }
          label="Agregar un valor mínimo"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            minValueChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <TextField
            label={`Agregar valor mínimo`}
            type="number"
            value={propiedad.min}
            disabled={readOnly}
            onChange={(e) => {
              setPropiedad({
                ...propiedad,
                min: e.target.value,
              });
            }}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
            fullWidth
            size="small"
          />
        </motion.div>
        <FormControlLabel
          control={
            <Switch
              checked={maxValueChecked}
              onChange={(e) => {
                setMaxValueChecked(e.target.checked);
                if (!e.target.checked) {
                  setPropiedad({
                    ...propiedad,
                    max: undefined,
                  });
                }
              }}
              disabled={readOnly}
            />
          }
          label="Agregar un valor máximo"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            maxValueChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <TextField
            label={`Agregar valor máximo`}
            type="number"
            value={propiedad.max}
            disabled={readOnly}
            onChange={(e) => {
              setPropiedad({
                ...propiedad,
                max: e.target.value,
              });
            }}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
            fullWidth
            size="small"
          />
        </motion.div>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Valor por defecto
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={defaultValueChecked}
              onChange={(e) => {
                setDefaultValueChecked(e.target.checked);
                if (!e.target.checked) {
                  setPropiedad({
                    ...propiedad,
                    defaultValue: undefined,
                  });
                }
              }}
              disabled={readOnly}
            />
          }
          label="Agregar un valor por defecto"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            defaultValueChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {propiedad.opciones &&
          propiedad.opciones.length > 0 ? (
            <TextField
              label={`Agregar valor por defecto`}
              type="number"
              value={propiedad.defaultValue}
              disabled={readOnly}
              onChange={(e) => {
                setPropiedad({
                  ...propiedad,
                  defaultValue: e.target.value,
                });
              }}
              select
              size="small"
              fullWidth
            >
              {propiedad.opciones.map((opcion) => (
                <MenuItem key={opcion} value={opcion}>
                  {opcion}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label={`Agregar valor por defecto`}
              type="number"
              value={propiedad.defaultValue}
              disabled={readOnly}
              onChange={(e) => {
                setPropiedad({
                  ...propiedad,
                  defaultValue: e.target.value,
                });
              }}
              slotProps={{
                htmlInput: {
                  min: propiedad.min || 0,
                  max: propiedad.max || undefined,
                },
              }}
              size="small"
              fullWidth
            />
          )}
        </motion.div>
      </Box>
    </>
  );
};

const TextTypeSection = ({
  setPropiedad,
  propiedad,
  readOnly,
  isReseting,
}) => {
  function resetListValues() {
    reset(setPropiedad);
    setListValues([]);
    setInputCount(1);
    setListChecked(false);
  }
  function resetMinMaxValue() {
    setPropiedad((prev) => ({
      ...prev,
      maxLength: undefined,
      minLength: undefined,
    }));
    setMinRangeChecked(false);
    setMaxRangeChecked(false);
  }
  function resetDefaultValue() {
    reset(setPropiedad);
    setDefaultValueChecked(false);
  }
  function resetRegexValue() {
    setPropiedad((prev) => ({
      ...prev,
      regex: undefined,
    }));
    setRegexChecked(false);
    setCustomRegex("");
  }
  const [listChecked, setListChecked] = React.useState(
    propiedad.opciones?.length > 0 || false,
  );
  const [inputCount, setInputCount] = React.useState(
    propiedad.opciones?.length || 1,
  );
  const [listValues, setListValues] = React.useState<
    Array<string | null>
  >(propiedad.opciones || []);
  const [defaultValueChecked, setDefaultValueChecked] =
    React.useState(propiedad.defaultValue !== undefined);
  const [regexChecked, setRegexChecked] = React.useState(
    propiedad.regex !== undefined,
  );
  // Guarda el texto de la regex personalizada por separado,
  // así el select puede seguir mostrando la opción "custom"
  // aunque el usuario ya haya escrito su propia expresión.
  const [customRegex, setCustomRegex] = React.useState(
    propiedad.regex &&
      !regexOptions.some((o) => o.value === propiedad.regex)
      ? propiedad.regex
      : "",
  );
  const [minRangeChecked, setMinRangeChecked] =
    React.useState(propiedad.minLength !== undefined);
  const [maxRangeChecked, setMaxRangeChecked] =
    React.useState(propiedad.maxLength !== undefined);
  React.useEffect(() => {
    if (isReseting) {
      resetListValues();
      resetMinMaxValue();
      resetDefaultValue();
      resetRegexValue();
    }
  }, [isReseting]);

  React.useEffect(() => {
    if (maxRangeChecked || minRangeChecked) {
      resetListValues();
      resetDefaultValue();
      resetRegexValue();
    }
  }, [maxRangeChecked, minRangeChecked]);
  React.useEffect(() => {
    if (listChecked) {
      resetMinMaxValue();
      resetDefaultValue();
      resetRegexValue();
    }
  }, [listChecked]);

  const addListInput = () => {
    setInputCount((prev) => prev + 1);
  };

  // El select guarda "custom" cuando corresponde a una regex propia,
  // pero lo que se persiste en `propiedad.regex` es siempre la
  // expresión regular final (predefinida o personalizada).
  const regexSelectValue = customRegex
    ? "custom"
    : propiedad.regex || "";

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Lista desplegable
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={listChecked}
              onChange={(e) => {
                setListChecked(e.target.checked);
                if (!e.target.checked) {
                  setListValues([]);
                  setPropiedad({
                    ...propiedad,
                    opciones: undefined,
                  });
                }
              }}
              disabled={readOnly}
            />
          }
          label="Seleccionar desde una lista de valores predefinidos"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            listChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {Array.from({ length: inputCount }).map(
            (_, index) => {
              return listValues[index] === null ? null : (
                <TextField
                  key={`Opción ${index + 1}`}
                  label={`Valor ${index + 1}`}
                  type="text"
                  value={listValues[index] || ""}
                  disabled={readOnly}
                  fullWidth
                  onChange={(e) =>
                    updateList(
                      index,
                      e.target.value,
                      listValues,
                      setListValues,
                      setPropiedad,
                      propiedad,
                    )
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() =>
                            index === 0
                              ? addListInput()
                              : removeInput(
                                  index,
                                  listValues,
                                  setListValues,
                                  setPropiedad,
                                  propiedad,
                                )
                          }
                          disabled={readOnly}
                        >
                          {index === 0 ? (
                            <Add />
                          ) : (
                            <Remove />
                          )}
                        </IconButton>
                      ),
                    },
                  }}
                  size="small"
                />
              );
            },
          )}
        </motion.div>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Rango de longitud (carácteres)
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={minRangeChecked}
              onChange={(e) => {
                setMinRangeChecked(e.target.checked);
                if (!e.target.checked) {
                  setPropiedad({
                    ...propiedad,
                    minLength: undefined,
                  });
                }
              }}
              disabled={readOnly}
            />
          }
          label="Agregar una longitud mínima"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            minRangeChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <TextField
            label={`Agregar longitud  mínima`}
            type="number"
            value={propiedad.minLength}
            disabled={readOnly}
            onChange={(e) => {
              setPropiedad({
                ...propiedad,
                minLength: e.target.value,
              });
            }}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
            fullWidth
            size="small"
          />
        </motion.div>
        <FormControlLabel
          control={
            <Switch
              checked={maxRangeChecked}
              onChange={(e) => {
                setMaxRangeChecked(e.target.checked);
                if (!e.target.checked) {
                  setPropiedad({
                    ...propiedad,
                    maxLength: undefined,
                  });
                }
              }}
              disabled={readOnly}
            />
          }
          label="Agregar una longitud máxima"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            maxRangeChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <TextField
            label={`Agregar longitud  máxima`}
            type="number"
            value={propiedad.maxLength}
            disabled={readOnly}
            onChange={(e) => {
              setPropiedad({
                ...propiedad,
                maxLength: e.target.value,
              });
            }}
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
            fullWidth
            size="small"
          />
        </motion.div>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Valor por defecto
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={defaultValueChecked}
              onChange={(e) => {
                setDefaultValueChecked(e.target.checked);
                if (!e.target.checked) {
                  setPropiedad({
                    ...propiedad,
                    defaultValue: undefined,
                  });
                }
              }}
              disabled={readOnly}
            />
          }
          label="Agregar un valor por defecto"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            defaultValueChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {propiedad.opciones &&
          propiedad.opciones.length > 0 ? (
            <TextField
              label={`Agregar valor por defecto`}
              type="text"
              value={propiedad.defaultValue}
              disabled={readOnly}
              onChange={(e) => {
                setPropiedad({
                  ...propiedad,
                  defaultValue: e.target.value,
                });
              }}
              select
              size="small"
              fullWidth
            >
              {propiedad.opciones.map((opcion) => (
                <MenuItem key={opcion} value={opcion}>
                  {opcion}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label={`Agregar valor por defecto`}
              type="text"
              value={propiedad.defaultValue}
              disabled={readOnly}
              onChange={(e) => {
                setPropiedad({
                  ...propiedad,
                  defaultValue: e.target.value,
                });
              }}
              slotProps={{
                htmlInput: {
                  minLength: propiedad.minLength || 0,
                  maxLength:
                    propiedad.maxLength || undefined,
                },
              }}
              size="small"
              fullWidth
            />
          )}
        </motion.div>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          color="secondary"
          sx={{ fontWeight: "600" }}
        >
          Formato de texto
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={regexChecked}
              onChange={(e) => {
                setRegexChecked(e.target.checked);
                if (!e.target.checked) {
                  setPropiedad({
                    ...propiedad,
                    regex: undefined,
                  });
                  setCustomRegex("");
                }
              }}
              disabled={readOnly}
            />
          }
          label="Esta propiedad debe cumplir con un formato específico (expresión regular)"
          sx={{
            color: "text.secondary",
            fontSize: "0.75rem",
            "& .MuiFormControlLabel-label": {
              fontSize: "0.75rem",
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={
            regexChecked
              ? { opacity: 1, height: "auto", y: 0 }
              : { opacity: 0, height: 0, y: -10 }
          }
          exit={{ opacity: 0, height: 0, y: -10 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
            marginTop: "4px",
          }}
        >
          <TextField
            label={`Agregar un formato de texto (expresión regular)`}
            type="text"
            value={regexSelectValue}
            disabled={readOnly}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "custom") {
                setCustomRegex(customRegex || " ");
                setPropiedad({
                  ...propiedad,
                  regex: customRegex || "",
                });
              } else {
                setCustomRegex("");
                setPropiedad({
                  ...propiedad,
                  regex: value,
                });
              }
            }}
            size="small"
            fullWidth
            select
          >
            {regexOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {regexSelectValue === "custom" && (
            <TextField
              label={`Formato (expresión regular)`}
              type="text"
              value={customRegex.trim()}
              disabled={readOnly}
              onChange={(e) => {
                setCustomRegex(e.target.value);
                setPropiedad({
                  ...propiedad,
                  regex: e.target.value,
                });
              }}
              size="small"
              fullWidth
            />
          )}
        </motion.div>
      </Box>
    </>
  );
};

const BooleanTypeSection = ({
  setPropiedad,
  propiedad,
  readOnly,
  isReseting,
}) => {
  function resetDefaultValue() {
    reset(setPropiedad);
    setDefaultValueChecked(false);
  }
  const [defaultValueChecked, setDefaultValueChecked] =
    React.useState(propiedad.defaultValue !== undefined);
  React.useEffect(() => {
    if (isReseting) {
      resetDefaultValue();
    }
  }, [isReseting]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="h6"
        color="secondary"
        sx={{ fontWeight: "600" }}
      >
        Valor por defecto
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={defaultValueChecked}
            onChange={(e) => {
              setDefaultValueChecked(e.target.checked);
              if (!e.target.checked) {
                setPropiedad({
                  ...propiedad,
                  defaultValue: undefined,
                });
              }
            }}
            disabled={readOnly}
          />
        }
        label="Agregar un valor por defecto"
        sx={{
          color: "text.secondary",
          fontSize: "0.75rem",
          "& .MuiFormControlLabel-label": {
            fontSize: "0.75rem",
          },
        }}
      />
      <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={
          defaultValueChecked
            ? { opacity: 1, height: "auto", y: 0 }
            : { opacity: 0, height: 0, y: -10 }
        }
        exit={{ opacity: 0, height: 0, y: -10 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <RadioGroup
          value={propiedad.defaultValue || ""}
          onChange={(e) =>
            setPropiedad({
              ...propiedad,
              defaultValue: e.target.value,
            })
          }
        >
          <FormControlLabel
            value="true"
            control={<Radio />}
            label="Verdadero"
          />
          <FormControlLabel
            value="false"
            control={<Radio />}
            label="Falso"
          />
        </RadioGroup>
      </motion.div>
    </Box>
  );
};

const regexOptions = [
  { label: "Solo texto", value: "^[A-Za-z]+$" },
  { label: "Solo números", value: "^[0-9]+$" },
  {
    label: "Solo letras y números",
    value: "^[A-Za-z0-9]+$",
  },
  { label: "Personalizado", value: "custom" },
];
